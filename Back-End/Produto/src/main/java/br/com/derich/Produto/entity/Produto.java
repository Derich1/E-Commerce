package br.com.derich.Produto.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.sql.Date;
import java.time.LocalDate;

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

    private String ean;

    @NotNull(message = "Este é um campo obrigatório")
    private Double width;

    @NotNull(message = "Este é um campo obrigatório")
    private Double height;

    @NotNull(message = "Este é um campo obrigatório")
    private Double length;

    @NotNull(message = "Este é um campo obrigatório")
    private Double weight;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate promotionStart;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate promotionEnd;

    private Integer promotionalPrice;

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

    public String getEan() {
        return ean;
    }

    public void setEan(String ean) {
        this.ean = ean;
    }

    public Double getWidth() {
        return width;
    }

    public void setWidth(Double width) {
        this.width = width;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public Double getLength() {
        return length;
    }

    public void setLength(Double length) {
        this.length = length;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public LocalDate getPromotionStart() {
        return promotionStart;
    }

    public void setPromotionStart(LocalDate promotionStart) {
        this.promotionStart = promotionStart;
    }

    public LocalDate getPromotionEnd() {
        return promotionEnd;
    }

    public void setPromotionEnd(LocalDate promotionEnd) {
        this.promotionEnd = promotionEnd;
    }

    public Integer getPromotionalPrice() {
        return promotionalPrice;
    }

    public void setPromotionalPrice(Integer promotionalPrice) {
        this.promotionalPrice = promotionalPrice;
    }
}
