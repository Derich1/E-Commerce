package br.com.derich.Venda.DTO;

public record PaymentResponseDTO(
        Long id,
        String status,
        String detail
) {}
