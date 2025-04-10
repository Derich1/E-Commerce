package br.com.derich.Venda.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentPixRequestDTO(
        BigDecimal transactionAmount,
        String description,
        String paymentMethodId, // Esperado "pix"
        LocalDateTime dateOfExpiration,
        PayerDTO payer,
        String vendaId
) {}
