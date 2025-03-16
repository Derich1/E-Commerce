package br.com.derich.Produto.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "produto")
public class Produto {

    @Id
    private String id;

    // Esta anotação só funciona em Strings
    @NotBlank(message = "Este é um campo obrigatório")
    private String nome;

    @NotBlank(message = "Este é um campo obrigatório")
    private String imagemUrl;

    @NotNull(message = "Este é um campo obrigatório")
    private Integer precoEmCentavos;

    @NotNull(message = "Este é um campo obrigatório")
    private Integer estoque;

    @NotNull(message = "Este é um campo obrigatório")
    private Boolean ativo;

    @NotBlank(message = "Este é um campo obrigatório")
    private String marca;

    @NotBlank(message = "Este é um campo obrigatório")
    private String descricao;

    @NotBlank(message = "Este é um campo obrigatório")
    private String categoria;

    @NotBlank(message = "Este é um campo obrigatório")
    private String width;

    @NotBlank(message = "Este é um campo obrigatório")
    private String height;

    @NotBlank(message = "Este é um campo obrigatório")
    private String length;

    @NotBlank(message = "Este é um campo obrigatório")
    private String weight;

    public String getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public Integer getPrecoEmCentavos() {
        return precoEmCentavos;
    }

    public void setPrecoEmCentavos(Integer precoEmCentavos) {
        this.precoEmCentavos = precoEmCentavos;
    }

    public Integer getEstoque() {
        return estoque;
    }

    public void setEstoque(Integer estoque) {
        this.estoque = estoque;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getWidth() {
        return width;
    }

    public void setWidth(String width) {
        this.width = width;
    }

    public String getHeight() {
        return height;
    }

    public void setHeight(String height) {
        this.height = height;
    }

    public String getLength() {
        return length;
    }

    public void setLength(String length) {
        this.length = length;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }
}
