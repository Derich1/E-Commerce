package br.com.derich.Venda.controller;

import br.com.derich.DTO.VendaDTO;
import br.com.derich.Venda.DTO.PagamentoRequestDTO;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.service.VendaService;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/venda")
public class VendaController {

    @Autowired
    private VendaService vendaService;

//    @Autowired
//    private RabbitTemplate rabbitTemplate;

//    private static final String QUEUE_NAME = "venda.finalizada";

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public ResponseEntity<?> criarVenda(@RequestBody VendaDTO vendaDTO) {
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
    @PostMapping("/{id}/pagamento")
    public ResponseEntity<?> processarPagamento(@PathVariable String id, @RequestBody PagamentoRequestDTO request) {

        System.out.println("Dados enviados ao Mercado Pago: " + request);

        try {
            Payment pagamento = vendaService.processarPagamento(id, request);
            String status = pagamento.getStatus();
            if ("approved".equalsIgnoreCase(status)) {
                return ResponseEntity.ok(Map.of("status", "success", "message", "Pagamento aprovado"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("status", "error", "message", "Pagamento recusado", "details", status));
            }
        } catch (MPException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro: " + e.getMessage());
        }
    }
}
