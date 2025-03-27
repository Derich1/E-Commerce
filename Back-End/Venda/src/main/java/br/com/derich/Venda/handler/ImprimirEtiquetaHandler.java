package br.com.derich.Venda.handler;

import br.com.derich.Venda.processamento.IEtapaProcessamento;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.exception.ApiException;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
@Order(3)
public class ImprimirEtiquetaHandler implements IEtapaProcessamento {

    Dotenv dotenv = Dotenv.load();

    @Autowired
    private JavaMailSender emailSender;

    private static final Logger logger = LoggerFactory.getLogger(ImprimirEtiquetaHandler.class);
    private final ErrorHandler errorHandler;

    private String tokenMelhorEnvio = dotenv.get("tokenME");
    private String nomeAplicacao = "Ecommerce";
    private String emailParaContato = dotenv.get("emailContato");

    @Autowired
    public ImprimirEtiquetaHandler(ErrorHandler errorHandler) {
        this.errorHandler = errorHandler;
    }

    @Override
    @Retryable(
            value = {ApiException.class},
            maxAttemptsExpression = "5",
            backoff = @Backoff(delayExpression = "2000"))
    public void executar(Venda venda) throws ApiException {
        try {
            logger.info("Iniciando impressão de etiqueta para venda {}", venda.getId());
            String resposta = imprimirEtiquetas(venda.getIdEtiqueta());

            if (errorHandler.temErro(resposta)) {
                throw new ApiException("IMPRIMIR_ETIQUETA", "Resposta da API: " + resposta);
            }
        } catch (Exception e) {
            throw new ApiException("IMPRIMIR_ETIQUETA", "Erro na impressão da etiqueta: " + e.getMessage());
        }
    }

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
        String resposta = response.body();

        // Extrai e formata a URL
        String urlFormatada = formatarUrl(resposta);
        enviarEmailComUrl(urlFormatada, "derich.rosario22@gmail.com");
        System.out.println(response.body());
        return resposta;
    }

    private String formatarUrl(String respostaApi) {
        // Converte a resposta para JSON e extrai a URL
        JSONObject json = new JSONObject(respostaApi);
        String url = json.getString("url");

        // Remove as barras invertidas de escape (\/ → /)
        return url.replace("\\/", "/");
    }

    public void enviarEmailComUrl(String etiqueta, String destinatario) {

        try {
            // Cria a mensagem
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom("Ecommerce");
            helper.setTo(destinatario);
            helper.setSubject("Url para imprimir etiqueta");
            helper.setText(
                    "<p>Clique no link para imprimir a etiqueta:</p>" +
                            "<a href='" + etiqueta + "'>" + etiqueta + "</a>",
                    true // "true" indica que o conteúdo é HTML
            );

            emailSender.send(message);
            System.out.println("E-mail enviado com sucesso!");

        } catch (MessagingException e) {
            throw new RuntimeException("Erro ao enviar e-mail: " + e.getMessage());
        }
    }
}
