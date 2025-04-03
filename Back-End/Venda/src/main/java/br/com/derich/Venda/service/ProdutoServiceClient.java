package br.com.derich.Venda.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;


@Service
public class ProdutoServiceClient {

    private final RestTemplate restTemplate;

    public ProdutoServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void atualizarEstoque(String produtoId, int quantidade) {
        String url = "http://produto:8082/produto/{id}/atualizarEstoque?quantidade={quantidade}";

        try {
            restTemplate.postForObject(
                    url,
                    null,
                    Void.class, // Tipo de retorno (void)
                    produtoId,
                    quantidade
            );
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Falha ao atualizar estoque: " + e.getMessage());
        }
    }
}
