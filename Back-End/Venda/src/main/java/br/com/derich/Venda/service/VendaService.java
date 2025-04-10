package br.com.derich.Venda.service;

import br.com.derich.DTO.VendaDTO;
import br.com.derich.Venda.DTO.PagamentoCartaoRequestDTO;
import br.com.derich.Venda.DTO.PaymentPixRequestDTO;
import br.com.derich.Venda.DTO.PaymentResponseDTO;
import br.com.derich.Venda.DTO.melhorenvio.*;
import br.com.derich.Venda.DTO.melhorenvio.Package;
import br.com.derich.Venda.entity.Frete;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.exception.ApiException;
import br.com.derich.Venda.handler.CompraFreteHandler;
import br.com.derich.Venda.processamento.IEtapaProcessamento;
import br.com.derich.Venda.repository.IFreteRepository;
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

    Dotenv dotenv = Dotenv.load();

    @Autowired
    private IVendaRepository vendaRepository;

    @Autowired
    private IFreteRepository freteRepository;

    private String mercadoPagoAccessToken = dotenv.get("tokenMP");

    private String tokenMelhorEnvio = dotenv.get("tokenME");

    private String emailParaContato = dotenv.get("emailContato");

    private String nomeAplicacao = "Ecommerce";

    private String fromPostalCode = dotenv.get("POSTAL_CODE");

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
        venda.setTotal(BigDecimal.valueOf(vendaDTO.getTotal()));
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
                            .transactionAmount(pagamentoCartaoRequestDTO.transactionAmount())
                            .token(pagamentoCartaoRequestDTO.token())
                            .description(pagamentoCartaoRequestDTO.productDescription())
                            .installments(pagamentoCartaoRequestDTO.installments())
                            .paymentMethodId(pagamentoCartaoRequestDTO.paymentMethodId())
                            .payer(PaymentPayerRequest.builder()
                                    .email(pagamentoCartaoRequestDTO.payer().email())
                                    .identification(IdentificationRequest.builder()
                                            .type(pagamentoCartaoRequestDTO.payer().identification().type())
                                            .number(pagamentoCartaoRequestDTO.payer().identification().number())
                                            .build())
                                    .build())
                    .build();

            Payment createdPayment = paymentClient.create(paymentCreateRequest);

            Venda venda = vendaRepository.findById(pagamentoCartaoRequestDTO.vendaId())
                    .orElseThrow(() -> new RuntimeException("Venda não encontrada"));

            venda.setStatus("Aprovado");
            venda.setMetodoPagamento(pagamentoCartaoRequestDTO.payment_type_id());
            venda.setStatusPagamento(createdPayment.getStatus());
            venda.setInstallments(pagamentoCartaoRequestDTO.installments());
            venda.setTotal(pagamentoCartaoRequestDTO.transactionAmount());
            vendaRepository.save(venda);

            return new PaymentResponseDTO(
                    createdPayment.getId(),
                    String.valueOf(createdPayment.getStatus()),
                    createdPayment.getStatusDetail());
        } catch (MPApiException apiException) {
            throw new RuntimeException(apiException.getApiResponse().getContent());
        } catch (MPException exception) {
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
                        .transactionAmount(request.transactionAmount())
                        .description(request.description())
                        .paymentMethodId("pix")
                        .dateOfExpiration(OffsetDateTime.of(request.dateOfExpiration(), ZoneOffset.UTC))
                        .payer(
                                PaymentPayerRequest.builder()
                                        .email(request.payer().email())
                                        .firstName(request.payer().firstName())
                                        .identification(
                                                IdentificationRequest.builder()
                                                        .type(request.payer().identification().type())
                                                        .number(request.payer().identification().number())
                                                        .build())
                                        .build())
                        .build();

        Payment createdPayment = client.create(paymentCreateRequest, requestOptions);

        Venda venda = vendaRepository.findById(request.vendaId())
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));

        venda.setStatus("Aprovado");
        venda.setMetodoPagamento("Pix");
        venda.setStatusPagamento(createdPayment.getStatus());

        // Salva as alterações no banco de dados
        vendaRepository.save(venda);

        return createdPayment;
    }

    // API Melhor envio
    public String calcularFrete(FreteRequest freteRequest) throws IOException, InterruptedException {
        String urlRequisicao = "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate";

        Map<String, Object> jsonMap = new HashMap<>();
        jsonMap.put("from", Collections.singletonMap("postal_code", fromPostalCode));
        jsonMap.put("to", Collections.singletonMap("postal_code", freteRequest.toPostalCode()));

        // Trabalhando com um único pacote
        Package p = freteRequest.pacote();
        Map<String, Object> pkg = new HashMap<>();
        pkg.put("height", p.height());
        pkg.put("width", p.width());
        pkg.put("length", p.length());
        pkg.put("weight", p.weight());
        // A API do Melhor Envio usa "packages" no plural, mesmo para um único pacote, enviamos uma lista com um item
        List<Map<String, Object>> packagesList = Collections.singletonList(pkg);
        jsonMap.put("packages", packagesList);

        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        String jsonBody = mapper.writeValueAsString(jsonMap);


        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlRequisicao))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + tokenMelhorEnvio)
                .header("User-Agent", nomeAplicacao + emailParaContato)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }


    public String inserirFretesNoCarrinhoMelhorEnvio(EntregaRequest entregaRequest) throws IOException, InterruptedException {
        String urlRequisicao = "https://sandbox.melhorenvio.com.br/api/v2/me/cart";

        // Cria um mapa para representar a estrutura do JSON
        Map<String, Object> jsonMap = new HashMap<>();

        VolumeDTO volume = entregaRequest.volume(); // Pega o único volume

        // Dados do remetente ("from") – usando variáveis de ambiente
        Map<String, Object> fromMap = new HashMap<>();
        fromMap.put("postal_code", dotenv.get("POSTAL_CODE"));
        fromMap.put("name", dotenv.get("NAME"));
        fromMap.put("address", dotenv.get("ADDRESS"));
        fromMap.put("number", dotenv.get("NUMBER"));
        fromMap.put("district", dotenv.get("DISTRICT"));
        fromMap.put("city", dotenv.get("CITY"));
        fromMap.put("document", dotenv.get("DOCUMENT"));
        fromMap.put("phone", dotenv.get("PHONE"));

        // Dados do destinatário ("to")
        Map<String, Object> toMap = new HashMap<>();
        toMap.put("postal_code", entregaRequest.toPostalCode());
        toMap.put("name", entregaRequest.toName());
        toMap.put("address", entregaRequest.toAddress());
        toMap.put("number", entregaRequest.toNumber());
        toMap.put("district", entregaRequest.toDistrict());
        toMap.put("city", entregaRequest.toCity());
        toMap.put("document", entregaRequest.toDocument());
        toMap.put("complemento", entregaRequest.toComplemento());
        toMap.put("phone", entregaRequest.toPhone());

        // Opções ("options")
        Map<String, Object> optionsMap = new HashMap<>();
        optionsMap.put("receipt", entregaRequest.receipt());
        optionsMap.put("own_hand", entregaRequest.ownHand());
        optionsMap.put("reverse", entregaRequest.reverse());
        optionsMap.put("non_commercial", entregaRequest.nonCommercial());
        optionsMap.put("insurance_value", entregaRequest.insuranceValue());

        jsonMap.put("from", fromMap);
        jsonMap.put("to", toMap);
        jsonMap.put("options", optionsMap);

        // Serviço (pode ser um id ou outro tipo, conforme sua API)
        jsonMap.put("service", entregaRequest.service());

        // Monta o array de produtos
        List<Map<String, Object>> productsList = new ArrayList<>();
        // Supondo que entregaRequest possua listas para cada propriedade de produto
        // Ex.: List<String> productName, List<Integer> productQuantity, List<String> productUnitaryValue
        int productCount = entregaRequest.productName().size();
        for (int i = 0; i < productCount; i++) {
            Map<String, Object> product = new HashMap<>();
            product.put("name", entregaRequest.productName().get(i));
            product.put("quantity", entregaRequest.productQuantity().get(i));
            BigDecimal unitaryValueReais = new BigDecimal(entregaRequest.productUnitaryValue().get(i))
                    .divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
            product.put("unitary_value", unitaryValueReais);
            productsList.add(product);
        }
        jsonMap.put("products", productsList);

        // Mapeamento do único volume
        List<Map<String, Object>> volumesList = new ArrayList<>();
        Map<String, Object> volumeMap = new HashMap<>();
        volumeMap.put("height", volume.height());
        volumeMap.put("width", volume.width());
        volumeMap.put("length", volume.length());
        volumeMap.put("weight", volume.weight());
        volumesList.add(volumeMap);

        jsonMap.put("volumes", volumesList);

        // Converte o mapa em uma string JSON
        ObjectMapper mapper = new ObjectMapper();
        String jsonBody = mapper.writeValueAsString(jsonMap);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlRequisicao))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + tokenMelhorEnvio)
                .header("User-Agent", nomeAplicacao + emailParaContato)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        JSONObject jsonResponse = new JSONObject(response.body());
        String idEtiqueta = jsonResponse.getString("id");
        String codigoEnvio = jsonResponse.getString("protocol");

        Package pacote = new Package(
                entregaRequest.volume().height(),
                entregaRequest.volume().width(),
                entregaRequest.volume().length(),
                entregaRequest.volume().weight()
        );

        List<Venda.ProdutoComprado> produtos = new ArrayList<>();
        int productCounts = entregaRequest.productName().size();
        for (int i = 0; i < productCounts; i++) {
            Venda.ProdutoComprado produto = new Venda.ProdutoComprado();
            produto.setNome(entregaRequest.productName().get(i));
            produto.setQuantidade(entregaRequest.productQuantity().get(i));
            produtos.add(produto);
        }




        // Busca a venda existente no banco de dados
        Optional<Venda> vendaOptional = vendaRepository.findById(entregaRequest.vendaId());

        Venda venda = vendaOptional.get();
        venda.setIdEtiqueta(idEtiqueta); // Atualiza a venda com o ID do frete
        String emailCliente = venda.getEmailCliente();
        vendaRepository.save(venda); // Salva no banco

        Frete frete = new Frete(
                entregaRequest.vendaId(),
                idEtiqueta,
                codigoEnvio,
                emailCliente,
                pacote,
                produtos
        );

        freteRepository.save(frete);

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
                    try {
                        logger.info("🔄 Chamando serviço de produto para atualizar estoque de " + produtoId);
                        produtoServiceClient.atualizarEstoque(produtoId, quantidade);
                        logger.info("✅ Estoque atualizado com sucesso para o produto: " + produtoId);
                    } catch (Exception e) {
                        logger.error("❌ Erro ao atualizar estoque do produto " + produtoId + ": " + e.getMessage());
                    }
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
