package br.com.derich.Produto.controller;

import br.com.derich.Produto.entity.Produto;
import br.com.derich.Produto.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produto")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/cadastrar")
    public ResponseEntity<String> cadastrarProduto(@RequestBody Produto produto){
        produtoService.cadastrarProduto(produto);
        return ResponseEntity.ok("Produto cadastrado com sucesso");
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<Produto> listarProdutos(){
        return produtoService.listarProdutos();
    }
}
