package br.com.derich.Cliente.repository;

import br.com.derich.Cliente.entity.Cliente;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface IClienteRepository extends MongoRepository<Cliente, String> {

    Optional<Cliente> findByEmail(String email);
    Optional<Cliente> findByName(String name);
}
