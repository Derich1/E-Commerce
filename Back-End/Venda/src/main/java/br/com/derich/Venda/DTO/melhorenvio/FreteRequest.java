package br.com.derich.Venda.DTO.melhorenvio;

import java.util.List;

public class FreteRequest {

    private String toPostalCode;
    private List<Package> packages;

    public String getToPostalCode() {
        return toPostalCode;
    }

    public void setToPostalCode(String toPostalCode) {
        this.toPostalCode = toPostalCode;
    }

    public List<Package> getPackages() {
        return packages;
    }

    public void setPackages(List<Package> packages) {
        this.packages = packages;
    }
}

