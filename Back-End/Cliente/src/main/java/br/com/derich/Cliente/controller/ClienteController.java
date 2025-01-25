package br.com.derich.Cliente.controller;

import br.com.derich.Cliente.dto.ClienteRequestDTO;
import br.com.derich.Cliente.entity.Cliente;
import br.com.derich.Cliente.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cliente")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/cadastrar")
    public ResponseEntity<String> cadastrarCliente(@RequestBody ClienteRequestDTO data) {
        clienteService.cadastrarCliente(data);

        return ResponseEntity.ok("Cliente cadastrado com sucesso!");
    }
}
