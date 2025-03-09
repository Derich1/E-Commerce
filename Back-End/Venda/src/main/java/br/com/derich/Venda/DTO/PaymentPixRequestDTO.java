package br.com.derich.Venda.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentPixRequestDTO {

    private BigDecimal transactionAmount;
    private String description;
    private String paymentMethodId; // Esperado "pix"
    private LocalDateTime dateOfExpiration;
    private PayerDTO payer;
    private String vendaId;

    // Getters e Setters

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
    public String getPaymentMethodId() {
        return paymentMethodId;
    }
    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }
    public LocalDateTime getDateOfExpiration() {
        return dateOfExpiration;
    }
    public void setDateOfExpiration(LocalDateTime dateOfExpiration) {
        this.dateOfExpiration = dateOfExpiration;
    }
    public PayerDTO getPayer() {
        return payer;
    }
    public void setPayer(PayerDTO payer) {
        this.payer = payer;
    }

    public String getVendaId() {
        return vendaId;
    }

    public void setVendaId(String vendaId) {
        this.vendaId = vendaId;
    }
}
