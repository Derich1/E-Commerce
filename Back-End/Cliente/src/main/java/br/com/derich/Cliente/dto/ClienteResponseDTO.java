package br.com.derich.Cliente.dto;

import br.com.derich.Cliente.entity.Cliente;

public record ClienteResponseDTO(String id, String name, String cpf, String datanascimento, String telefone, String email, String password) {

    public ClienteResponseDTO(Cliente cliente) {
        this(cliente.getId(), cliente.getName(), cliente.getCpf(), cliente.getDatanascimento(), cliente.getTelefone(), cliente.getEmail(), cliente.getPassword());
    }
}
