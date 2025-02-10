package br.com.derich.Venda.controller;

import br.com.derich.DTO.VendaDTO;
import br.com.derich.Venda.DTO.PagamentoRequestDTO;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.service.VendaService;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import com.mercadopago.resources.preference.PreferenceItem;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
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

    @Autowired
    private RabbitTemplate rabbitTemplate;

    private static final String QUEUE_NAME = "venda.finalizada";

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public ResponseEntity<?> criarVenda(@RequestBody VendaDTO vendaDTO) {
        Venda venda = vendaService.salvarVenda(vendaDTO);

        rabbitTemplate.convertAndSend(QUEUE_NAME, vendaDTO);

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
//                    .backUrls(
//                            PreferenceBackUrlsRequest.builder()
//                                    .success("http://www.your-site.com/success")
//                                    .failure("http://www.your-site.com/failure")
//                                    .pending("http://www.your-site.com/pending")
//                                    .build()
//                    )
                    .autoReturn("approved")
                    .build();

            Preference response = client.create(preferenceRequest);
            return ResponseEntity.ok(Map.of("preferenceId", response.getId()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao criar a preferência: " + e.getMessage());
        }

    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/{id}/pagamento")
    public ResponseEntity<?> processarPagamento(@PathVariable String id, @RequestBody PagamentoRequestDTO request) {
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
