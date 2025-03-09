package br.com.derich.Venda.controller;

import br.com.derich.DTO.VendaDTO;
import br.com.derich.Venda.DTO.PagamentoCartaoRequestDTO;
import br.com.derich.Venda.DTO.PaymentPixRequestDTO;
import br.com.derich.Venda.DTO.PaymentResponseDTO;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.repository.IVendaRepository;
import br.com.derich.Venda.service.VendaService;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.client.preference.*;
import com.mercadopago.core.MPRequestOptions;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@RestController
@RequestMapping("/venda")
public class VendaController {

    @Autowired
    private VendaService vendaService;

    @Autowired
    private IVendaRepository vendaRepository;

//    @Autowired
//    private RabbitTemplate rabbitTemplate;

//    private static final String QUEUE_NAME = "venda.finalizada";

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/criar")
    public ResponseEntity<?> criarVenda(@Valid @RequestBody VendaDTO vendaDTO) {

        Venda venda = vendaService.salvarVenda(vendaDTO);

//        rabbitTemplate.convertAndSend(QUEUE_NAME, vendaDTO);

        // Criar a preferência de pagamento no Mercado Pago
        try {
            // Cria um objeto preferência
            PreferenceClient client = new PreferenceClient();

            // Cria itens na preferência
            List<PreferenceItemRequest> items = new ArrayList<>();

            for (var produto : vendaDTO.getProdutos()) { // Supondo que vendaDTO tenha uma lista de produtos
                PreferenceItemRequest item =
                        PreferenceItemRequest.builder()
                                .id(String.valueOf(produto.getProdutoId())) // ID do produto
                                .title(produto.getNome()) // Nome do produto
                                .quantity(produto.getQuantidade()) // Quantidade
                                .currencyId("BRL") // Moeda
                                .unitPrice(new BigDecimal(produto.getPrecoUnitario())) // Preço unitário
                                .build();

                items.add(item);
            }

            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .payer(
                            PreferencePayerRequest.builder()
                                    .email(vendaDTO.getEmailCliente()) // Supondo que vendaDTO tenha email do cliente
                                    .build()
                    )
                    .backUrls(
                            PreferenceBackUrlsRequest.builder()
                                    .success("http://localhost:80/sucesso")
                                    .failure("http://localhost:80/falha")
                                    .pending("http://localhost:80/pendente")
                                    .build()
                    )
                    .autoReturn("approved")
                    .build();

            Preference response = client.create(preferenceRequest);
            return ResponseEntity.ok(Map.of(
                    "id", venda.getId(),
                    "preferenceId", response.getId()
            ));

        } catch (MPApiException ex) {
            System.out.printf(
                    "MercadoPago Error. Status: %s, Content: %s%n",
                    ex.getApiResponse().getStatusCode(), ex.getApiResponse().getContent());
        } catch (MPException ex) {
            ex.printStackTrace();
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarVenda(@PathVariable String id, @RequestBody VendaDTO vendaDTO) {
        try {
            Venda vendaAtualizada = vendaService.atualizarVenda(id, vendaDTO);
            return ResponseEntity.ok(vendaAtualizada);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao atualizar venda: " + e.getMessage());
        }
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/processarPagamento")
    public ResponseEntity<PaymentResponseDTO> processarPagamento(@RequestBody PagamentoCartaoRequestDTO pagamentoCartaoRequestDTO) throws Exception {
        PaymentResponseDTO payment = vendaService.processarPagamento(pagamentoCartaoRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/pedidos")
    public ResponseEntity<Page<Venda>> mostrarVendas(String email, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("dataVenda")));

        Page<Venda> vendas = vendaRepository.findByEmailClienteOrderByDataVendaDesc(email, pageable);

        return ResponseEntity.ok(vendas);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/pix")
    public ResponseEntity<?> pix(@RequestBody PaymentPixRequestDTO request) {

        try {
            System.out.println("Método de pagamento recebido: " + request.getPaymentMethodId());

            Payment pagamento = vendaService.pix(request);
            System.out.println("Pagamento criado: " + pagamento);


            // Valide se os dados do Pix existem
            if (pagamento.getPointOfInteraction() == null ||
                    pagamento.getPointOfInteraction().getTransactionData() == null) {
                System.out.println("Dados do Pix não encontrados na resposta do Mercado Pago");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Dados do Pix não gerados"));
            }

                System.out.println("QR Code: " + pagamento.getPointOfInteraction().getTransactionData().getQrCode());
                System.out.println("QR Code Base64: " + pagamento.getPointOfInteraction().getTransactionData().getQrCodeBase64());

                return ResponseEntity.ok(Map.of(
                        "status", pagamento.getStatus(),
                        "pix_data", Map.of(
                                "qr_code", pagamento.getPointOfInteraction().getTransactionData().getQrCode(),
                                "qr_code_base64", pagamento.getPointOfInteraction().getTransactionData().getQrCodeBase64()
                        )
                ));
        } catch (MPApiException ex) {
            System.out.println("Erro MP API - Status: " + ex.getStatusCode());
            System.out.println("Conteúdo: " + ex.getApiResponse().getContent());
            return ResponseEntity.status(ex.getStatusCode())
            .body(Map.of("error", ex.getMessage()));
            } catch (Exception ex) {
            System.out.println("Erro inesperado: " + ex.getMessage());
            ex.printStackTrace(); // Isso aparecerá nos logs do servidor
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Erro interno: " + ex.getMessage()));
            }
        }

}