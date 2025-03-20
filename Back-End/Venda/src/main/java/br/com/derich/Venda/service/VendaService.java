package br.com.derich.Venda.service;

import br.com.derich.DTO.VendaDTO;
import br.com.derich.Venda.DTO.PagamentoCartaoRequestDTO;
import br.com.derich.Venda.DTO.PaymentPixRequestDTO;
import br.com.derich.Venda.DTO.PaymentResponseDTO;
import br.com.derich.Venda.DTO.melhorenvio.EntregaRequest;
import br.com.derich.Venda.DTO.melhorenvio.FreteRequest;
import br.com.derich.Venda.DTO.melhorenvio.ProdutoFrete;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.repository.IVendaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.core.MPRequestOptions;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import io.github.cdimascio.dotenv.Dotenv;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
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

    Dotenv dotenv = Dotenv.load();

    private String fromPostalCode = dotenv.get("POSTAL_CODE");

    private String etiquetaId;

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
        venda.setStatusEtiqueta(vendaDTO.getStatusEtiqueta());

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
                        .paymentMethodId("pix")
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

        // Cria o mapa para a estrutura do JSON
        Map<String, Object> jsonMap = new HashMap<>();
        jsonMap.put("from", Collections.singletonMap("postal_code", fromPostalCode));
        jsonMap.put("to", Collections.singletonMap("postal_code", freteRequest.getToPostalCode()));

        // Constrói a lista de produtos
        List<Map<String, Object>> productsList = new ArrayList<>();
        for (ProdutoFrete produto : freteRequest.getProducts()) {
            Map<String, Object> produtoMap = new HashMap<>();
            produtoMap.put("id", produto.getId());
            produtoMap.put("width", produto.getWidth());
            produtoMap.put("height", produto.getHeight());
            produtoMap.put("length", produto.getLength());
            produtoMap.put("weight", produto.getWeight());
            // Divide o valor do seguro por 100, conforme a API do Melhor Envio
            produtoMap.put("insurance_value", produto.getPrecoEmCentavos() / 100);
            produtoMap.put("quantity", produto.getQuantidade());
            productsList.add(produtoMap);
        }
        jsonMap.put("products", productsList);

        // Serializa o objeto para JSON
        ObjectMapper mapper = new ObjectMapper();
        String jsonBody = mapper.writeValueAsString(jsonMap);

        // Cria e envia a requisição HTTP
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlRequisicao))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + tokenMelhorEnvio)
                .header("User-Agent", nomeAplicacao + emailParaContato)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());

        return response.body();
    }

    public String inserirFretesNoCarrinhoMelhorEnvio(EntregaRequest entregaRequest) throws IOException, InterruptedException {
        String urlRequisicao = "https://sandbox.melhorenvio.com.br/api/v2/me/cart";

        // Cria um mapa para representar a estrutura do JSON
        Map<String, Object> jsonMap = new HashMap<>();

        // Dados do remetente ("from") – usando variáveis de ambiente
        Map<String, Object> fromMap = new HashMap<>();
        fromMap.put("postal_code", dotenv.get("POSTAL_CODE"));
        fromMap.put("name", dotenv.get("NAME"));
        fromMap.put("address", dotenv.get("ADDRESS"));
        fromMap.put("number", dotenv.get("NUMBER"));
        fromMap.put("district", dotenv.get("DISTRICT"));
        fromMap.put("city", dotenv.get("CITY"));
        fromMap.put("document", dotenv.get("DOCUMENT"));

        System.out.println("Document enviado: " + dotenv.get("DOCUMENT"));

        // Dados do destinatário ("to")
        Map<String, Object> toMap = new HashMap<>();
        toMap.put("postal_code", entregaRequest.getToPostalCode());
        toMap.put("name", entregaRequest.getToName());
        toMap.put("address", entregaRequest.getToAddress());
        toMap.put("number", entregaRequest.getToNumber());
        toMap.put("district", entregaRequest.getToDistrict());
        toMap.put("city", entregaRequest.getToCity());
        toMap.put("document", entregaRequest.getToDocument());

        // Opções ("options")
        Map<String, Object> optionsMap = new HashMap<>();
        optionsMap.put("receipt", entregaRequest.isReceipt());
        optionsMap.put("own_hand", entregaRequest.isOwnHand());
        optionsMap.put("reverse", entregaRequest.isReverse());
        optionsMap.put("non_commercial", entregaRequest.isNonCommercial());
        optionsMap.put("insurance_value", entregaRequest.getInsuranceValue());

        jsonMap.put("from", fromMap);
        jsonMap.put("to", toMap);
        jsonMap.put("options", optionsMap);

        // Serviço (pode ser um id ou outro tipo, conforme sua API)
        jsonMap.put("service", entregaRequest.getService());

        // Monta o array de produtos
        List<Map<String, Object>> productsList = new ArrayList<>();
        // Supondo que entregaRequest possua listas para cada propriedade de produto
        // Ex.: List<String> productName, List<Integer> productQuantity, List<String> productUnitaryValue
        int productCount = entregaRequest.getProductName().size();
        for (int i = 0; i < productCount; i++) {
            Map<String, Object> product = new HashMap<>();
            product.put("name", entregaRequest.getProductName().get(i));
            product.put("quantity", entregaRequest.getProductQuantity().get(i));
            product.put("unitary_value", entregaRequest.getProductUnitaryValue().get(i));
            productsList.add(product);
        }
        jsonMap.put("products", productsList);

        // Monta o array de volumes – geralmente pode ser apenas um volume, mas a API espera um array
        List<Map<String, Object>> volumesList = new ArrayList<>();
        Map<String, Object> volume = new HashMap<>();
        volume.put("height", entregaRequest.getVolumeHeight());
        volume.put("width", entregaRequest.getVolumeWidth());
        volume.put("length", entregaRequest.getVolumeLength());
        volume.put("weight", entregaRequest.getVolumeWeight());
        volumesList.add(volume);
        jsonMap.put("volumes", volumesList);

        // Converte o mapa em uma string JSON
        ObjectMapper mapper = new ObjectMapper();
        String jsonBody = mapper.writeValueAsString(jsonMap);
        System.out.println("JSON Enviado: " + jsonBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlRequisicao))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + tokenMelhorEnvio)
                .header("User-Agent", nomeAplicacao + emailParaContato)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Resposta da API: " + response.body());

        JSONObject jsonResponse = new JSONObject(response.body());
        String idEtiqueta = jsonResponse.getString("id");

        // Busca a venda existente no banco de dados
        Optional<Venda> vendaOptional = vendaRepository.findById(entregaRequest.getVendaId());
        if (vendaOptional.isPresent()) {
            Venda venda = vendaOptional.get();
            venda.setIdEtiqueta(idEtiqueta); // Atualiza a venda com o ID do frete
            vendaRepository.save(venda); // Salva no banco
            System.out.println("Venda atualizada com ID da etiqueta: " + idEtiqueta);
        } else {
            System.out.println("Venda não encontrada com o ID: " + entregaRequest.getVendaId());
        }

        return response.body();
    }


    // tem que pegar o id retornado após adicionar a etiqueta no carrinho (inserirFretesNoCarrinhoMelhorEnvio)
    public String comprarFretesNoCarrinhoMelhorEnvio(String id) throws IOException, InterruptedException {
        String urlRequisicao = "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/checkout";

        String jsonBody = String.format("""
            {
                "orders": ["%s"]
            }
        """, id);

                HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlRequisicao))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + tokenMelhorEnvio)
                .header("User-Agent", nomeAplicacao + (emailParaContato))
                .method("POST", HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
        return response.body();
    }

    // Após comprar as etiquetas, é necessário gerar as etiquetas antes de imprimir e realizar a postagem das mesmas.
    // Para isto, basta realizar a requisição informando o id da etiqueta de envio.
    // tem que pegar o id retornado após adicionar a etiqueta no carrinho (inserirFretesNoCarrinhoMelhorEnvio)
    public String geracaoDeEtiquetas(String id) throws IOException, InterruptedException {
        String urlRequisicao = "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/generate";

        String jsonBody = String.format("""
            {
                "orders": ["%s"]
            }
        """, id);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlRequisicao))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + tokenMelhorEnvio)
                .header("User-Agent", nomeAplicacao + (emailParaContato))
                .method("POST", HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
        return response.body();
    }

    // tem que pegar o id retornado após adicionar a etiqueta no carrinho (inserirFretesNoCarrinhoMelhorEnvio)
    public String imprimirEtiquetas(String id) throws IOException, InterruptedException {
        String urlRequisicao = "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/print";

        String jsonBody = String.format("""
            {
                "orders": ["%s"]
            }
        """, id);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlRequisicao))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + tokenMelhorEnvio)
                .header("User-Agent", nomeAplicacao + (emailParaContato))
                .method("POST", HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
        return response.body();
    }

    // tem que pegar o id retornado após adicionar a etiqueta no carrinho (inserirFretesNoCarrinhoMelhorEnvio)
    public String rastrearEnvio(String id) throws IOException, InterruptedException {
        String urlRequisicao = "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/tracking";

        String jsonBody = String.format("""
            {
                "orders": "%s"
            }
        """, id);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlRequisicao))
                .header("Accept", "application/json")
                .header("Content-type", "application/json")
                .header("Authorization", "Bearer" + tokenMelhorEnvio)
                .header("User-Agent", nomeAplicacao + (emailParaContato))
                .method("POST", HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
        return response.body();
    }

    private boolean temErroNaResposta(String resposta) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(resposta);

            // Verifica se há um campo "errors" no JSON (API retorna erros nesse campo)
            return jsonNode.has("errors") || jsonNode.has("message");
        } catch (Exception e) {
            System.err.println("Erro ao analisar resposta da API: " + e.getMessage());
            return true; // Se não conseguir processar o JSON, assume erro
        }
    }

    @Scheduled(fixedRate = 5000) // A cada 10 minutos = 600000
    public void verificarStatusPagamento() throws IOException, InterruptedException {
        List<Venda> vendasPendentes = vendaRepository.findByStatusPagamento("approved");

        for (Venda venda : vendasPendentes) {
            if ("Pendente".equals(venda.getStatusEtiqueta()) && "approved".equals(venda.getStatusPagamento())) {
                try {
                    // 1️⃣ Comprar frete
                    String respostaCompra = comprarFretesNoCarrinhoMelhorEnvio(venda.getIdEtiqueta());
                    if (temErroNaResposta(respostaCompra)) {
                        System.err.println("Falha ao comprar frete para a venda: " + venda.getId());
                        continue; // Pula para a próxima venda
                    }

                    // 2️⃣ Gerar etiqueta
                    String respostaGeracao = geracaoDeEtiquetas(venda.getIdEtiqueta());
                    if (temErroNaResposta(respostaGeracao)) {
                        System.err.println("Falha ao gerar etiqueta para a venda: " + venda.getId());
                        continue;
                    }

                    // 3️⃣ Imprimir etiqueta
                    String respostaImpressao = imprimirEtiquetas(venda.getIdEtiqueta());
                    if (temErroNaResposta(respostaImpressao)) {
                        System.err.println("Falha ao imprimir etiqueta para a venda: " + venda.getId());
                        continue;
                    }

                    // 4️⃣ Atualizar status no banco de dados
                    venda.setStatusEtiqueta("Aprovado");
                    vendaRepository.save(venda);
                    System.out.println("Status da etiqueta atualizado para 'Aprovado' para a venda: " + venda.getId());

                } catch (Exception e) {
                    System.err.println("Erro ao processar venda " + venda.getId() + ": " + e.getMessage());
                }
            }
        }
    }
}
