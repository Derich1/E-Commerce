package br.com.derich.Cliente.service;

import br.com.derich.Cliente.dto.ClienteRequestDTO;
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

    private final String produtoServiceUrl = "http://produto-service/produto/";

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

    public void adicionarProdutoFavorito(String email, String productId) {
        Cliente cliente = clienteRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Chamar o Produto-Service para obter os dados do produto
        Produto produto = restTemplate.getForObject(produtoServiceUrl + productId, Produto.class);

        // Verifica se o produto foi encontrado
        if (produto == null) {
            throw new RuntimeException("Produto não encontrado");
        }

        // Adicionar o ID do produto aos favoritos do cliente
        cliente.getFavoritos().add(produto.getId());
        clienteRepository.save(cliente); // Salva no MongoDB
    }

    public List<Produto> listarProdutosFavoritos(String email) {
        Cliente cliente = clienteRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Para cada ID de favorito, consultar o Produto-Service
        List<Produto> produtosFavoritos = new ArrayList<>();
        for (String productId : cliente.getFavoritos()) {
            Produto produto = restTemplate.getForObject(produtoServiceUrl + productId, Produto.class);
            if (produto != null) {
                produtosFavoritos.add(produto);
            }
        }

        return produtosFavoritos; // Retorna a lista de produtos favoritos com detalhes
    }
}
