package br.com.derich.Cliente.service;

import br.com.derich.Cliente.dto.*;
import br.com.derich.Cliente.entity.Cliente;
import br.com.derich.Cliente.repository.IClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    @Autowired
    private IClienteRepository clienteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // Serve para fazer chamadas para o microsserviço de produto
    @Autowired
    private RestTemplate restTemplate;

    // Usando Spring Cloud ou LoadBalancer não precisa especificar a porta
    private final String produtoServiceUrl = "http://produto:8082/produto/";

    public LoginResponseDTO login(LoginRequestDTO loginRequest) {

        Cliente cliente = clienteRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (cliente == null) {
            throw new RuntimeException("Cliente não encontrado.");
        }
        System.out.println("Senha da requisicao: "+ loginRequest.senha());
        System.out.println("Senha do banco de dados: " + cliente.getPassword());

        if (!passwordEncoder.matches(loginRequest.senha(), cliente.getPassword())) {
            throw new RuntimeException("Senha incorreta.");
        }

        String token = jwtService.generateToken(cliente);

        System.out.println("Enviando o numeroDocumento do backend: " + cliente.getNumeroDocumento());

        return new LoginResponseDTO(cliente.getId(),
                cliente.getName(),
                cliente.getEmail(),
                token,                          // Token na posição correta
                cliente.getNumeroDocumento(),
                cliente.getTelefone(),
                cliente.getDatanascimento());
    }

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

    public Cliente getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("Tentando buscar usuário com username: " + email);
        return clienteRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
    }

    public boolean verifyPassword(String senhaAtual) {
        try {
            Cliente cliente = getAuthenticatedUser();
            System.out.println("Comparando senha: senhaAtual=" + senhaAtual + " | senha armazenada=" + cliente.getPassword());
            return passwordEncoder.matches(senhaAtual, cliente.getPassword());
        } catch (Exception e) {
            System.out.println("Erro na verificação de senha: " + e.getMessage());
            throw e;
        }
    }

    public boolean changePassword(String senhaNova) {
        Cliente cliente = getAuthenticatedUser();
        cliente.setPassword(passwordEncoder.encode(senhaNova));
        clienteRepository.save(cliente);
        return true;
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

    public Cliente criarAdmin(AdminCreateDTO dto) throws Exception {
        if (clienteRepository.existsByEmail(dto.getEmail())) {
            throw new Exception();
        }

        Cliente admin = new Cliente();
        admin.setEmail(dto.getEmail());
        admin.setPassword(passwordEncoder.encode(dto.getPassword()));
        admin.setRoles(List.of("ROLE_ADMIN", "ROLE_USER"));

        return clienteRepository.save(admin);
    }
}
