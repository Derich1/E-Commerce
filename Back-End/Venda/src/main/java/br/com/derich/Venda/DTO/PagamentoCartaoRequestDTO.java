package br.com.derich.Venda.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PagamentoCartaoRequestDTO(
        String vendaId,

        @NotNull
        String token,

        String issuerId,

        @NotNull
        String paymentMethodId,

        @NotNull
        BigDecimal transactionAmount,

        @NotNull
        Integer installments,

        @NotNull
        @JsonProperty("description")
        String productDescription,

        @NotNull
        PayerDTO payer,

        String payment_type_id
) {}