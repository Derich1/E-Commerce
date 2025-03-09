package br.com.derich.Venda.service;

import br.com.derich.DTO.VendaDTO;
import br.com.derich.Venda.DTO.PagamentoCartaoRequestDTO;
import br.com.derich.Venda.DTO.PaymentPixRequestDTO;
import br.com.derich.Venda.DTO.PaymentResponseDTO;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.repository.IVendaRepository;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.core.MPRequestOptions;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.mercadopago.client.payment.PaymentPayerRequest;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VendaService {

    @Autowired
    private IVendaRepository vendaRepository;

    @Value("${mercadopago.access.token}")
    private String mercadoPagoAccessToken;

//    @Autowired
//    private RabbitTemplate rabbitTemplate; // Usando RabbitMQ

    public Venda salvarVenda(VendaDTO vendaDTO) {
        Venda venda = new Venda();

        if (vendaDTO.getVendaId() != null) {
            venda.setId(vendaDTO.getVendaId());
        }

        venda.setClienteId(vendaDTO.getClienteId());
        venda.setTotal(vendaDTO.getTotal());
        venda.setStatus(vendaDTO.getStatus());
        venda.setMetodoPagamento(vendaDTO.getMetodoPagamento());
        venda.setStatusPagamento(vendaDTO.getStatusPagamento());
        venda.setEnderecoEntrega(vendaDTO.getEnderecoEntrega());
        venda.setDataVenda(vendaDTO.getDataVenda());
        venda.setEmailCliente(vendaDTO.getEmailCliente());

        // Converter ProdutoCompradoDTO para ProdutoComprado
        List<Venda.ProdutoComprado> produtos = vendaDTO.getProdutos().stream()
                .map(dto -> {
                    Venda.ProdutoComprado produto = new Venda.ProdutoComprado();
                    produto.setProdutoId(dto.getProdutoId());
                    produto.setQuantidade(dto.getQuantidade());
                    produto.setNome(dto.getNome());
                    produto.setPrecoUnitario(dto.getPrecoUnitario());
                    produto.setImagemUrl(dto.getImagemUrl());
                    return produto;
                })
                .collect(Collectors.toList());

        venda.setProdutos(produtos);

        return vendaRepository.save(venda);
    }

    public Venda atualizarVenda(String id, VendaDTO vendaDTO) {
        Optional<Venda> vendaOptional = vendaRepository.findById(id);
        if (vendaOptional.isEmpty()) {
            throw new RuntimeException("Venda não encontrada");
        }

        Venda venda = vendaOptional.get();

        // Atualiza os campos necessários
        if (vendaDTO.getMetodoPagamento() != null) {
            venda.setMetodoPagamento(vendaDTO.getMetodoPagamento());
        }
        if (vendaDTO.getStatusPagamento() != null) {
            venda.setStatusPagamento(vendaDTO.getStatusPagamento());
        }
        if (vendaDTO.getEnderecoEntrega() != null) {
            venda.setEnderecoEntrega(vendaDTO.getEnderecoEntrega());
        }

        return vendaRepository.save(venda);
    }

    public PaymentResponseDTO processarPagamento(PagamentoCartaoRequestDTO pagamentoCartaoRequestDTO) throws Exception {

        try {
            MercadoPagoConfig.setAccessToken(mercadoPagoAccessToken);

            PaymentClient paymentClient = new PaymentClient();

            PaymentCreateRequest paymentCreateRequest =
                    PaymentCreateRequest.builder()
                            .transactionAmount(pagamentoCartaoRequestDTO.getTransactionAmount())
                            .token(pagamentoCartaoRequestDTO.getToken())
                            .description(pagamentoCartaoRequestDTO.getProductDescription())
                            .installments(pagamentoCartaoRequestDTO.getInstallments())
                            .paymentMethodId(pagamentoCartaoRequestDTO.getPaymentMethodId())
                            .payer(
                                    PaymentPayerRequest.builder()
                                            .email(pagamentoCartaoRequestDTO.getPayer().getEmail())
                                            .identification(
                                                    IdentificationRequest.builder()
                                                            .type(pagamentoCartaoRequestDTO.getPayer().getIdentification().getType())
                                                            .number(pagamentoCartaoRequestDTO.getPayer().getIdentification().getNumber())
                                                            .build())
                                            .build())
                            .build();

            Payment createdPayment = paymentClient.create(paymentCreateRequest);

            Venda venda = vendaRepository.findById(pagamentoCartaoRequestDTO.getVendaId())
                    .orElseThrow(() -> new RuntimeException("Venda não encontrada"));

            venda.setStatus("aprovado");
            System.out.println("Status setado para aprovado");
            venda.setMetodoPagamento(createdPayment.getPaymentTypeId()); // Agora ele pega "credit_card", "debit_card" ou "pix"
            System.out.println("Método de pagamento setado");
            venda.setStatusPagamento(createdPayment.getStatus());
            System.out.println("Status do pagamento setado para aprovado");

            // Salva as alterações no banco de dados
            vendaRepository.save(venda);

            return new PaymentResponseDTO(
                    createdPayment.getId(),
                    String.valueOf(createdPayment.getStatus()),
                    createdPayment.getStatusDetail());
        } catch (MPApiException apiException) {
            System.out.println(apiException.getApiResponse().getContent());
            throw new RuntimeException(apiException.getApiResponse().getContent());
        } catch (MPException exception) {
            System.out.println(exception.getMessage());
            throw new RuntimeException(exception.getMessage());
        }
    }

    public Payment pix (PaymentPixRequestDTO request) throws MPException, MPApiException {
        MercadoPagoConfig.setAccessToken(mercadoPagoAccessToken);

        Map<String, String> customHeaders = new HashMap<>();
        customHeaders.put("x-idempotency-key", UUID.randomUUID().toString());

        MPRequestOptions requestOptions = MPRequestOptions.builder()
                .customHeaders(customHeaders)
                .build();

        PaymentClient client = new PaymentClient();

        PaymentCreateRequest paymentCreateRequest =
                PaymentCreateRequest.builder()
                        .transactionAmount(request.getTransactionAmount())
                        .description(request.getDescription())
                        .paymentMethodId(request.getPaymentMethodId())
                        .dateOfExpiration(OffsetDateTime.of(request.getDateOfExpiration(), ZoneOffset.UTC))
                        .payer(
                                PaymentPayerRequest.builder()
                                        .email(request.getPayer().getEmail())
                                        .firstName(request.getPayer().getFirstName())
                                        .identification(
                                                IdentificationRequest.builder()
                                                        .type(request.getPayer().getIdentification().getType())
                                                        .number(request.getPayer().getIdentification().getNumber())
                                                        .build())
                                        .build())
                        .build();

        Payment createdPayment = client.create(paymentCreateRequest, requestOptions);

        Venda venda = vendaRepository.findById(request.getVendaId())
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));

        venda.setStatus("aprovado");
        System.out.println("Status setado para aprovado");
        venda.setMetodoPagamento(request.getPaymentMethodId()); // Esperado "pix"
        System.out.println("Método de pagamento setado");
        venda.setStatusPagamento(createdPayment.getStatus());
        System.out.println("Status do pagamento setado para aprovado");

        // Salva as alterações no banco de dados
        vendaRepository.save(venda);

        return createdPayment;
    }

    private void atualizarStatusVenda(Venda venda, String statusPagamento) {
        switch (statusPagamento.toLowerCase()) {
            case "approved":
                venda.setStatus("APROVADO");
                venda.setStatusPagamento("Pago");
                break;
            case "pending":
                venda.setStatus("PENDENTE");
                venda.setStatusPagamento("Aguardando pagamento");
                break;
            default:
                venda.setStatus("RECUSADO");
                venda.setStatusPagamento("Pagamento recusado");
                break;
        }
        vendaRepository.save(venda);
    }

}
