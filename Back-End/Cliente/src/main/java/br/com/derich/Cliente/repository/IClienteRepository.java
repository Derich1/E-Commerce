package br.com.derich.Cliente.repository;

import br.com.derich.Cliente.entity.Cliente;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface IClienteRepository extends MongoRepository<Cliente, ObjectId> {
}
