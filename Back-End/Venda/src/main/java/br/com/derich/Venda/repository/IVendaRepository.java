package br.com.derich.Venda.repository;

import br.com.derich.Venda.entity.Venda;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface IVendaRepository extends MongoRepository<Venda, String> {
}
