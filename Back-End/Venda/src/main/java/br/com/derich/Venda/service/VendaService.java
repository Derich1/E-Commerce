package br.com.derich.Venda.service;

import br.com.derich.DTO.VendaDTO;
import br.com.derich.Venda.DTO.PagamentoRequestDTO;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.repository.IVendaRepository;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.mercadopago.client.payment.PaymentPayerRequest;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendaService {

    @Autowired
    private IVendaRepository vendaRepository;

//    @Autowired
//    private RabbitTemplate rabbitTemplate; // Usando RabbitMQ

    public Venda salvarVenda(VendaDTO vendaDTO) {
        Venda venda = new Venda();

        // Converter ProdutoCompradoDTO para ProdutoComprado
        List<Venda.ProdutoComprado> produtos = vendaDTO.getProdutos().stream()
                .map(dto -> {
                    Venda.ProdutoComprado produto = new Venda.ProdutoComprado();
                    produto.setProdutoId(dto.getProdutoId());
                    produto.setQuantidade(dto.getQuantidade());
                    return produto;
                })
                .collect(Collectors.toList());

        venda.setProdutos(produtos);
        return vendaRepository.save(venda);
    }

    public Payment processarPagamento(String vendaId, PagamentoRequestDTO request) throws MPException {
        // Verificar se a venda existe
        Venda venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));

        PaymentClient client = new PaymentClient();

        BigDecimal valorEmReais = BigDecimal.valueOf(venda.getTotal()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        PaymentPayerRequest payer = PaymentPayerRequest.builder()
                .email(request.getEmail())
                .build();

        PaymentCreateRequest pagamento = PaymentCreateRequest.builder()
                .transactionAmount(valorEmReais)
                .token(request.getToken())
                .description("Pagamento da venda " + vendaId)
                .payer(payer)
                .paymentMethodId(request.getMetodoPagamento())
                .installments(request.getInstallments())
                .build();
        try {
            Payment payment = client.create(pagamento);
            String status = payment.getStatus();
            if ("approved".equalsIgnoreCase(status)) {
                venda.setStatus("APROVADO");
            } else if ("pending".equalsIgnoreCase(status)) {
                venda.setStatus("PENDENTE");
            } else {
                venda.setStatus("RECUSADO");
            }
            vendaRepository.save(venda);
            return payment;

        } catch (MPApiException ex) {
            throw new RuntimeException("Erro do Mercado Pago: " + ex.getApiResponse().getContent());
        } catch (MPException ex) {
            throw new RuntimeException("Erro ao processar pagamento: " + ex.getMessage());
        }
    }

}
