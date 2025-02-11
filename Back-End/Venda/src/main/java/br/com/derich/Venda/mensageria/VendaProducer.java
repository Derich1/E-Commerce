//package br.com.derich.Venda.mensageria;
//
//import br.com.derich.DTO.VendaDTO;
//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.springframework.amqp.rabbit.core.RabbitTemplate;
//import org.springframework.stereotype.Service;
//
//@Service
//public class VendaProducer {
//
//    private RabbitTemplate rabbitTemplate;
//
//    private final ObjectMapper objectMapper;
//
//    private static final String QUEUE_NAME = "venda.finalizada";
//
//    public VendaProducer(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
//        this.rabbitTemplate = rabbitTemplate;
//        this.objectMapper = objectMapper;
//    }
//
//    public void enviarVenda(VendaDTO vendaDTO) {
//        try {
//            String json = objectMapper.writeValueAsString(vendaDTO);
//            System.out.println("Mensagem enviada para o RabbitMQ: " + json);  // Log para conferir o formato da mensagem
//            rabbitTemplate.convertAndSend("nome_da_exchange", "routing_key", json);
//        } catch (JsonProcessingException e) {
//            e.printStackTrace();
//        }
//    }
//}
//
