package br.com.derich.Venda.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.UUID;

@Document(collection = "venda")
public class Venda {

    @Id
    private String id;
    private String clienteId;
    private List<ProdutoComprado> produtos;
    private Long total;
    private String status; // PENDENTE, APROVADO, CANCELADO
    private String metodoPagamento; // CARTAO_CREDITO, PIX, BOLETO
    private String statusPagamento; // AGUARDANDO, PAGO, CANCELADO
    private String enderecoEntrega;
    private String dataVenda;
    private Long pagamentoId;
    private String emailCliente;
    private String statusEtiqueta;
    private String idEtiqueta;

    public static class ProdutoComprado {
        private String produtoId;
        private String nome;
        private int quantidade;
        private double precoUnitario;
        private String imagemUrl;

        public String getProdutoId() {
            return produtoId;
        }

        public void setProdutoId(String produtoId) {
            this.produtoId = produtoId;
        }

        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public int getQuantidade() {
            return quantidade;
        }

        public void setQuantidade(int quantidade) {
            this.quantidade = quantidade;
        }

        public double getPrecoUnitario() {
            return precoUnitario;
        }

        public void setPrecoUnitario(double precoUnitario) {
            this.precoUnitario = precoUnitario;
        }

        public String getImagemUrl() {
            return imagemUrl;
        }

        public void setImagemUrl(String imagemUrl) {
            this.imagemUrl = imagemUrl;
        }
    }

    // Sem esse campo o id gerado no banco de dados seria ObjectId
    public Venda() {
        this.id = UUID.randomUUID().toString(); // Gera um UUID único ao criar uma venda
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getClienteId() {
        return clienteId;
    }

    public void setClienteId(String clienteId) {
        this.clienteId = clienteId;
    }

    public List<ProdutoComprado> getProdutos() {
        return produtos;
    }

    public void setProdutos(List<ProdutoComprado> produtos) {
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

    public Long getPagamentoId() {
        return pagamentoId;
    }

    public void setPagamentoId(Long pagamentoId) {
        this.pagamentoId = pagamentoId;
    }

    public String getEmailCliente() {
        return emailCliente;
    }

    public void setEmailCliente(String emailCliente) {
        this.emailCliente = emailCliente;
    }

    public String getStatusEtiqueta() {
        return statusEtiqueta;
    }

    public void setStatusEtiqueta(String statusEtiqueta) {
        this.statusEtiqueta = statusEtiqueta;
    }

    public String getIdEtiqueta() {
        return idEtiqueta;
    }

    public void setIdEtiqueta(String idEtiqueta) {
        this.idEtiqueta = idEtiqueta;
    }
}
