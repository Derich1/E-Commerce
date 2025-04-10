package br.com.derich.Venda.handler;

import br.com.derich.Venda.DTO.melhorenvio.Package;
import br.com.derich.Venda.entity.Frete;
import br.com.derich.Venda.processamento.IEtapaProcessamento;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.exception.ApiException;
import br.com.derich.Venda.repository.IFreteRepository;
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
import java.util.List;
import java.util.Optional;

@Component
@Order(3)
public class ImprimirEtiquetaHandler implements IEtapaProcessamento {

    Dotenv dotenv = Dotenv.load();

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private IFreteRepository freteRepository;

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
        Frete frete = freteRepository.findByIdEtiqueta(id)
                .orElseThrow(() -> new RuntimeException("Frete não encontrado para o ID: " + id));

        enviarEmailComUrl(urlFormatada, "derich.rosario22@gmail.com", frete);
        return resposta;
    }

    private String formatarUrl(String respostaApi) {
        // Converte a resposta para JSON e extrai a URL
        JSONObject json = new JSONObject(respostaApi);
        String url = json.getString("url");

        // Remove as barras invertidas de escape (\/ → /)
        return url.replace("\\/", "/");
    }

    public void enviarEmailComUrl(String etiqueta, String destinatario, Frete frete) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("Ecommerce");
            helper.setTo(destinatario);
            helper.setSubject("Url para imprimir etiqueta");

            // Extrai dados do objeto Frete
            String idEtiqueta = frete.getIdEtiqueta();
            Package pacote = frete.getPacote();
            List<Venda.ProdutoComprado> produtos = frete.getProdutos();
            String codigoEnvio = frete.getCodigoEnvio();
            String emailCliente = frete.getEmailCliente();

            // Constrói a seção de dimensões
            String dimensoes = String.format(
                    "<div style='margin: 15px 0;'>" +
                            "<h3 style='color: #333; margin-bottom: 10px;'>Dimensões da Caixa</h3>" +
                            "<ul style='list-style: none; padding: 0;'>" +
                            "<li><strong>Altura:</strong> %.2f cm</li>" +
                            "<li><strong>Largura:</strong> %.2f cm</li>" +
                            "<li><strong>Comprimento:</strong> %.2f cm</li>" +
                            "<li><strong>Peso total:</strong> %.2f kg</li>" +
                            "</ul>" +
                            "</div>",
                    pacote.height(),
                    pacote.width(),
                    pacote.length(),
                    pacote.weight()
            );

            // Constrói a tabela de produtos
            StringBuilder produtosHtml = new StringBuilder()
                    .append("<div style='margin: 20px 0;'>")
                    .append("<h3 style='color: #333; margin-bottom: 10px;'>Produtos</h3>")
                    .append("<table style='width: 100%; border-collapse: collapse;'>")
                    .append("<tr style='background-color: #f5f5f5;'>")
                    .append("<th style='padding: 10px; border: 1px solid #ddd;'>Produto</th>")
                    .append("<th style='padding: 10px; border: 1px solid #ddd;'>Quantidade</th>")
                    .append("</tr>");

            for (Venda.ProdutoComprado produto : produtos) {
                produtosHtml
                        .append("<tr>")
                        .append(String.format("<td style='padding: 10px; border: 1px solid #ddd;'>%s</td>", produto.getNome()))
                        .append(String.format("<td style='padding: 10px; border: 1px solid #ddd; text-align: center;'>%d</td>", produto.getQuantidade()))
                        .append("</tr>");
            }

            produtosHtml.append("</table></div>");

            String notificacao = String.format(
                    "<div style='margin: 20px 0; padding: 15px; background-color: #fff3cd; border-radius: 5px; border: 1px solid #ffeeba;'>" +
                            "<p style='color: #856404; margin: 0;'>" +
                            "Após postar a encomenda, entre no Melhor Rastreio, encontre a etiqueta com código de envio <strong>%s</strong> " +
                            "e ative as notificações da entrega para este email: <strong>%s</strong>" +
                            "</p>" +
                            "</div>",
                    codigoEnvio,
                    emailCliente
            );

            // Corpo completo do e-mail
            String corpoEmail = String.format(
                    "<html>" +
                            "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                            "<div style='max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee;'>" +
                            "<h2 style='color: #0066cc;'>Código do Envio #%s</h2>" +
                            "%s" + // Dimensões
                            "%s" + // Produtos
                            "%s" + // Notificação
                            "<div style='margin-top: 25px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;'>" +
                            "<p>Clique abaixo para imprimir sua etiqueta:</p>" +
                            "<a href='%s' style='display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 3px;'>" +
                            "🖨️ Imprimir Etiqueta</a>" +
                            "<p style='margin-top: 15px; font-size: 0.9em; color: #666;'>" +
                            "Caso o botão não funcione, copie e cole este link no navegador:<br>" +
                            "<span style='word-break: break-all; color: #004499;'>%s</span>" +
                            "</p>" +
                            "</div>" +
                            "</div>" +
                            "</body>" +
                            "</html>",
                    codigoEnvio,
                    dimensoes,
                    produtosHtml,
                    notificacao,
                    etiqueta,
                    etiqueta
            );

            helper.setText(corpoEmail, true);
            emailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Erro ao enviar e-mail: " + e.getMessage());
        }
    }
}
