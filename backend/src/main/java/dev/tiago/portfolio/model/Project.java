package dev.tiago.portfolio.model;

import java.util.List;

/**
 * Projeto exibido no ProjectCard.
 *
 * @param room nome de uma sala do kit (save, torre_relogio, atelie_arquiteto, galeria_retratos, vitral)
 *             usada como imagem quando o projeto ainda não tem print próprio
 */
public record Project(
        String id,
        String title,
        String description,
        List<String> tags,
        String room,
        boolean featured,
        Status status,
        String repoUrl,
        String liveUrl) {

    public enum Status { PUBLISHED, IN_PROGRESS, PLANNED }

    public boolean hasTag(String tag) {
        return tags.stream().anyMatch(t -> t.equalsIgnoreCase(tag));
    }
}
