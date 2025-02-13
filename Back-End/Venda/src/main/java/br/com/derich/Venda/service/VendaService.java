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
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VendaService {

    @Autowired
    private IVendaRepository vendaRepository;

//    @Autowired
//    private RabbitTemplate rabbitTemplate; // Usando RabbitMQ

    public Venda salvarVenda(VendaDTO vendaDTO) {
        Venda venda = new Venda();

        if (vendaDTO.getVendaId() != null) {
            venda.setId(vendaDTO.getVendaId());
        }

        venda.setClienteId(vendaDTO.getClienteId());
        venda.setTotal(vendaDTO.getTotal());
        venda.setStatus(vendaDTO.getStatus());
        venda.setMetodoPagamento(vendaDTO.getMetodoPagamento());
        venda.setStatusPagamento(vendaDTO.getStatusPagamento());
        venda.setEnderecoEntrega(vendaDTO.getEnderecoEntrega());
        venda.setDataVenda(vendaDTO.getDataVenda());
        venda.setEmailCliente(vendaDTO.getEmailCliente());

        // Converter ProdutoCompradoDTO para ProdutoComprado
        List<Venda.ProdutoComprado> produtos = vendaDTO.getProdutos().stream()
                .map(dto -> {
                    Venda.ProdutoComprado produto = new Venda.ProdutoComprado();
                    produto.setProdutoId(dto.getProdutoId());
                    produto.setQuantidade(dto.getQuantidade());
                    produto.setNome(dto.getNome());
                    produto.setPrecoUnitario(dto.getPrecoUnitario());
                    return produto;
                })
                .collect(Collectors.toList());

        venda.setProdutos(produtos);

        return vendaRepository.save(venda);
    }

    public Venda atualizarVenda(String id, VendaDTO vendaDTO) {
        Optional<Venda> vendaOptional = vendaRepository.findById(id);
        if (vendaOptional.isEmpty()) {
            throw new RuntimeException("Venda não encontrada");
        }

        Venda venda = vendaOptional.get();

        // Atualiza os campos necessários
        if (vendaDTO.getMetodoPagamento() != null) {
            venda.setMetodoPagamento(vendaDTO.getMetodoPagamento());
        }
        if (vendaDTO.getStatusPagamento() != null) {
            venda.setStatusPagamento(vendaDTO.getStatusPagamento());
        }
        if (vendaDTO.getEnderecoEntrega() != null) {
            venda.setEnderecoEntrega(vendaDTO.getEnderecoEntrega());
        }

        return vendaRepository.save(venda);
    }



    public Payment processarPagamento(String vendaId, PagamentoRequestDTO request) throws MPException {

        System.out.println("ID da venda: " + vendaId);
        System.out.println("Dados do pagamento: " + request);


        // Verificar se a venda existe
        Venda venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));

        PaymentClient client = new PaymentClient();

        String descricaoVenda = "Pedido #" + vendaId;

        BigDecimal valorEmReais = BigDecimal.valueOf(venda.getTotal());

        // Criar pagador
        PaymentPayerRequest payer = PaymentPayerRequest.builder()
                .email(request.getEmail())
                .build();

        // Criar requisição de pagamento
        PaymentCreateRequest.PaymentCreateRequestBuilder pagamentoBuilder = PaymentCreateRequest.builder()
                .transactionAmount(valorEmReais)
                .description(descricaoVenda)
                .payer(payer)
                .paymentMethodId(request.getPaymentMethodId());

        if ("pix".equalsIgnoreCase(request.getPaymentMethodId())) {
            request.setToken(null); // Limpar o campo token, se necessário
            request.setMetodoPagamento("Pix");
        } else {
            pagamentoBuilder
                    .token(request.getToken()) // Token do cartão (gerado no frontend)
                    .installments(request.getInstallments()); // Número de parcelas (para crédito)
        }

        try {
            Payment payment = client.create(pagamentoBuilder.build());
            atualizarStatusVenda(venda, payment.getStatus());

            return payment;

        } catch (MPApiException ex) {
            throw new RuntimeException("Erro do Mercado Pago: " + ex.getApiResponse().getContent());
        } catch (MPException ex) {
            throw new RuntimeException("Erro ao processar pagamento: " + ex.getMessage());
        }
    }

    private void atualizarStatusVenda(Venda venda, String statusPagamento) {
        switch (statusPagamento.toLowerCase()) {
            case "approved":
                venda.setStatus("APROVADO");
                venda.setStatusPagamento("Pago");
                break;
            case "pending":
                venda.setStatus("PENDENTE");
                venda.setStatusPagamento("Aguardando pagamento");
                break;
            default:
                venda.setStatus("RECUSADO");
                venda.setStatusPagamento("Pagamento recusado");
                break;
        }
        vendaRepository.save(venda);
    }

}
