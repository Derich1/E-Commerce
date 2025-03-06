package br.com.derich.Venda.repository;

import br.com.derich.Venda.entity.Venda;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IVendaRepository extends MongoRepository<Venda, String> {

    Venda findByPagamentoId(Long pagamentoId);
    List<Venda> findByEmailClienteOrderByDataVendaDesc(String emailCliente);

}
