//package br.com.derich.Produto.mensageria;
//
//import br.com.derich.DTO.VendaDTO;
//import br.com.derich.Produto.service.ProdutoService;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.springframework.amqp.rabbit.annotation.RabbitListener;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
//@Component
//public class ProdutoListener {
//
//    @Autowired
//    private ProdutoService produtoService;
//
//    private final ObjectMapper objectMapper;
//
//    public ProdutoListener(ObjectMapper objectMapper) {
//        this.objectMapper = objectMapper;
//    }
//
//    @RabbitListener(queues = "venda.finalizada")
//    public void processarVenda(String message) {
//        try {
//            System.out.println("Mensagem recebida: " + message); // Log da mensagem recebida
//            VendaDTO venda = objectMapper.readValue(message, VendaDTO.class);
//            System.out.println("Venda recebida: " + venda);
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }
//
//}
//
