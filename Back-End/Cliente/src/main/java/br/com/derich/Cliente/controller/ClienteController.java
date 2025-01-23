package br.com.derich.Cliente.controller;

import br.com.derich.Cliente.dto.ClienteRequestDTO;
import br.com.derich.Cliente.entity.Cliente;
import br.com.derich.Cliente.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cliente")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @PostMapping("/cadastrar")
    public ResponseEntity<String> cadastrarCliente(@RequestBody ClienteRequestDTO data) {
        Cliente cliente = new Cliente(data);
        clienteService.cadastrarCliente(cliente);

        System.out.println("Cliente cadastrado: " + cliente);
        return ResponseEntity.ok("Cliente cadastrado com sucesso!");
    }
}
