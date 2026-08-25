package com.vie.server.stats;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class StatsServiceTrackTest {

    @Autowired
    StatsService service;

    @Autowired
    PageViewRepository repo;

    @Test
    void recordsValidTrack() {
        boolean ok = service.track("/articles/a", "https://www.baidu.com/s?wd=x", "1.1.1.1");
        assertThat(ok).isTrue();
        PageView v = repo.findAll().get(0);
        assertThat(v.getPath()).isEqualTo("/articles/a");
        assertThat(v.getSource()).isEqualTo("baidu");
        assertThat(v.getIpHash()).hasSize(64);
    }

    @Test
    void rejectsInvalidPath() {
        assertThat(service.track("not-a-path", null, "2.2.2.2")).isFalse();
        assertThat(service.track(null, null, "2.2.2.2")).isFalse();
    }

    @Test
    void dedupWithinThirtySeconds() {
        assertThat(service.track("/a", null, "3.3.3.3")).isTrue();
        assertThat(service.track("/a", null, "3.3.3.3")).isFalse();
        assertThat(service.track("/b", null, "3.3.3.3")).isTrue();
    }
}
