package br.com.derich.Venda.repository;

import br.com.derich.Venda.entity.Venda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IVendaRepository extends MongoRepository<Venda, String> {

    Venda findByPagamentoId(Long pagamentoId);
    Page<Venda> findByEmailClienteOrderByDataVendaDesc(String emailCliente, Pageable pageable);
    Optional<Venda> findById(String id);
    List<Venda> findByStatusPagamentoAndStatusEtiqueta(String statusPagamento, String statusEtiqueta);
}
