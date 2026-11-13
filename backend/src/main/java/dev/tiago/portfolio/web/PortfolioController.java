package dev.tiago.portfolio.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import dev.tiago.portfolio.model.Profile;
import dev.tiago.portfolio.model.Project;
import dev.tiago.portfolio.model.Skill;
import dev.tiago.portfolio.service.PortfolioService;

@RestController
@RequestMapping("/api")
public class PortfolioController {

    private final PortfolioService portfolio;

    public PortfolioController(PortfolioService portfolio) {
        this.portfolio = portfolio;
    }

    @GetMapping("/profile")
    public Profile profile() {
        return portfolio.profile();
    }

    @GetMapping("/projects")
    public List<Project> projects(@RequestParam(required = false) String tag) {
        return portfolio.projects(tag);
    }

    @GetMapping("/projects/{id}")
    public Project project(@PathVariable String id) {
        return portfolio.project(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado: " + id));
    }

    @GetMapping("/skills")
    public List<Skill> skills() {
        return portfolio.skills();
    }
}
