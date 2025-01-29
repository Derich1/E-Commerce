package br.com.derich.Cliente.controller;

import br.com.derich.Cliente.EmailSender;
import br.com.derich.Cliente.dto.ClienteRequestDTO;
import br.com.derich.Cliente.entity.Cliente;
import br.com.derich.Cliente.service.ClienteService;
import br.com.derich.Cliente.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/cliente")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private EmailSender emailSender;

    @Autowired
    private JwtService jwtService;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/cadastrar")
    public ResponseEntity<Map<String, String>>cadastrarCliente(@RequestBody ClienteRequestDTO data) {

        Cliente cliente = clienteService.cadastrarCliente(data);

        // Adicionando a variável o email recebido no cadastro do cliente
        String email = data.email();

        // Gerando código aleatório para enviar para o email do cliente para verificação
        String codigo = gerarCodigoAleatorio();

        emailSender.sendVerificationEmail(email, codigo);

        // Gerar token JWT após o cadastro
        String token = jwtService.generateToken(cliente.getEmail());

        // Retornar o token no JSON de resposta
        Map<String, String> response = new HashMap<>();
        response.put("message", "Cliente cadastrado com sucesso!");
        response.put("token", token);

        return ResponseEntity.ok(response);
    }

    private String gerarCodigoAleatorio() {
        // Usando SecureRandom para gerar um código seguro
        SecureRandom random = new SecureRandom();
        int codigo = random.nextInt(900000) + 100000; // Gera um número entre 100000 e 999999
        return String.valueOf(codigo);
    }
}
