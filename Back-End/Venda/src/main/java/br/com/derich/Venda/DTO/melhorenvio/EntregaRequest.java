package br.com.derich.Venda.DTO.melhorenvio;

import java.util.List;

public record EntregaRequest(
        String toPostalCode,
        String toName,
        String toPhone,
        String toAddress,
        String toCity,
        String toDocument,
        Integer toNumber,
        String toDistrict,
        String toComplemento,

        boolean receipt,
        boolean ownHand,
        boolean reverse,
        boolean nonCommercial,
        double insuranceValue,

        int service,

        List<String> productName,
        List<Integer> productQuantity,
        List<Double> productUnitaryValue,

        VolumeDTO volume,
        String vendaId
) {}
