package br.com.derich.Produto.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@RestController
public class TokenController {

    private final String secretKey = "sua_chave_secreta_super_secreta_que_deve_ser_bem_forte";

    @GetMapping("/token")
    public String generateToken() {
        return Jwts.builder()
                .setSubject("seu_usuario_admin") // Usuário ou identificador
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // Expira em 1 hora
                .signWith(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
                .compact();
    }
}
