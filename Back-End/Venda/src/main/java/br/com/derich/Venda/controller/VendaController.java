package br.com.derich.Venda.controller;

import br.com.derich.DTO.VendaDTO;
import br.com.derich.Venda.DTO.PagamentoCartaoRequestDTO;
import br.com.derich.Venda.DTO.PaymentPixRequestDTO;
import br.com.derich.Venda.DTO.PaymentResponseDTO;
import br.com.derich.Venda.DTO.melhorenvio.*;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.exception.ApiException;
import br.com.derich.Venda.handler.CompraFreteHandler;
import br.com.derich.Venda.handler.GeracaoEtiquetaHandler;
import br.com.derich.Venda.handler.ImprimirEtiquetaHandler;
import br.com.derich.Venda.repository.IVendaRepository;
import br.com.derich.Venda.service.VendaService;
import com.mercadopago.client.preference.*;
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

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Stream;

@RestController
@RequestMapping("/venda")
public class VendaController {

    @Autowired
    private VendaService vendaService;

//    @Autowired
//    private RabbitTemplate rabbitTemplate;

//    private static final String QUEUE_NAME = "venda.finalizada";

    private final CompraFreteHandler compraFreteHandler;
    private final GeracaoEtiquetaHandler geracaoEtiquetaHandler;
    private final ImprimirEtiquetaHandler impressaoEtiquetaHandler;
    private final IVendaRepository vendaRepository;

    @Autowired
    public VendaController(
            CompraFreteHandler compraFreteHandler,
            GeracaoEtiquetaHandler geracaoEtiquetaHandler,
            ImprimirEtiquetaHandler impressaoEtiquetaHandler,
            IVendaRepository vendaRepository) {

        this.compraFreteHandler = compraFreteHandler;
        this.geracaoEtiquetaHandler = geracaoEtiquetaHandler;
        this.impressaoEtiquetaHandler = impressaoEtiquetaHandler;
        this.vendaRepository = vendaRepository;
    }

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

            double pesoTotal = venda.getProdutos().stream()
                    .mapToDouble(p -> p.getWeight() * p.getQuantidade())
                    .sum();

            System.out.println("Peso total no controller: " + pesoTotal);
            return ResponseEntity.ok(Map.of(
                    "id", venda.getId(),
                    "preferenceId", response.getId(),
                    "vendaPeso", pesoTotal
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

    // Melhor envio

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/calcularFrete")
    public ResponseEntity<?> calcularFrete(@RequestBody FreteRequest request) throws IOException, InterruptedException {
        String resposta = vendaService.calcularFrete(request);

        return ResponseEntity.ok(resposta);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/inserirFrete")
    public ResponseEntity<?> inserirFrete(@RequestBody EntregaRequest request) throws IOException, InterruptedException {
        String resposta = vendaService.inserirFretesNoCarrinhoMelhorEnvio(request);

        return ResponseEntity.ok(resposta);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/comprarFrete")
    public ResponseEntity<?> comprarFrete(@RequestBody String idVenda) {
        try {
            Venda venda = vendaRepository.findById(idVenda)
                    .orElseThrow(() -> new RuntimeException("Venda não encontrada"));

            compraFreteHandler.executar(venda);
            return ResponseEntity.ok("Frete comprado com sucesso");

        } catch (ApiException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "erro", e.getErrorCode(),
                            "mensagem", e.getMessage()
                    ));
        }
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/gerarEtiqueta")
    public ResponseEntity<?> gerarEtiqueta(@RequestBody String idVenda) {
        try {
            Venda venda = vendaRepository.findById(idVenda)
                    .orElseThrow(() -> new RuntimeException("Venda não encontrada"));

            geracaoEtiquetaHandler.executar(venda);
            return ResponseEntity.ok("Etiqueta gerada com sucesso");

        } catch (ApiException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "erro", e.getErrorCode(),
                            "mensagem", e.getMessage()
                    ));
        }
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/imprimirEtiqueta")
    public ResponseEntity<?> imprimirEtiqueta(@RequestBody String idVenda) {
        try {
            Venda venda = vendaRepository.findById(idVenda)
                    .orElseThrow(() -> new RuntimeException("Venda não encontrada"));

            impressaoEtiquetaHandler.executar(venda);
            return ResponseEntity.ok("Etiqueta impressa com sucesso");

        } catch (ApiException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "erro", e.getErrorCode(),
                            "mensagem", e.getMessage()
                    ));
        }
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/rastrearEnvio")
    public ResponseEntity<?> rastrearEnvio(@RequestBody String id) throws IOException, InterruptedException {
        String resposta = vendaService.rastrearEnvio(id);

        return ResponseEntity.ok(resposta);
    }
}