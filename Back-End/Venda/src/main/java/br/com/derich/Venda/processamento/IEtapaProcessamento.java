package br.com.derich.Venda.processamento;

import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.exception.ApiException;

public interface IEtapaProcessamento {
    void executar(Venda venda) throws ApiException;
}