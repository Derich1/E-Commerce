package br.com.derich.Produto.controller;

import br.com.derich.Produto.entity.Produto;
import br.com.derich.Produto.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
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
    public ResponseEntity<Produto> buscarProdutoPorId(@PathVariable String id) {
        Produto produto = produtoService.buscarProdutoPorId(id);
        return produto != null ? ResponseEntity.ok(produto) : ResponseEntity.notFound().build();
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/{id}/atualizarEstoque")
    public ResponseEntity<Void> atualizarEstoque(
            @PathVariable String id,
            @RequestParam int quantidade) {

        try {
            produtoService.atualizarEstoque(id, quantidade);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build(); // Trate exceções específicas
        }
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PutMapping("/{id}")
    public ResponseEntity<String> atualizarProduto(@PathVariable String id, @RequestBody Produto produtoAtualizado) {
        try {
            produtoService.atualizarProduto(id, produtoAtualizado);
            return ResponseEntity.ok("Produto atualizado com sucesso");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<String> deletarProduto(@PathVariable String id) {
        boolean isDeleted = produtoService.deletarProduto(id);

        if (isDeleted) {
            return ResponseEntity.ok("Produto deletado com sucesso");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Produto não encontrado");
        }
    }
}
