package dev.tiago.portfolio.service;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import dev.tiago.portfolio.config.PortfolioProperties;
import dev.tiago.portfolio.model.ContactReceipt;
import dev.tiago.portfolio.model.ContactRequest;

/**
 * Recebe as mensagens do formulário de contato: guarda as mais recentes em memória e
 * entrega cada uma pelo {@link ContactNotifier} (e-mail via Resend em produção).
 */
@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    public record StoredMessage(String id, Instant receivedAt, ContactRequest request) {
    }

    private final Deque<StoredMessage> inbox = new ArrayDeque<>();
    private final int maxStored;
    private final Clock clock;
    private final ContactNotifier notifier;

    @Autowired
    public ContactService(PortfolioProperties props, ContactNotifier notifier) {
        this(props, notifier, Clock.systemUTC());
    }

    ContactService(PortfolioProperties props, ContactNotifier notifier, Clock clock) {
        this.maxStored = Math.max(1, props.contact().maxStored());
        this.notifier = notifier;
        this.clock = clock;
    }

    public ContactReceipt receive(ContactRequest request) {
        var msg = new StoredMessage(UUID.randomUUID().toString(), Instant.now(clock), request);
        synchronized (this) {
            inbox.addFirst(msg);
            while (inbox.size() > maxStored) {
                inbox.removeLast();
            }
        }
        // Não registra o conteúdo nem o e-mail: só o suficiente para saber que chegou.
        log.info("Nova mensagem de contato {} ({} caracteres)", msg.id(), request.message().length());
        notifier.deliver(msg);
        return new ContactReceipt(msg.id(), msg.receivedAt());
    }

    public synchronized List<StoredMessage> recent() {
        return List.copyOf(inbox);
    }
}
