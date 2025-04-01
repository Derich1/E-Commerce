package br.com.derich.Venda.entity;

import br.com.derich.Venda.DTO.melhorenvio.Package;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "frete")
public class Frete {

    private String idEtiqueta;
    private String vendaId;
    private String codigoEnvio;
    private br.com.derich.Venda.DTO.melhorenvio.Package pacote;
    private List<Venda.ProdutoComprado> produtos;

    public Frete(String vendaId, String idEtiqueta, String codigoEnvio, br.com.derich.Venda.DTO.melhorenvio.Package pacote, List<Venda.ProdutoComprado> produtos) {
        this.vendaId = vendaId;
        this.idEtiqueta = idEtiqueta; // ou outro nome, se necessário
        this.codigoEnvio = codigoEnvio;
        this.pacote = pacote;
        this.produtos = produtos;
    }

    public String getIdEtiqueta() {
        return idEtiqueta;
    }

    public void setIdEtiqueta(String idEtiqueta) {
        this.idEtiqueta = idEtiqueta;
    }

    public String getVendaId() {
        return vendaId;
    }

    public void setVendaId(String vendaId) {
        this.vendaId = vendaId;
    }

    public String getCodigoEnvio() {
        return codigoEnvio;
    }

    public void setCodigoEnvio(String codigoEnvio) {
        this.codigoEnvio = codigoEnvio;
    }

    public Package getPacote() {
        return pacote;
    }

    public void setPacote(Package pacote) {
        this.pacote = pacote;
    }

    public List<Venda.ProdutoComprado> getProdutos() {
        return produtos;
    }

    public void setProdutos(List<Venda.ProdutoComprado> produtos) {
        this.produtos = produtos;
    }
}
