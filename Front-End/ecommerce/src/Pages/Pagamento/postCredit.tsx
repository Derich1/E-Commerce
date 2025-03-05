import axios from "axios"

export async function postCredit(
    token: string,
    issuer_id: string,
    payment_method_id: string,
    transactionAmount: number,
    installments: number,
    email: string,
    identificationType: string,
    identificationNumber: string
) {
    const body = {
        token,
        issuer_id,
        payment_method_id,
        transactionAmount: transactionAmount,
        installments: Number(installments),
        description: "blablabla",
        payer: {
            email,
            identification: {
                type: identificationType,
                number: identificationNumber
            }
        }
    }

    console.log("Payload enviado:", JSON.stringify(body));


    return await axios.post("http://localhost:8083/venda/processarPagamento", body, {
        headers: {
            "Content-Type": "application/json",
        },
    });    
}