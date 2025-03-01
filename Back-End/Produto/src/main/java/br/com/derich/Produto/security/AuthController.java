package br.com.derich.Produto.security;

import br.com.derich.Produto.security.LoginRequest;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@RestController
@RequestMapping("/auth")
public class AuthController {

    // Garantir que apenas o servidor que gerou o JWT possa validá-lo
    private final String secretKey = "${secretKey}";

    /**
     * Entre no endpoint /auth/login
     * coloque no corpo da requisição o username e password
     * ele retornará o token gerado
     *
     * Para utilizar o token gerado entre no endpoint /produto/cadastrar e adicione um header.
     * a key será "Authorization" e o value será "Bearer tokengerado"
     * @param request
     * @return
     */
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        if ("${usuarioAdmin}".equals(request.getUsername()) && "${senhaAdmin}".equals(request.getPassword())) {
            String token = Jwts.builder()
                    .setSubject(request.getUsername())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 dia
                    .signWith(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
                    .compact();
            System.out.println("Este é o token:" + token);
            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.status(401).body("Usuário ou senha inválidos");
        }
    }
}
