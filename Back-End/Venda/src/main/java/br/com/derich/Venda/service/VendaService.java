package br.com.derich.Venda.service;

import br.com.derich.DTO.VendaDTO;
import br.com.derich.Venda.DTO.PagamentoCartaoRequestDTO;
import br.com.derich.Venda.DTO.PaymentPixRequestDTO;
import br.com.derich.Venda.DTO.PaymentResponseDTO;
import br.com.derich.Venda.DTO.melhorenvio.*;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.exception.ApiException;
import br.com.derich.Venda.handler.CompraFreteHandler;
import br.com.derich.Venda.processamento.IEtapaProcessamento;
import br.com.derich.Venda.repository.IVendaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.payment.*;
import com.mercadopago.core.MPRequestOptions;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import io.github.cdimascio.dotenv.Dotenv;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
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

    private static final Logger logger = LoggerFactory.getLogger(CompraFreteHandler.class);

    private final List<IEtapaProcessamento> etapas;

    private ProdutoServiceClient produtoServiceClient;

    @Autowired
    public VendaService(
            IVendaRepository vendaRepository,
            List<IEtapaProcessamento> etapas, ProdutoServiceClient produtoServiceClient) {

        this.vendaRepository = vendaRepository;
        this.etapas = etapas; // Já virá ordenada pelo @Order
        this.produtoServiceClient = produtoServiceClient;
    }

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
                    produto.setWeight(dto.getWeight());
                    System.out.println("Peso no backend: " + dto.getWeight());
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

            PaymentCreateRequest paymentCreateRequest = PaymentCreateRequest.builder()
                            .transactionAmount(pagamentoCartaoRequestDTO.getTransactionAmount())
                            .token(pagamentoCartaoRequestDTO.getToken())
                            .description(pagamentoCartaoRequestDTO.getProductDescription())
                            .installments(pagamentoCartaoRequestDTO.getInstallments())
                            .paymentMethodId(pagamentoCartaoRequestDTO.getPaymentMethodId())
                            .payer(PaymentPayerRequest.builder()
                                    .email(pagamentoCartaoRequestDTO.getPayer().getEmail())
                                    .identification(IdentificationRequest.builder()
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
            venda.setMetodoPagamento(createdPayment.getPaymentTypeId());
            System.out.println("Método de pagamento setado");
            venda.setStatusPagamento(createdPayment.getStatus());
            System.out.println("Status do pagamento setado para aprovado");

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

    // API Melhor envio
    public String calcularFrete(FreteRequest freteRequest) throws IOException, InterruptedException {
        String urlRequisicao = "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate";

        // Cria o mapa para a estrutura do JSON
        Map<String, Object> jsonMap = new HashMap<>();
        jsonMap.put("from", Collections.singletonMap("postal_code", fromPostalCode));
        jsonMap.put("to", Collections.singletonMap("postal_code", freteRequest.getToPostalCode()));

        Map<String, Object> packageMap = new HashMap<>();
        packageMap.put("height", freteRequest.getHeight());
        packageMap.put("width", freteRequest.getWidth());
        packageMap.put("length", freteRequest.getLength());
        packageMap.put("weight", freteRequest.getWeight());
        jsonMap.put("package", packageMap);

        // Serializa o objeto para JSON
        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        String jsonBody = mapper.writeValueAsString(jsonMap);
        System.out.println("Payload (packageMap):");
        System.out.println(mapper.writeValueAsString(packageMap)); // 👈 Log do package

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
        toMap.put("complemento", entregaRequest.getToComplemento());

        System.out.println("Dados do backend: " + entregaRequest.getToAddress() + entregaRequest.getToNumber() + entregaRequest.getToDistrict() + entregaRequest.getToCity() + entregaRequest.getToComplemento());

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
            BigDecimal unitaryValueReais = new BigDecimal(entregaRequest.getProductUnitaryValue().get(i))
                    .divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
            product.put("unitary_value", unitaryValueReais);
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

        System.out.println("Dimensões do Volume (cm):");
        System.out.println("Altura: " + entregaRequest.getVolumeHeight());
        System.out.println("Largura: " + entregaRequest.getVolumeWidth());
        System.out.println("Comprimento: " + entregaRequest.getVolumeLength());
        // Converte o mapa em uma string JSON
        ObjectMapper mapper = new ObjectMapper();
        String jsonBody = mapper.writeValueAsString(jsonMap);
        System.out.println("JSON Enviado inserir fretes no carrinho: " + jsonBody);

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

    @Scheduled(fixedRate = 60000)
    public void verificarStatusPagamento() {
        List<Venda> vendas = vendaRepository.findByStatusPagamentoAndStatusEtiqueta("approved", "Pendente");

        vendas.forEach(venda -> {
            try {
                processarVenda(venda);
                atualizarStatus(venda, "Aprovado");
                for (Venda.ProdutoComprado produto : venda.getProdutos()) {
                    String produtoId = produto.getProdutoId();
                    int quantidade = produto.getQuantidade();

                    // Chamar o microsserviço de produto para atualizar o estoque
                    produtoServiceClient.atualizarEstoque(produtoId, quantidade);
                }
            } catch (ApiException e) {
                logger.error("Falha crítica no processamento da venda {}: {}", venda.getId(), e.getMessage());
                atualizarStatus(venda, "Falha - " + e.getErrorCode());
            }
        });
    }

    private void processarVenda(Venda venda) throws ApiException {
        for (IEtapaProcessamento etapa : etapas) {
            etapa.executar(venda);
        }
    }

    private void atualizarStatus(Venda venda, String status) {
        venda.setStatusEtiqueta(status);
        vendaRepository.save(venda);
        logger.info("Status atualizado para {} na venda {}", status, venda.getId());
    }
}
