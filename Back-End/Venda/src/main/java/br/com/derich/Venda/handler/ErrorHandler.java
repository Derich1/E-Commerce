package br.com.derich.Venda.handler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.IOException;

// Criar componente separado
@Component
public class ErrorHandler {
    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean temErro(String resposta) {
        try {
            JsonNode jsonNode = objectMapper.readTree(resposta);
            return jsonNode.has("errors") || jsonNode.has("message");
        } catch (IOException e) {
            return true;
        }
    }
}
