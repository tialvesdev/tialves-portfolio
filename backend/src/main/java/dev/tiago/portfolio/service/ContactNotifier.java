package dev.tiago.portfolio.service;

/** Avisa o Tiago de que chegou uma mensagem pelo formulário de contato. */
public interface ContactNotifier {

    /**
     * Entrega a mensagem. Lança {@link ContactDeliveryException} se não conseguir,
     * para o visitante saber que precisa tentar de novo.
     */
    void deliver(ContactService.StoredMessage message);
}
