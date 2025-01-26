package br.com.derich.Produto.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.bson.types.ObjectId;
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
}
