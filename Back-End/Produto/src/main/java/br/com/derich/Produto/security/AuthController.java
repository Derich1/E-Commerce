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

    private final String secretKey = "sua_chave_secreta_super_secreta_que_deve_ser_bem_forte";

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        if ("seu_usuario_admin".equals(request.getUsername()) && "sua_senha_forte".equals(request.getPassword())) {
            String token = Jwts.builder()
                    .setSubject(request.getUsername())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 dia
                    .signWith(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
                    .compact();

            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.status(401).body("Usuário ou senha inválidos");
        }
    }
}
