package br.com.derich.Venda.handler;

import br.com.derich.Venda.processamento.IEtapaProcessamento;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.exception.ApiException;
import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
@Order(2)
public class GeracaoEtiquetaHandler implements IEtapaProcessamento {

    Dotenv dotenv = Dotenv.load();

    private static final Logger logger = LoggerFactory.getLogger(GeracaoEtiquetaHandler.class);

    private final ErrorHandler errorHandler;

    private String tokenMelhorEnvio = dotenv.get("tokenME");
    private String nomeAplicacao = "Ecommerce";
    private String emailParaContato = dotenv.get("emailContato");

    @Autowired
    public GeracaoEtiquetaHandler(ErrorHandler errorHandler) {
        this.errorHandler = errorHandler;
    }

    @Override
    @Retryable(
            value = {ApiException.class},
            maxAttemptsExpression = "5",
            backoff = @Backoff(delayExpression = "2000"))
    public void executar(Venda venda) throws ApiException {
        try {
            logger.info("Iniciando geração de etiqueta para venda {}", venda.getId());
            String resposta = geracaoDeEtiquetas(venda.getIdEtiqueta());

            if (errorHandler.temErro(resposta)) {
                throw new ApiException("GERAR_ETIQUETA", "Resposta da API: " + resposta);
            }
        } catch (Exception e) {
            throw new ApiException("GERAR_ETIQUETA", "Erro na geração de etiqueta: " + e.getMessage());
        }
    }

    @Recover
    public void recover(ApiException e, Venda venda) {
        logger.error("Todas as tentativas falharam para {}: {}", venda.getId(), e.getMessage());
        throw e;
    }

    @Retryable(
            value = {ApiException.class},
            maxAttemptsExpression = "${app.retry.max-attempts}",
            backoff = @Backoff(delayExpression = "${app.retry.delay-ms}"))
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
}
