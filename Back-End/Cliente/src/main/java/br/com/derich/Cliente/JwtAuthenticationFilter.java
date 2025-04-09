package br.com.derich.Cliente;

import br.com.derich.Cliente.service.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        System.out.println("🔍 URI recebida no filtro: " + request.getRequestURI());
        // Ignora verificação JWT para rotas públicas
        if (isPublicEndpoint(request)) {
            System.out.println("✅ Endpoint público detectado, pulando validação JWT");
            filterChain.doFilter(request, response);
            return;
        }

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        System.out.println("Cabeçalho Authorization recebido: " + header);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                if (jwtService.validateToken(token)) {
                    Authentication auth = jwtService.getAuthentication(token);
                    // Define a autenticação no contexto do Spring Security
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    System.out.println("Usuário autenticado via JWT: " + auth.getName());

                } else {
                    System.out.println("Token inválido." + header);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // Retorna 401
                    return;
                }
            } catch (JwtException e) {
                // Token inválido; você pode tratar a exceção se desejar
                System.out.println("Erro ao validar token: " + e.getMessage());
                SecurityContextHolder.clearContext();
            }
        } else {
            System.out.println("Nenhum token recebido.");
        }
        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/cliente/login") ||
                path.startsWith("/cliente/cadastrar") ||
                path.startsWith("/cliente/perfil") ||
                path.startsWith("/cliente/favoritos") ||
                path.startsWith("/admin/login");
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}

