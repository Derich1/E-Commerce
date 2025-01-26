package br.com.derich.Produto.service;

import br.com.derich.Produto.entity.Produto;
import br.com.derich.Produto.repository.IProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

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
        Optional<Produto> produto = produtoRepository.findById(id);
        return produto.orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }
}
