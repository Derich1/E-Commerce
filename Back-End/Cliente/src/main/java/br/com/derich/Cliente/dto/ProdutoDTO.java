package br.com.derich.Cliente.dto;

public record ProdutoDTO(String id, String nome, String imagemUrl, Integer precoEmCentavos, Integer estoque, String marca, String descricao, String categoria) {
}
