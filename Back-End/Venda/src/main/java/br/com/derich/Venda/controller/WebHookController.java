package br.com.derich.Venda.controller;

import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.repository.IVendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    @PostMapping
    public ResponseEntity<String> receberNotificacao(@RequestBody Map<String, Object> payload) {
        System.out.println("Notificação recebida: " + payload);

        // Acessando o ID do pagamento de dentro do "data" e o status
        Map<String, Object> data = (Map<String, Object>) payload.get("data"); // Acessa o objeto "data"
        String pagamentoId = (String) data.get("id"); // Acessa o pagamentoId dentro de "data"
        String status = (String) payload.get("status"); // Acessa o status diretamente do payload

        // Buscar a venda pelo pagamentoId (o pagamentoId pode ser armazenado em um campo na Venda)
        Venda venda = vendaRepository.findByPagamentoId(pagamentoId);
        if (venda != null) {
            if ("approved".equalsIgnoreCase(status)) {
                venda.setStatus("PAGA");
            } else {
                venda.setStatus("FALHOU");
            }
            vendaRepository.save(venda);
        } else {
            // Caso não encontre a venda, pode ser uma boa ideia retornar um erro ou logar isso
            System.out.println("Venda não encontrada para o pagamentoId: " + pagamentoId);
        }

        return ResponseEntity.ok("Recebido com sucesso!");
    }

}

