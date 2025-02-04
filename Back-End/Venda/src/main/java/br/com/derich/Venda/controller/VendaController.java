package br.com.derich.Venda.controller;

import br.com.derich.Venda.DTO.VendaDTO;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.service.VendaService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/venda")
public class VendaController {

    @Autowired
    private VendaService vendaService;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    private static final String QUEUE_NAME = "venda.finalizada";

    @PostMapping
    public ResponseEntity<String> criarVenda(@RequestBody VendaDTO vendaDTO) {
        // 1. Salvar a venda no banco de dados
        Venda venda = vendaService.salvarVenda(vendaDTO);

        // 2. Publicar a venda no RabbitMQ
        rabbitTemplate.convertAndSend(QUEUE_NAME, vendaDTO);

        return ResponseEntity.ok("Venda realizada com sucesso! ID: " + venda.getId());
    }
}
