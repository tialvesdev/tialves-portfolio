package dev.tiago.portfolio.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "portfolio")
public record PortfolioProperties(Cors cors, Contact contact) {

    public record Cors(@DefaultValue("http://localhost:5173") List<String> allowedOrigins) {
    }

    public record Contact(@DefaultValue("200") int maxStored) {
    }
}
