package br.com.derich.Venda.DTO.melhorenvio;

import java.util.List;

public class FreteRequest {

    private String toPostalCode;
    private List<ProdutoFrete> products;

    public String getToPostalCode() {
        return toPostalCode;
    }

    public void setToPostalCode(String toPostalCode) {
        this.toPostalCode = toPostalCode;
    }

    public List<ProdutoFrete> getProducts() {
        return products;
    }

    public void setProducts(List<ProdutoFrete> products) {
        this.products = products;
    }
}

