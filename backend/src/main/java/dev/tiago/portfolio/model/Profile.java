package dev.tiago.portfolio.model;

import java.util.List;

public record Profile(String name, String role, String tagline, String location, List<Link> links) {
}
