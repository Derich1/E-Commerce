package br.com.derich.Cliente.service;

import br.com.derich.Cliente.entity.Cliente;
import br.com.derich.Cliente.repository.IClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;

public class ClienteService {

    @Autowired
    private IClienteRepository clienteRepository;

    public Cliente cadastrarCliente(Cliente cliente){
        return clienteRepository.save(cliente);
    }
}
