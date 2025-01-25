package br.com.derich.Cliente.dto;

import br.com.derich.Cliente.entity.Cliente;
import org.bson.types.ObjectId;

public record ClienteResponseDTO(ObjectId id, String name, String cpf, String datanascimento, String telefone, String email, String password) {

    public ClienteResponseDTO(Cliente cliente) {
        this(cliente.getId(), cliente.getName(), cliente.getCpf(), cliente.getDatanascimento(), cliente.getTelefone(), cliente.getEmail(), cliente.getPassword());
    }
}
