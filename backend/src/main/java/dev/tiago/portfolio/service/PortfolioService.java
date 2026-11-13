package dev.tiago.portfolio.service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import dev.tiago.portfolio.model.Profile;
import dev.tiago.portfolio.model.Project;
import dev.tiago.portfolio.model.Skill;

@Service
public class PortfolioService {

    public Profile profile() {
        return PortfolioSeed.PROFILE;
    }

    /** Projetos com os destaques primeiro; filtra por tecnologia quando tag não é nula. */
    public List<Project> projects(String tag) {
        return PortfolioSeed.PROJECTS.stream()
                .filter(p -> tag == null || tag.isBlank() || p.hasTag(tag))
                .sorted(Comparator.comparing(Project::featured).reversed())
                .toList();
    }

    public Optional<Project> project(String id) {
        return PortfolioSeed.PROJECTS.stream().filter(p -> p.id().equals(id)).findFirst();
    }

    public List<Skill> skills() {
        return PortfolioSeed.SKILLS;
    }
}
