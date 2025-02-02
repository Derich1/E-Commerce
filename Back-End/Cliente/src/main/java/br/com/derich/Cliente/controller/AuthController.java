package br.com.derich.Cliente.controller;

import br.com.derich.Cliente.security.AuthRequest;
import br.com.derich.Cliente.entity.Cliente;
import br.com.derich.Cliente.repository.IClienteRepository;
import br.com.derich.Cliente.service.JwtService;
import io.jsonwebtoken.Jwt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api")
public class AuthController {

    private IClienteRepository clienteRepository;

    private PasswordEncoder passwordEncoder;

    private JwtService jwtService;

    @Autowired
    public AuthController(IClienteRepository clienteRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {

        // Buscar o usuário pelo e-mail
        Cliente cliente = clienteRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verificar se a senha está correta
        if (passwordEncoder.matches(authRequest.getPassword(), cliente.getPassword())) {
            String token = jwtService.generateToken(cliente.getEmail());

            // Retornando a resposta para o frontend salvar e utilizar para manter logado e mostrar no /perfil
            return ResponseEntity.ok(Collections.singletonMap("token", token)); // Enviando o token no corpo da resposta
        } else {
            return ResponseEntity.status(401).body("Credenciais inválidas");
        }
    }
}