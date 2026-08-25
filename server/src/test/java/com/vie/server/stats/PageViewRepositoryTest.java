package com.vie.server.stats;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class PageViewRepositoryTest {

    @Autowired
    PageViewRepository repo;

    private PageView view(String path, String ipHash, LocalDateTime at) {
        PageView v = new PageView();
        v.setPath(path);
        v.setSource("direct");
        v.setIpHash(ipHash);
        v.setCreatedAt(at);
        return v;
    }

    @Test
    void existsByRecentSamePath() {
        repo.save(view("/articles/a", "hash1", LocalDateTime.now()));
        assertThat(repo.existsByIpHashAndPathAndCreatedAtAfter(
                "hash1", "/articles/a", LocalDateTime.now().minusSeconds(30))).isTrue();
        assertThat(repo.existsByIpHashAndPathAndCreatedAtAfter(
                "hash1", "/articles/b", LocalDateTime.now().minusSeconds(30))).isFalse();
    }

    @Test
    void findByCreatedAtAfterFiltersOldRows() {
        repo.save(view("/a", "h1", LocalDateTime.now().minusDays(40)));
        repo.save(view("/a", "h2", LocalDateTime.now()));
        assertThat(repo.findByCreatedAtAfter(LocalDateTime.now().minusDays(30))).hasSize(1);
    }
}
