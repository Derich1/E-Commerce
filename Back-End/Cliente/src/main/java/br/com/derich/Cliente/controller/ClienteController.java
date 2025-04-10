package br.com.derich.Cliente.controller;

import br.com.derich.Cliente.util.EmailSender;
import br.com.derich.Cliente.dto.*;
import br.com.derich.Cliente.entity.Cliente;
import br.com.derich.Cliente.service.ClienteService;
import br.com.derich.Cliente.service.JwtService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.security.SecureRandom;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
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

    private static final Logger logger = LoggerFactory.getLogger(ClienteController.class);

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        try {
            LoginResponseDTO response = clienteService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrarCliente(@RequestBody ClienteRequestDTO data) {

        try {
            Cliente cliente = clienteService.cadastrarCliente(data);

            // Adicionando a variável o email recebido no cadastro do cliente
            String email = data.email();

            // Gerando código aleatório para enviar para o email do cliente para verificação
            String codigo = gerarCodigoAleatorio();

            emailSender.sendVerificationEmail(email, codigo);


            // Gerar token JWT após o cadastro
            String token = jwtService.generateToken(cliente);

            // Retornar o token no JSON de resposta
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cliente cadastrado com sucesso!");
            response.put("token", token);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", "Erro de validação");

            // Separa as mensagens de erro em um array
            String[] errorMessages = e.getMessage().split(", ");
            errorResponse.put("messages", errorMessages);

            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", "Erro interno do servidor");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/perfil")
    public ResponseEntity<?> buscarDadosUsuario(@RequestHeader("Authorization") String token) {
        return clienteService.buscarDadosUsuario(token);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/verify-password")
    public ResponseEntity<?> verificarSenha(@RequestBody SenhaRequestDTO request) {
        boolean isValid = clienteService.verifyPassword(request.senhaAtual());
        return ResponseEntity.ok(Collections.singletonMap("valid", isValid));
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/change-password")
    public ResponseEntity<?> alterarSenha(@RequestBody MudarSenhaRequestDTO request) {
        boolean changed = clienteService.changePassword(request.senhaNova());
        if (changed) {
            return ResponseEntity.ok(Collections.singletonMap("message", "Senha alterada com sucesso!"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", "Erro ao alterar senha."));
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/favoritos")
    public ResponseEntity<?> adicionarProdutoFavorito(@RequestBody FavoritoRequestDTO favoritoRequest) {
        clienteService.adicionarProdutoFavorito(favoritoRequest.email(), favoritoRequest.produtoId());
        return ResponseEntity.ok("Produto adicionado aos favoritos!");
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @DeleteMapping("/favoritos")
    public ResponseEntity<?> removerFavorito(@RequestBody FavoritoRequestDTO favoritoRequest) {
        clienteService.removerProdutoFavorito(favoritoRequest.email(), favoritoRequest.produtoId());
        return ResponseEntity.ok("Produto removido dos favoritos");
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/favoritos")
    public ResponseEntity<?> listarFavoritos(@RequestHeader("Authorization") String token) {
        try {// Removendo "Bearer " do token
            String jwt = token.substring(7);
            logger.info("Token recebido: {}", token);
            // Extrai o e-mail do usuário autenticado
            String email = jwtService.extractEmail(jwt);

            // Busca os favoritos do usuário autenticado
            List<ProdutoDTO> favoritos = clienteService.listarProdutosFavoritos(email);

            return ResponseEntity.ok(favoritos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/admin/criar-admin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Cliente> criarAdmin(@RequestBody @Valid AdminCreateDTO dto) throws Exception {
        Cliente admin = clienteService.criarAdmin(dto);
        return ResponseEntity.created(URI.create("/clientes/" + admin.getId())).body(admin);
    }

    private String gerarCodigoAleatorio() {
        // Usando SecureRandom para gerar um código seguro
        SecureRandom random = new SecureRandom();
        int codigo = random.nextInt(900000) + 100000; // Gera um número entre 100000 e 999999
        return String.valueOf(codigo);
    }
}
