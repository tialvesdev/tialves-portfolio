package dev.tiago.portfolio.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import dev.tiago.portfolio.config.PortfolioProperties;
import dev.tiago.portfolio.model.ContactRequest;

/**
 * Manda cada mensagem do formulário para o e-mail do Tiago pela API do Resend
 * (POST /emails). O "responder para" é o e-mail de quem escreveu.
 */
public class ResendContactNotifier implements ContactNotifier {

    private static final Logger log = LoggerFactory.getLogger(ResendContactNotifier.class);

    private final RestClient http;
    private final PortfolioProperties.Mail mail;

    public ResendContactNotifier(RestClient.Builder builder, PortfolioProperties.Mail mail) {
        this.mail = mail;
        this.http = builder
                .baseUrl(mail.resendBaseUrl())
                .defaultHeader("Authorization", "Bearer " + mail.resendApiKey())
                .build();
    }

    @Override
    public void deliver(ContactService.StoredMessage message) {
        ContactRequest req = message.request();
        Map<String, Object> body = Map.of(
                "from", mail.from(),
                "to", List.of(mail.to()),
                "reply_to", req.email(),
                "subject", "Portfólio · mensagem de " + oneLine(req.name()),
                "text", """
                        Nova mensagem gravada no cristal do portfólio.

                        Nome: %s
                        E-mail: %s

                        %s
                        """.formatted(oneLine(req.name()), req.email(), req.message()));
        try {
            http.post()
                    .uri("/emails")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Mensagem {} enviada por e-mail", message.id());
        } catch (RestClientException e) {
            // Não registra o conteúdo nem o e-mail de quem escreveu.
            log.warn("Falha ao enviar a mensagem {} pelo Resend: {}", message.id(), e.getClass().getSimpleName());
            throw new ContactDeliveryException("Não foi possível enviar a mensagem agora.", e);
        }
    }

    /** Evita quebras de linha no assunto (cabeçalho de e-mail). */
    private static String oneLine(String s) {
        return s.replaceAll("[\\r\\n]+", " ").trim();
    }
}
