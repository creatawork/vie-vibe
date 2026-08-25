package com.vie.server.stats;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class StatsControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    PageViewRepository repo;

    @Test
    void trackReturns204AndPersists() throws Exception {
        mvc.perform(post("/api/track")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"path\":\"/articles/a\",\"referrer\":\"\"}"))
                .andExpect(status().isNoContent());
        assert repo.count() == 1;
    }

    @Test
    void summaryRequiresKey() throws Exception {
        mvc.perform(get("/api/stats/summary"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/stats/summary").param("key", "wrong"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/stats/summary").param("key", "test-key"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPv").isNumber());
    }
}
