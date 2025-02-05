package br.com.derich.Cliente.service;

import br.com.derich.Cliente.dto.ClienteRequestDTO;
import br.com.derich.Cliente.dto.ProdutoDTO;
import br.com.derich.Cliente.entity.Cliente;
import br.com.derich.Cliente.repository.IClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    @Autowired
    private IClienteRepository clienteRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // Serve para fazer chamadas para o microsserviço de produto
    @Autowired
    private RestTemplate restTemplate;

    // Usando Spring Cloud ou LoadBalancer não precisa especificar a porta
    private final String produtoServiceUrl = "http://produto/produto/";

    public Cliente cadastrarCliente(ClienteRequestDTO data){

        if (clienteRepository.findByEmail(data.email()).isPresent()) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }

        // Criação da entidade Cliente a partir do DTO
        Cliente cliente = new Cliente(data);

        // Criptografando a senha antes de salvar
        String senhaCriptografada = passwordEncoder.encode(cliente.getPassword());
        cliente.setPassword(senhaCriptografada);

        return clienteRepository.save(cliente);
    }

    public ResponseEntity<?> buscarDadosUsuario(@RequestHeader("Authorization") String token) {
        try {
            // Removendo o "Bearer " do token
            String jwt = token.substring(7);

            // Extrair o email do token
            String email = jwtService.extractEmail(jwt);

            // Buscar o usuário no banco de dados
            Cliente cliente = clienteRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            // Retornar os dados do usuário
            return ResponseEntity.ok(cliente);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token inválido ou expirado");
        }
    }

    public void adicionarProdutoFavorito(String email, String produtoId) {
        Cliente cliente = clienteRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        cliente.adicionarFavorito(produtoId);
        clienteRepository.save(cliente);
    }

    public void removerProdutoFavorito(String email, String produtoId) {
        Cliente cliente = clienteRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        cliente.removerFavorito(produtoId);
        clienteRepository.save(cliente);
    }

    public List<ProdutoDTO> listarProdutosFavoritos(String email) {
        Cliente cliente = clienteRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Set<String> favoritos = cliente.getFavoritos();

        return favoritos.stream()
                .map(produtoId -> restTemplate.getForObject(produtoServiceUrl + produtoId, ProdutoDTO.class))
                .collect(Collectors.toList());
    }

}
