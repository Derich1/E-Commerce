package br.com.derich.Cliente.service;

import br.com.derich.Cliente.dto.ClienteRequestDTO;
import br.com.derich.Cliente.entity.Cliente;
import br.com.derich.Cliente.repository.IClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ClienteService {

    @Autowired
    private IClienteRepository clienteRepository;

    public Cliente cadastrarCliente(ClienteRequestDTO data){
        // Criação da entidade Cliente a partir do DTO
        Cliente cliente = new Cliente(data);

        return clienteRepository.save(cliente);
    }
}
