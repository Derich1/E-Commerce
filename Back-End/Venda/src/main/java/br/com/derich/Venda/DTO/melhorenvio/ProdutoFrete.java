package br.com.derich.Venda.DTO.melhorenvio;

public class ProdutoFrete {
    private String id;
    private int width;
    private int height;
    private int length;
    private int weight;
    private int precoEmCentavos;
    private int quantidade;

    public String getId() {
        return id;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }

    public int getPrecoEmCentavos() {
        return precoEmCentavos;
    }

    public void setPrecoEmCentavos(int precoEmCentavos) {
        this.precoEmCentavos = precoEmCentavos;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }
}
