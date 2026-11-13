package dev.tiago.portfolio.model;

import com.fasterxml.jackson.annotation.JsonValue;

/** Habilidade exibida no StatBar. level vai de 0 a 100. */
public record Skill(String name, int level, Category category, Tone tone) {

    public enum Category { FRONTEND, BACKEND, TOOLS }

    /** Cor da barra no front-end. */
    public enum Tone {
        CARMIM, CIANO, OURO;

        @JsonValue
        public String json() {
            return name().toLowerCase();
        }
    }
}
