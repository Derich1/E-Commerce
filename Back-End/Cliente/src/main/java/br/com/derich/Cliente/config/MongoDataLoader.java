package br.com.derich.Cliente.config;

import br.com.derich.Cliente.entity.Cliente;
import br.com.derich.Cliente.repository.IClienteRepository;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MongoDataLoader {

    private final IClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    Dotenv dotenv = Dotenv.load();
    private String emailAdmin = dotenv.get("emailAdministrador");
    private String senhaAdmin = dotenv.get("senhaAdministrador");

    public MongoDataLoader(IClienteRepository clienteRepository, PasswordEncoder passwordEncoder) {
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void initAdminUser() {
        if (!clienteRepository.existsByEmail(emailAdmin)) {
            Cliente admin = new Cliente(
                    emailAdmin,
                    passwordEncoder.encode(senhaAdmin),
                    List.of("ADMIN")
            );
            clienteRepository.save(admin);
        }
    }
}
