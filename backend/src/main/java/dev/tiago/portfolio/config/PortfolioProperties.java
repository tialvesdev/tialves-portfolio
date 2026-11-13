package dev.tiago.portfolio.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "portfolio")
public record PortfolioProperties(Cors cors, Contact contact, Mail mail) {

    public record Cors(@DefaultValue("http://localhost:5173") List<String> allowedOrigins) {
    }

    public record Contact(@DefaultValue("200") int maxStored) {
    }

    /**
     * Envio das mensagens do formulário por e-mail, pela API do Resend.
     * Sem {@code resendApiKey} a API só registra que a mensagem chegou (útil no desenvolvimento).
     */
    public record Mail(
            String resendApiKey,
            @DefaultValue("tialves.dev@gmail.com") String to,
            @DefaultValue("Portfólio do Tiago <onboarding@resend.dev>") String from,
            @DefaultValue("https://api.resend.com") String resendBaseUrl) {

        public boolean enabled() {
            return resendApiKey != null && !resendApiKey.isBlank();
        }
    }
}
