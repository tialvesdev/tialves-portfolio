package dev.tiago.portfolio.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import dev.tiago.portfolio.config.PortfolioProperties;
import dev.tiago.portfolio.model.ContactRequest;

class ResendContactNotifierTest {

    private MockRestServiceServer server;
    private ResendContactNotifier notifier;

    private final ContactService.StoredMessage msg = new ContactService.StoredMessage(
            "id-1", Instant.parse("2026-11-12T10:00:00Z"),
            new ContactRequest("Ana\nSouza", "ana@empresa.com", "Vi seu portfólio e queria conversar."));

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        var mail = new PortfolioProperties.Mail("re_teste", "tiago@example.com", "Portfólio <onboarding@resend.dev>", "https://api.resend.com");
        notifier = new ResendContactNotifier(builder, mail);
    }

    @Test
    void sendsEmailToTiagoWithReplyToTheVisitor() {
        server.expect(requestTo("https://api.resend.com/emails"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer re_teste"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.to[0]").value("tiago@example.com"))
                .andExpect(jsonPath("$.reply_to").value("ana@empresa.com"))
                .andExpect(jsonPath("$.subject").value("Portfólio · mensagem de Ana Souza"))
                .andRespond(withSuccess("{\"id\":\"abc\"}", MediaType.APPLICATION_JSON));

        notifier.deliver(msg);
        server.verify();
    }

    @Test
    void failureBecomesDeliveryException() {
        server.expect(requestTo("https://api.resend.com/emails")).andRespond(withServerError());

        assertThatThrownBy(() -> notifier.deliver(msg)).isInstanceOf(ContactDeliveryException.class);
    }
}
