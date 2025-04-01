package br.com.derich.Venda.DTO.melhorenvio;

import java.util.List;

public class VolumeDTO {
    private double height;
    private double width;
    private double length;
    private double weight;
    private List<String> productId;
    private List<String> productName;
    private List<Integer> productQuantity;
    private List<Double> productUnitaryValue;
    private List<Double> productWeight;

    // Getters e Setters

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public double getWidth() {
        return width;
    }

    public void setWidth(double width) {
        this.width = width;
    }

    public double getLength() {
        return length;
    }

    public void setLength(double length) {
        this.length = length;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public List<String> getProductId() {
        return productId;
    }

    public void setProductId(List<String> productId) {
        this.productId = productId;
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

    public List<Double> getProductWeight() {
        return productWeight;
    }

    public void setProductWeight(List<Double> productWeight) {
        this.productWeight = productWeight;
    }
}