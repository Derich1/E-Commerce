package br.com.derich.Venda.repository;

import br.com.derich.Venda.entity.Venda;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IVendaRepository extends MongoRepository<Venda, String> {

    Venda findByPagamentoId(Long pagamentoId);

}
