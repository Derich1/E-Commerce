package br.com.derich.Venda.controller;

import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.repository.IVendaRepository;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.resources.payment.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Endpoint que recebe as notificações do mercado pago em relação ao status da venda
@RestController
@RequestMapping("/webhook")
public class WebHookController {

    @Autowired
    private IVendaRepository vendaRepository;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/notificacao")
    public ResponseEntity<String> receberNotificacao(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            String pagamentoIdStr = (String) data.get("id");
            Long pagamentoId = Long.parseLong(pagamentoIdStr);

            // Buscar dados completos do pagamento
            PaymentClient client = new PaymentClient();
            Payment payment = client.get(pagamentoId);

            Venda venda = vendaRepository.findByPagamentoId(pagamentoId);
            if (venda == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Venda não encontrada");
            }

            venda.setStatus(payment.getStatus());
            vendaRepository.save(venda);

            return ResponseEntity.ok("Status atualizado: " + payment.getStatus());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro: " + e.getMessage());
        }
    }

}

