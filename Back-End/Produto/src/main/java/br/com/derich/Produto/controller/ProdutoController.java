package br.com.derich.Produto.controller;

import br.com.derich.Produto.entity.Produto;
import br.com.derich.Produto.service.ProdutoService;
import jakarta.validation.Valid;
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
    public ResponseEntity<String> cadastrarProduto(@Valid @RequestBody Produto produto){
        produtoService.cadastrarProduto(produto);
        return ResponseEntity.ok("Produto cadastrado com sucesso");
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<Produto> listarProdutos(){
        return produtoService.listarProdutos();
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/{id}")
    public Produto getProduto(@PathVariable String id) {
        return produtoService.buscarProdutoPorId(id);
    }

}
