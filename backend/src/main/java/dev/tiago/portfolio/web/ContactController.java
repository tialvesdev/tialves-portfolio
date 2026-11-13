package dev.tiago.portfolio.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.tiago.portfolio.model.ContactReceipt;
import dev.tiago.portfolio.model.ContactRequest;
import dev.tiago.portfolio.service.ContactService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contacts;

    public ContactController(ContactService contacts) {
        this.contacts = contacts;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactReceipt send(@Valid @RequestBody ContactRequest request) {
        return contacts.receive(request);
    }
}
