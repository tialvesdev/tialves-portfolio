package dev.tiago.portfolio.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank(message = "Informe seu nome.")
        @Size(max = 80, message = "Use até 80 caracteres.")
        String name,

        @NotBlank(message = "Informe seu e-mail.")
        @Email(message = "Informe um e-mail válido.")
        @Size(max = 120, message = "Use até 120 caracteres.")
        String email,

        @NotBlank(message = "Escreva uma mensagem.")
        @Size(min = 10, max = 2000, message = "A mensagem precisa ter entre 10 e 2000 caracteres.")
        String message) {
}
