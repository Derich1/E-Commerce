package br.com.derich.Produto.repository;

import br.com.derich.Produto.entity.Produto;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface IProdutoRepository extends MongoRepository<Produto, String> {
}
