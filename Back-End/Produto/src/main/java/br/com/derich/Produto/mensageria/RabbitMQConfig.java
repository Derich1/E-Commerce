package br.com.derich.Produto.mensageria;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public Queue vendaFinalizadaQueue() {
        return new Queue("venda.finalizada", true);
    }
}

