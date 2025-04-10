package br.com.derich.Venda.DTO;

import jakarta.validation.constraints.NotNull;

public record PayerDTO(
        @NotNull
        String email,

        String firstName,

        @NotNull
        PayerIdentificationDTO identification
) {}
