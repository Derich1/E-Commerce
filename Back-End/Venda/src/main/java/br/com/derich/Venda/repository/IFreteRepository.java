package br.com.derich.Venda.repository;

import br.com.derich.Venda.entity.Frete;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IFreteRepository extends MongoRepository<Frete, String> {

    Optional<Frete> findByIdEtiqueta(String idEtiqueta);
}
