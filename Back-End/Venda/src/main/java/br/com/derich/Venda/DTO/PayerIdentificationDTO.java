package br.com.derich.Venda.DTO;


import jakarta.validation.constraints.NotNull;

public record PayerIdentificationDTO(
        @NotNull
        String type,

        @NotNull
        String number
) {}
