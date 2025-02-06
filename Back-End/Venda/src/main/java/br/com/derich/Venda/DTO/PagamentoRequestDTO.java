package br.com.derich.Venda.DTO;

public class PagamentoRequestDTO {

    private String token;
    private String email;
    private String metodoPagamento;
    private Integer installments;

    public PagamentoRequestDTO(String token, String email, String metodoPagamento) {
        this.token = token;
        this.email = email;
        this.metodoPagamento = metodoPagamento;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMetodoPagamento() {
        return metodoPagamento;
    }

    public void setMetodoPagamento(String metodoPagamento) {
        this.metodoPagamento = metodoPagamento;
    }

    public Integer getInstallments() {
        return installments;
    }

    public void setInstallments(Integer installments) {
        this.installments = installments;
    }
}
