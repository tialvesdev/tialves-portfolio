package dev.tiago.portfolio;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;

import dev.tiago.portfolio.service.ContactDeliveryException;
import dev.tiago.portfolio.service.ContactNotifier;

@SpringBootTest
@AutoConfigureMockMvc
class PortfolioApiTest {

    @Autowired
    MockMvc mvc;

    @MockBean
    ContactNotifier notifier;

    @Test
    void profileHasNameAndRole() throws Exception {
        mvc.perform(get("/api/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").isNotEmpty())
                .andExpect(jsonPath("$.role").isNotEmpty());
    }

    @Test
    void projectsListFeaturedFirst() throws Exception {
        mvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].featured", is(true)));
    }

    @Test
    void projectsFilterByTagIgnoringCase() throws Exception {
        mvc.perform(get("/api/projects").param("tag", "spring boot"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("portfolio-api")));
    }

    @Test
    void unknownProjectIs404() throws Exception {
        mvc.perform(get("/api/projects/nao-existe")).andExpect(status().isNotFound());
    }

    @Test
    void skillToneIsLowercaseForTheFrontend() throws Exception {
        mvc.perform(get("/api/skills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tone", is("ciano")));
    }

    @Test
    void validContactIsCreated() throws Exception {
        mvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Ada","email":"ada@example.com","message":"Olá, gostei do portfólio!"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.receivedAt").isNotEmpty());
    }

    @Test
    void invalidContactReturnsFieldErrors() throws Exception {
        mvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"","email":"sem-arroba","message":"curta"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title", is("Dados inválidos")))
                .andExpect(jsonPath("$.errors.name").isNotEmpty())
                .andExpect(jsonPath("$.errors.email", is("Informe um e-mail válido.")))
                .andExpect(jsonPath("$.errors.message").isNotEmpty());
    }

    @Test
    void failedEmailDeliveryIs502() throws Exception {
        doThrow(new ContactDeliveryException("Não foi possível enviar a mensagem agora.", null))
                .when(notifier).deliver(any());
        mvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Ada","email":"ada@example.com","message":"Olá, gostei do portfólio!"}
                                """))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.title", is("Envio indisponível")));
    }

    @Test
    void corsAllowsViteDevServer() throws Exception {
        mvc.perform(options("/api/projects")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }
}
