package br.com.derich.Venda.DTO.melhorenvio;

import java.util.List;

public class EntregaRequest {

    private String toPostalCode;
    private String toName;
    private String toAddress;
    private String toCity;
    private String toDocument;
    private Integer toNumber;
    private String toDistrict;
    private String toComplemento;

    // Opções
    private boolean receipt;
    private boolean ownHand;
    private boolean reverse;
    private boolean nonCommercial;
    private double insuranceValue;

    // Serviço
    private int service;

    // Produtos
    private List<String> productName;
    private List<Integer> productQuantity;
    private List<Double> productUnitaryValue;

    // Volumes
    private int volumeHeight;
    private int volumeWidth;
    private int volumeLength;
    private double volumeWeight;

    private String vendaId;

    public String getToPostalCode() {
        return toPostalCode;
    }

    public void setToPostalCode(String toPostalCode) {
        this.toPostalCode = toPostalCode;
    }

    public String getToName() {
        return toName;
    }

    public void setToName(String toName) {
        this.toName = toName;
    }

    public String getToAddress() {
        return toAddress;
    }

    public void setToAddress(String toAddress) {
        this.toAddress = toAddress;
    }

    public String getToCity() {
        return toCity;
    }

    public void setToCity(String toCity) {
        this.toCity = toCity;
    }

    public String getToDocument() {
        return toDocument;
    }

    public void setToDocument(String toDocument) {
        this.toDocument = toDocument;
    }

    public Integer getToNumber() {
        return toNumber;
    }

    public void setToNumber(Integer toNumber) {
        this.toNumber = toNumber;
    }

    public String getToDistrict() {
        return toDistrict;
    }

    public void setToDistrict(String toDistrict) {
        this.toDistrict = toDistrict;
    }

    public String getToComplemento() {
        return toComplemento;
    }

    public void setToComplemento(String toComplemento) {
        this.toComplemento = toComplemento;
    }

    public boolean isReceipt() {
        return receipt;
    }

    public void setReceipt(boolean receipt) {
        this.receipt = receipt;
    }

    public boolean isOwnHand() {
        return ownHand;
    }

    public void setOwnHand(boolean ownHand) {
        this.ownHand = ownHand;
    }

    public boolean isReverse() {
        return reverse;
    }

    public void setReverse(boolean reverse) {
        this.reverse = reverse;
    }

    public boolean isNonCommercial() {
        return nonCommercial;
    }

    public void setNonCommercial(boolean nonCommercial) {
        this.nonCommercial = nonCommercial;
    }

    public double getInsuranceValue() {
        return insuranceValue;
    }

    public void setInsuranceValue(double insuranceValue) {
        this.insuranceValue = insuranceValue;
    }

    public int getService() {
        return service;
    }

    public void setService(int service) {
        this.service = service;
    }

    public List<String> getProductName() {
        return productName;
    }

    public void setProductName(List<String> productName) {
        this.productName = productName;
    }

    public List<Integer> getProductQuantity() {
        return productQuantity;
    }

    public void setProductQuantity(List<Integer> productQuantity) {
        this.productQuantity = productQuantity;
    }

    public List<Double> getProductUnitaryValue() {
        return productUnitaryValue;
    }

    public void setProductUnitaryValue(List<Double> productUnitaryValue) {
        this.productUnitaryValue = productUnitaryValue;
    }

    public int getVolumeHeight() {
        return volumeHeight;
    }

    public void setVolumeHeight(int volumeHeight) {
        this.volumeHeight = volumeHeight;
    }

    public int getVolumeWidth() {
        return volumeWidth;
    }

    public void setVolumeWidth(int volumeWidth) {
        this.volumeWidth = volumeWidth;
    }

    public int getVolumeLength() {
        return volumeLength;
    }

    public void setVolumeLength(int volumeLength) {
        this.volumeLength = volumeLength;
    }

    public double getVolumeWeight() {
        return volumeWeight;
    }

    public void setVolumeWeight(double volumeWeight) {
        this.volumeWeight = volumeWeight;
    }

    public String getVendaId() {
        return vendaId;
    }

    public void setVendaId(String vendaId) {
        this.vendaId = vendaId;
    }
}
