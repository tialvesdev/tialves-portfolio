package dev.tiago.portfolio.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import dev.tiago.portfolio.service.ContactNotifier;
import dev.tiago.portfolio.service.ResendContactNotifier;

/** Escolhe como avisar das mensagens: e-mail pelo Resend (com chave) ou só um registro no log. */
@Configuration
public class MailConfig {

    private static final Logger log = LoggerFactory.getLogger(MailConfig.class);

    @Bean
    ContactNotifier contactNotifier(PortfolioProperties props, RestClient.Builder builder) {
        PortfolioProperties.Mail mail = props.mail();
        if (mail != null && mail.enabled()) {
            log.info("Mensagens de contato serão enviadas por e-mail (Resend)");
            return new ResendContactNotifier(builder, mail);
        }
        log.warn("RESEND_API_KEY não definida: as mensagens de contato só ficam registradas no log");
        return message -> log.info("Mensagem de contato {} recebida (envio por e-mail desligado)", message.id());
    }
}
