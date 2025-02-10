package br.com.derich.DTO;

import java.io.Serializable;
import java.util.List;

public class VendaDTO implements Serializable {

    private static final long serialVersionUID = 8512250869286023497L;

    private String vendaId;
    private String clienteId;
    private List<ProdutoCompradoDTO> produtos;
    private Long total;
    private String status; // PENDENTE, APROVADO, CANCELADO
    private String metodoPagamento; // CARTAO_CREDITO, PIX, BOLETO
    private String statusPagamento; // AGUARDANDO, PAGO, CANCELADO
    private String enderecoEntrega;
    private String dataVenda;
    private String emailCliente;

    // Construtores vazios para que o RabbitMQ consiga desserializar a mensagem


    public String getVendaId() {
        return vendaId;
    }

    public void setVendaId(String vendaId) {
        this.vendaId = vendaId;
    }

    public String getClienteId() {
        return clienteId;
    }

    public void setClienteId(String clienteId) {
        this.clienteId = clienteId;
    }

    public List<ProdutoCompradoDTO> getProdutos() {
        return produtos;
    }

    public void setProdutos(List<ProdutoCompradoDTO> produtos) {
        this.produtos = produtos;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMetodoPagamento() {
        return metodoPagamento;
    }

    public void setMetodoPagamento(String metodoPagamento) {
        this.metodoPagamento = metodoPagamento;
    }

    public String getStatusPagamento() {
        return statusPagamento;
    }

    public void setStatusPagamento(String statusPagamento) {
        this.statusPagamento = statusPagamento;
    }

    public String getEnderecoEntrega() {
        return enderecoEntrega;
    }

    public void setEnderecoEntrega(String enderecoEntrega) {
        this.enderecoEntrega = enderecoEntrega;
    }

    public String getDataVenda() {
        return dataVenda;
    }

    public void setDataVenda(String dataVenda) {
        this.dataVenda = dataVenda;
    }

    public static class ProdutoCompradoDTO {

        private String produtoId;
        private int quantidade;
        private String nome;
        private double precoUnitario;


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

        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public double getPrecoUnitario() {
            return precoUnitario;
        }

        public void setPrecoUnitario(double precoUnitario) {
            this.precoUnitario = precoUnitario;
        }
    }

    public String getEmailCliente() {
        return emailCliente;
    }

    public void setEmailCliente(String emailCliente) {
        this.emailCliente = emailCliente;
    }
}
