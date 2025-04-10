package br.com.derich.Cliente.dto;

public record LoginResponseDTO(
        String id,
        String nome,
        String email,
        String token,
        String numeroDocumento,
        String telefone,
        String datanascimento
) {}