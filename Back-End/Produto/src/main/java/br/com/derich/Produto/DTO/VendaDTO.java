package br.com.derich.Produto.DTO;

import java.util.List;

public class VendaDTO {

    private String vendaId;
    private List<ProdutoCompradoDTO> produtos;

    public String getVendaId() {
        return vendaId;
    }

    public void setVendaId(String vendaId) {
        this.vendaId = vendaId;
    }

    public List<ProdutoCompradoDTO> getProdutos() {
        return produtos;
    }

    public void setProdutos(List<ProdutoCompradoDTO> produtos) {
        this.produtos = produtos;
    }

    public static class ProdutoCompradoDTO {

        private String produtoId;
        private int quantidade;

        public String getProdutoId() {
            return produtoId;
        }

        public void setProdutoId(String produtoId) {
            this.produtoId = produtoId;
        }

        public int getQuantidade() {
            return quantidade;
        }

        public void setQuantidade(int quantidade) {
            this.quantidade = quantidade;
        }
    }
}

