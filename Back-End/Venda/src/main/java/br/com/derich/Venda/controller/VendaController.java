package br.com.derich.Venda.controller;

import br.com.derich.Venda.DTO.PagamentoRequestDTO;
import br.com.derich.Venda.DTO.VendaDTO;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.service.VendaService;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<String> criarVenda(@RequestBody VendaDTO vendaDTO) {
        Venda venda = vendaService.salvarVenda(vendaDTO);

        rabbitTemplate.convertAndSend(QUEUE_NAME, vendaDTO);

        return ResponseEntity.ok("Venda realizada com sucesso! ID: " + venda.getId());
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
