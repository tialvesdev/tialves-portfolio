package dev.tiago.portfolio.service;

/** A mensagem chegou na API, mas não foi possível entregá-la por e-mail. */
public class ContactDeliveryException extends RuntimeException {

    public ContactDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
