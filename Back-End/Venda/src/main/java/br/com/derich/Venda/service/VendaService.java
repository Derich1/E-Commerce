package br.com.derich.Venda.service;

import br.com.derich.DTO.VendaDTO;
import br.com.derich.Venda.DTO.PagamentoCartaoRequestDTO;
import br.com.derich.Venda.DTO.PaymentPixRequestDTO;
import br.com.derich.Venda.DTO.PaymentResponseDTO;
import br.com.derich.Venda.DTO.melhorenvio.EntregaRequest;
import br.com.derich.Venda.DTO.melhorenvio.FreteRequest;
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
import org.springframework.stereotype.Service;
import com.mercadopago.client.payment.PaymentPayerRequest;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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

    @Value("${melhorenvio.token}")
    private String tokenMelhorEnvio;

    @Value("${melhorenvio.email.contato}")
    private String emailParaContato;

    private String nomeAplicacao = "Ecommerce";

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

            venda.setStatus("Aprovado");
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
                        .paymentMethodId("Pix")
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

        venda.setStatus("Aprovado");
        System.out.println("Status setado para aprovado");
        venda.setMetodoPagamento("Pix");
        System.out.println("Método de pagamento setado");
        venda.setStatusPagamento(createdPayment.getStatus());
        System.out.println("Status do pagamento setado");

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

    // API Melhor envio
    public String calcularFrete(FreteRequest freteRequest) throws IOException, InterruptedException {

        String urlRequisicao = "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate";

        // Aqui você pode criar o JSON e fazer a requisição para Melhor Envio
        String jsonBody = String.format("""
            {
                "from": {"postal_code": "%s"},
                "to": {"postal_code": "%s"},
                "products": [
                    {
                        "id": "%s",
                        "width": %d,
                        "height": %d,
                        "length": %d,
                        "weight": %d,
                        "insurance_value": %d,
                        "quantity": %d
                    }
                ]
            }
        """, freteRequest.getFromPostalCode(), freteRequest.getToPostalCode(), freteRequest.getProdutoId(), freteRequest.getWidth(), freteRequest.getHeight(), freteRequest.getLength(),
                freteRequest.getWeight(), freteRequest.getPrecoEmCentavos() / 100, freteRequest.getQuantidade());

        // Aqui você chamaria a API do Melhor Envio com esse JSON
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlRequisicao))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer" + tokenMelhorEnvio)
                .header("User-Agent", nomeAplicacao + (emailParaContato))
                .method("POST", HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());

        return jsonBody; // Retornando o JSON só para teste
    }

    public String inserirFretesNoCarrinhoMelhorEnvio(EntregaRequest entregaRequest) throws IOException, InterruptedException {
        String urlRequisicao = "https://sandbox.melhorenvio.com.br/api/v2/me/cart";

        String jsonBody = String.format("""
            {
              "from": {
                "postal_code": "%s",
                "name": "%s",
                "address": "%s",
                "city": "%s",
                "document": "%s"
              },
              "to": {
                "postal_code": "%s",
                "name": "%s",
                "address": "%s",
                "city": "%s",
                "document": "%s"
              },
              "options": {
                "receipt": %b,
                "own_hand": %b,
                "reverse": %b,
                "non_commercial": %b,
                "insurance_value": %d
              },
              "service": %d,
              "products": [
                {
                  "name": "%s",
                  "quantity": "%s",
                  "unitary_value": "%s"
                }
              ],
              "volumes": [
                {
                  "height": %d,
                  "width": %d,
                  "length": %d,
                  "weight": %d
                }
              ]
            }
            """,
                // "from" - remetente
                entregaRequest.getFromPostalCode(),    // Ex: "13210750"
                entregaRequest.getFromName(),          // Ex: "Derich"
                entregaRequest.getFromAddress(),       // Ex: "Rua hércules Malatesta"
                entregaRequest.getFromCity(),          // Ex: "Jundiaí"
                entregaRequest.getFromDocument(),      // Ex: "46716086854"

                // "to" - destinatário
                toPostalCode,      // Ex: "04691-030"
                toName,            // Ex: "Iasmin"
                toAddress,         // Ex: "Rua Álvaro Afonso"
                toCity,            // Ex: "São Paulo"
                toDocument,        // Ex: "41407451855"

                // "options"
                receipt,           // Ex: false
                ownHand,           // Ex: false
                reverse,           // Ex: false
                nonCommercial,     // Ex: false
                insuranceValue,    // Ex: 42

                // "service"
                service,           // Ex: 2

                // "products"
                productName,       // Ex: "Teste"
                productQuantity,   // Ex: "1" (ou use %d se for número)
                productUnitaryValue, // Ex: "10000" (ou %d, conforme o tipo)

                // "volumes"
                volumeHeight,      // Ex: 10
                volumeWidth,       // Ex: 5
                volumeLength,      // Ex: 9
                volumeWeight       // Ex: 2
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlRequisicao))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer" + tokenMelhorEnvio)
                .header("User-Agent", nomeAplicacao + (emailParaContato))
                .method("POST", HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());

        return response.body();
    }

}
