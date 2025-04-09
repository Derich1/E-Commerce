package br.com.derich.Venda.config;

import com.mercadopago.MercadoPagoConfig;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

@Configuration
public class MercadoPagoConfiguration {

    Dotenv dotenv = Dotenv.load();

    private String accessToken = dotenv.get("tokenMP");

    @PostConstruct
    public void init() {
        MercadoPagoConfig.setAccessToken(accessToken);
    }
}
