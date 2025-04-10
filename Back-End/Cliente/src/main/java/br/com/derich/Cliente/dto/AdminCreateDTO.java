package br.com.derich.Cliente.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminCreateDTO(
        @NotBlank
        String email,

        @NotBlank
        @Size(min = 12)
        String password
) {}
