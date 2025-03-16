package br.com.derich.Venda.DTO.melhorenvio;

public class FreteRequest {

    private String produtoId;
    private String fromPostalCode;
    private String toPostalCode;
    private Integer width;
    private Integer height;
    private Integer length;
    private Integer weight;
    private Integer precoEmCentavos;
    private Integer quantidade;

    // Getters e Setters
    public String getProdutoId() { return produtoId; }
    public void setProdutoId(String produtoId) { this.produtoId = produtoId; }

    public String getFromPostalCode() { return fromPostalCode; }
    public void setFromPostalCode(String fromPostalCode) { this.fromPostalCode = fromPostalCode; }

    public String getToPostalCode() { return toPostalCode; }
    public void setToPostalCode(String toPostalCode) { this.toPostalCode = toPostalCode; }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Integer getLength() {
        return length;
    }

    public void setLength(Integer length) {
        this.length = length;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public Integer getPrecoEmCentavos() {
        return precoEmCentavos;
    }

    public void setPrecoEmCentavos(Integer precoEmCentavos) {
        this.precoEmCentavos = precoEmCentavos;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }
}

