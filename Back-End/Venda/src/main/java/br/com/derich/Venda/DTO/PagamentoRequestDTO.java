package br.com.derich.Venda.DTO;

import java.math.BigDecimal;

public class PagamentoRequestDTO {

    private String token;
    private String paymentMethodId;
    private Integer installments;
    private BigDecimal transactionAmount;
    private String description;
    private String email;
    private String metodoPagamento;
    private String identificationType; // Tipo de documento (ex: "CPF")
    private String identificationNumber; // Número do documento
    private String nome; // Nome e sobrenome do comprador
    private String sobrenome;
    private String tipoDocumento; // Cpf ou cnpj
    private String numeroDocumento;

    public PagamentoRequestDTO(String token, String paymentMethodId, Integer installments, BigDecimal transactionAmount, String description, String email, String metodoPagamento, String identificationType, String identificationNumber, String nome, String sobrenome, String tipoDocumento, String numeroDocumento) {
        this.token = token;
        this.paymentMethodId = paymentMethodId;
        this.installments = installments;
        this.transactionAmount = transactionAmount;
        this.description = description;
        this.email = email;
        this.metodoPagamento = metodoPagamento;
        this.identificationType = identificationType;
        this.identificationNumber = identificationNumber;
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.tipoDocumento = tipoDocumento;
        this.numeroDocumento = numeroDocumento;
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

    public BigDecimal getTransactionAmount() {
        return transactionAmount;
    }

    public void setTransactionAmount(BigDecimal transactionAmount) {
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

    public String getIdentificationType() {
        return identificationType;
    }

    public void setIdentificationType(String identificationType) {
        this.identificationType = identificationType;
    }

    public String getIdentificationNumber() {
        return identificationNumber;
    }

    public void setIdentificationNumber(String identificationNumber) {
        this.identificationNumber = identificationNumber;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getSobrenome() {
        return sobrenome;
    }

    public void setSobrenome(String sobrenome) {
        this.sobrenome = sobrenome;
    }

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(String tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getNumeroDocumento() {
        return numeroDocumento;
    }

    public void setNumeroDocumento(String numeroDocumento) {
        this.numeroDocumento = numeroDocumento;
    }
}
