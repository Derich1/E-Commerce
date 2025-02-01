package br.com.derich.Cliente.controller;

import br.com.derich.Cliente.security.AuthRequest;
import br.com.derich.Cliente.entity.Cliente;
import br.com.derich.Cliente.repository.IClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    private IClienteRepository clienteRepository;

    private PasswordEncoder passwordEncoder;

    @Autowired
    public AuthController(IClienteRepository clienteRepository, PasswordEncoder passwordEncoder) {
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {

        // Buscar o usuário pelo e-mail
        Cliente cliente = clienteRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verificar se a senha está correta
        if (passwordEncoder.matches(authRequest.getPassword(), cliente.getPassword())) {
            return ResponseEntity.ok("Login realizado com sucesso!");
        } else {
            return ResponseEntity.status(401).body("Credenciais inválidas");
        }
    }
}