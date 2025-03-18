package br.com.derich.Venda.DTO.melhorenvio;

public class EntregaRequest {

    private String toPostalCode;
    private String toName;
    private String toAddress;
    private String toCity;
    private String toDocument;

    // Opções
    private boolean receipt;
    private boolean ownHand;
    private boolean reverse;
    private boolean nonCommercial;
    private double insuranceValue;

    // Serviço
    private int service;

    // Produtos
    private String productName;
    private int productQuantity;
    private double productUnitaryValue;

    // Volumes
    private int volumeHeight;
    private int volumeWidth;
    private int volumeLength;
    private double volumeWeight;

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

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getProductQuantity() {
        return productQuantity;
    }

    public void setProductQuantity(int productQuantity) {
        this.productQuantity = productQuantity;
    }

    public double getProductUnitaryValue() {
        return productUnitaryValue;
    }

    public void setProductUnitaryValue(double productUnitaryValue) {
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
}
