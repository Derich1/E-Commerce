package br.com.derich.Venda.mensageria;

import br.com.derich.Venda.DTO.VendaDTO;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VendaProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    private static final String QUEUE_NAME = "venda.finalizada";

    public void enviarVenda(VendaDTO vendaDTO) {
        rabbitTemplate.convertAndSend(QUEUE_NAME, vendaDTO);
        System.out.println("Venda enviada para RabbitMQ: " + vendaDTO.getVendaId());
    }
}

