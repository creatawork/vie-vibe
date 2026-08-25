package com.vie.server.stats;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class StatsServiceSummaryTest {

    @Autowired
    StatsService service;

    @Autowired
    PageViewRepository repo;

    @Test
    void aggregatesTotalsAndTrend() {
        service.track("/articles/a", "https://www.baidu.com/", "1.1.1.1");
        service.track("/articles/a", null, "2.2.2.2");
        service.track("/articles/b", null, "1.1.1.1");

        Summary s = service.summary();
        assertThat(s.totalPv()).isEqualTo(3);
        assertThat(s.totalUv()).isEqualTo(2);
        assertThat(s.todayPv()).isEqualTo(3);
        assertThat(s.trend()).hasSize(30);
        assertThat(s.topPages().get(0).path()).isEqualTo("/articles/a");
        assertThat(s.topPages().get(0).pv()).isEqualTo(2);
        assertThat(s.sources()).anyMatch(c -> c.source().equals("baidu") && c.pv() == 1);
        assertThat(s.sources()).anyMatch(c -> c.source().equals("direct") && c.pv() == 2);
    }

    @Test
    void summaryIsCached() {
        service.track("/x", null, "9.9.9.9");
        Summary first = service.summary();
        Summary second = service.summary();
        assertThat(second).isSameAs(first);
    }
}
