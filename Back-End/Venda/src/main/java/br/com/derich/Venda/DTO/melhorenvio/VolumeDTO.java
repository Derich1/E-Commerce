package br.com.derich.Venda.DTO.melhorenvio;

import java.util.List;

public record VolumeDTO(
        double height,
        double width,
        double length,
        double weight,
        List<String> productId,
        List<String> productName,
        List<Integer> productQuantity,
        List<Double> productUnitaryValue,
        List<Double> productWeight
) {}