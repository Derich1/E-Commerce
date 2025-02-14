package br.com.derich.Venda.service;

import br.com.derich.DTO.VendaDTO;
import br.com.derich.Venda.DTO.PagamentoRequestDTO;
import br.com.derich.Venda.entity.Venda;
import br.com.derich.Venda.repository.IVendaRepository;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.exceptions.MPApiException;
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

    public Payment processarPagamento(String vendaId, PagamentoRequestDTO request) throws Exception {

        // 1. Buscar a venda
        Venda venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));

        // 3. Criar cliente de pagamento
        PaymentClient client = new PaymentClient();

        BigDecimal totalVenda = new BigDecimal(venda.getTotal());

        // 4. Construir requisição
        PaymentCreateRequest createRequest = PaymentCreateRequest.builder()
                .transactionAmount(totalVenda) // Usar BigDecimal do total da venda
                .description("Pagamento para venda #" + vendaId)
                .paymentMethodId(request.getMetodoPagamento())
                .payer(
                        PaymentPayerRequest.builder()
                                .email(request.getEmail())
                                .firstName(request.getNome()) // Novo campo obrigatório
                                .lastName(request.getSobrenome()) // Novo campo obrigatório
                                .identification(
                                        IdentificationRequest.builder()
                                                .type(request.getTipoDocumento())
                                                .number(request.getNumeroDocumento())
                                                .build()
                                )
                                .build()
                )
                .token(request.getToken()) // Token sempre vem do DTO
                .installments(request.getInstallments()) // Parcelas sempre vem do DTO
                .build();

        try {
            // 5. Processar pagamento
            Payment payment = client.create(createRequest);

            venda.setPagamentoId(payment.getId());
            vendaRepository.save(venda);

            // 6. Atualizar status da venda
            atualizarStatusVenda(venda, payment.getStatus());

            return payment;

        } catch (MPApiException ex) {
            String errorDetails = String.format("Erro MP [%d]: %s",
                    ex.getApiResponse().getStatusCode(),
                    ex.getApiResponse().getContent());
            throw new RuntimeException(errorDetails);

        } catch (Exception ex) {
            throw new RuntimeException("Falha no processamento: " + ex.getMessage());
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
