package br.com.derich.Venda.DTO;

public class PagamentoRequestDTO {

    private String token;
    private String paymentMethodId;
    private Integer installments;
    private Double transactionAmount;
    private String description;
    private String email;
    private String metodoPagamento;

    public PagamentoRequestDTO(String token, String paymentMethodId, Integer installments, Double transactionAmount, String description, String email, String metodoPagamento) {
        this.token = token;
        this.paymentMethodId = paymentMethodId;
        this.installments = installments;
        this.transactionAmount = transactionAmount;
        this.description = description;
        this.email = email;
        this.metodoPagamento = metodoPagamento;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getPaymentMethodId() {
        return paymentMethodId;
    }

    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }

    public Integer getInstallments() {
        return installments;
    }

    public void setInstallments(Integer installments) {
        this.installments = installments;
    }

    public Double getTransactionAmount() {
        return transactionAmount;
    }

    public void setTransactionAmount(Double transactionAmount) {
        this.transactionAmount = transactionAmount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    @Override
    public String toString() {
        return "PagamentoRequestDTO{" +
                "token='" + token + '\'' +
                ", paymentMethodId='" + paymentMethodId + '\'' +
                ", installments=" + installments +
                ", transactionAmount=" + transactionAmount +
                ", description='" + description + '\'' +
                ", email='" + email + '\'' +
                ", metodoPagamento='" + metodoPagamento + '\'' +
                '}';
    }
}
