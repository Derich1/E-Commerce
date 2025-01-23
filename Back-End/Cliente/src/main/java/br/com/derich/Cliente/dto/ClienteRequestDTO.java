package br.com.derich.Cliente.dto;

// Receber os dados enviados pelo front-end
public record ClienteRequestDTO(String name, String cpf, String datanascimento, String telefone, String email, String password) {

}
