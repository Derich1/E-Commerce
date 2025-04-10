import axios from "axios"

export async function postCredit(
    token: string,
    issuer_id: string,
    payment_method_id: string,
    totalComFrete: number,
    installments: number,
    description: string,
    email: string,
    identificationType: string,
    identificationNumber: string,
    selectedPaymentType: string,
    vendaId: string,
) {
    const body = {
        token,
        issuer_id,
        payment_method_id,
        transactionAmount: Number(totalComFrete).toFixed(2),
        installments: Number(installments),
        description,
        payer: {
            email,
            identification: {
                type: identificationType,
                number: identificationNumber
            }
        },
        payment_type_id: selectedPaymentType,
        vendaId,
    }


    return await axios.post("http://localhost:8083/venda/processarPagamento", body, {
        headers: {
            "Content-Type": "application/json",
        },
    });    
}