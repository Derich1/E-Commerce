package br.com.derich.Produto.service;

import br.com.derich.Produto.entity.Produto;
import br.com.derich.Produto.repository.IProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Validated
@Service
public class ProdutoService {

    @Autowired
    private IProdutoRepository produtoRepository;

    public Produto cadastrarProduto(Produto produto){
        return produtoRepository.save(produto);
    }

    public List<Produto> listarProdutos() {
        return produtoRepository.findAll();
    }

    public Produto buscarProdutoPorId(String id) {
        return produtoRepository.findById(id).orElse(null);
    }

    public void atualizarEstoque(String produtoId, int quantidade) {
        // Lógica real de atualização de estoque
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        if (produto.getEstoque() < quantidade) {
            throw new RuntimeException("Estoque insuficiente");
        }

        produto.setEstoque(produto.getEstoque() - quantidade);
        produtoRepository.save(produto);
    }

    public void atualizarProduto(String id, Produto produtoAtualizado) {
        Produto produtoExistente = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        produtoExistente.setPrecoEmCentavos(produtoAtualizado.getPrecoEmCentavos());
        produtoExistente.setEstoque(produtoAtualizado.getEstoque());

        produtoRepository.save(produtoExistente);
    }

    public boolean deletarProduto(String id) {
        Optional<Produto> produto = produtoRepository.findById(id);

        if (produto.isPresent()) {
            produtoRepository.delete(produto.get());
            return true;
        } else {
            return false; // Produto não encontrado
        }
    }
}
