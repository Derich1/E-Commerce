package br.com.derich.Venda.controller;

import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.handler.CompraFreteHandler;
import br.com.derich.Venda.repository.IVendaRepository;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.resources.payment.Payment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Endpoint que recebe as notificações do mercado pago em relação ao status da venda
@RestController
@RequestMapping("/webhook")
public class WebHookController {

    private static final Logger logger = LoggerFactory.getLogger(WebHookController.class);

    @Autowired
    private IVendaRepository vendaRepository;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/notificacao")
    public ResponseEntity<String> receberNotificacao(@RequestBody(required = false) Map<String, Object> payload) {
        try {
            logger.info("Webhook recebido: {}", payload);

            if (payload == null || !payload.containsKey("data")) {
                return ResponseEntity.ok("Notificação recebida sem dados relevantes");
            }

            Map<String, Object> data = (Map<String, Object>) payload.get("data");

            if (data == null || !data.containsKey("id")) {
                return ResponseEntity.ok("Notificação recebida sem ID de pagamento");
            }

            String pagamentoIdStr = String.valueOf(data.get("id"));
            Long pagamentoId = Long.parseLong(pagamentoIdStr);

            PaymentClient client = new PaymentClient();
            Payment payment = client.get(pagamentoId);

            Venda venda = vendaRepository.findByPagamentoId(pagamentoId);
            if (venda == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Venda não encontrada");
            }

            venda.setStatus(payment.getStatus());
            vendaRepository.save(venda);

            return ResponseEntity.ok("Status atualizado: " + payment.getStatus());

        } catch (MPApiException e) {
            logger.error("Erro no webhook do Mercado Pago: {}", e.getApiResponse().getContent());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno");
        } catch (Exception e) {
            logger.error("Erro no webhook do Mercado Pago", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno");
        }
    }
}

