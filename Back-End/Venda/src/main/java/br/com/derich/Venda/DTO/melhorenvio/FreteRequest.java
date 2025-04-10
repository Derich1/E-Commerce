package br.com.derich.Venda.DTO.melhorenvio;

public record FreteRequest(
        String toPostalCode,
        Package pacote
) {}

