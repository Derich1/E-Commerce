package br.com.derich.Venda.DTO.melhorenvio;

public record ProdutoFrete(
        String id,
        int width,
        int height,
        int length,
        int weight,
        int precoEmCentavos,
        int quantidade
) {}
