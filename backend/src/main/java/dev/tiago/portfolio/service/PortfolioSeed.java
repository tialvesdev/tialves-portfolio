package dev.tiago.portfolio.service;

import java.util.List;

import dev.tiago.portfolio.model.Link;
import dev.tiago.portfolio.model.Profile;
import dev.tiago.portfolio.model.Project;
import dev.tiago.portfolio.model.Project.Status;
import dev.tiago.portfolio.model.Skill;
import dev.tiago.portfolio.model.Skill.Category;
import dev.tiago.portfolio.model.Skill.Tone;

/**
 * Conteúdo do portfólio. Edite aqui (ou troque por um repositório JPA) e o front-end atualiza sozinho.
 * Os níveis de habilidade são valores de exemplo: ajuste antes de publicar.
 * Mantenha em sincronia com frontend/src/api/seed.ts, usado quando a API está offline.
 */
final class PortfolioSeed {

    private PortfolioSeed() {
    }

    static final Profile PROFILE = new Profile(
            "Tiago Alves da Silva",
            "Desenvolvedor Full Stack",
            "Interfaces em React e TypeScript, APIs em Java e Spring Boot.",
            "Brasil",
            List.of(new Link("Projetos", "#projetos"), new Link("Contato", "#contato")));

    static final List<Project> PROJECTS = List.of(
            new Project(
                    "atelie-gotico-ui",
                    "Ateliê Gótico UI",
                    "Biblioteca de componentes React + TypeScript em pixel art: molduras 9-slice, botões, "
                            + "barras de atributo e uma cena animada em canvas.",
                    List.of("React", "TypeScript", "CSS"),
                    "save",
                    true,
                    Status.IN_PROGRESS,
                    null,
                    null),
            new Project(
                    "portfolio-api",
                    "API do Portfólio",
                    "Back-end Spring Boot que serve perfil, projetos e habilidades e recebe mensagens de contato com validação.",
                    List.of("Java 21", "Spring Boot", "REST"),
                    "atelie_arquiteto",
                    false,
                    Status.IN_PROGRESS,
                    null,
                    null),
            new Project(
                    "proximo-projeto",
                    "Próximo projeto",
                    "Espaço reservado. Cadastre seus projetos em PortfolioSeed.java e eles aparecem aqui.",
                    List.of(),
                    "vitral",
                    false,
                    Status.PLANNED,
                    null,
                    null));

    static final List<Skill> SKILLS = List.of(
            new Skill("React", 80, Category.FRONTEND, Tone.CIANO),
            new Skill("TypeScript", 75, Category.FRONTEND, Tone.CIANO),
            new Skill("Java", 75, Category.BACKEND, Tone.CARMIM),
            new Skill("Spring Boot", 70, Category.BACKEND, Tone.CARMIM),
            new Skill("UI / pixel art", 70, Category.TOOLS, Tone.OURO));
}
