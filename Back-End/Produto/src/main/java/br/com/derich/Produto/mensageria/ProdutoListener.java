package br.com.derich.Produto.mensageria;

import br.com.derich.Produto.DTO.VendaDTO;
import br.com.derich.Produto.service.ProdutoService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProdutoListener {

    @Autowired
    private ProdutoService produtoService;

    @RabbitListener(queues = "venda.finalizada")
    public void processarVenda(VendaDTO vendaDTO) {
        for (VendaDTO.ProdutoCompradoDTO produto : vendaDTO.getProdutos()) {
            produtoService.atualizarEstoque(produto.getProdutoId(), produto.getQuantidade());
        }
        System.out.println("Estoque atualizado para venda " + vendaDTO.getVendaId());
    }
}

