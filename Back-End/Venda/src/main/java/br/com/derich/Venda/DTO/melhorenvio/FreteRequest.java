package br.com.derich.Venda.DTO.melhorenvio;

import java.util.List;

public class FreteRequest {

    private String toPostalCode;
    private Package pacote;

    public String getToPostalCode() {
        return toPostalCode;
    }

    public void setToPostalCode(String toPostalCode) {
        this.toPostalCode = toPostalCode;
    }

    public Package getPacote() {
        return pacote;
    }

    public void setPacote(Package pacote) {
        this.pacote = pacote;
    }
}

