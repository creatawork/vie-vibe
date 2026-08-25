package com.vie.server.stats;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimiterTest {

    @Test
    void allowsUpToLimitPerMinute() {
        RateLimiter r = new RateLimiter(3);
        long now = 1_000_000L;
        assertThat(r.allow("ip1", now)).isTrue();
        assertThat(r.allow("ip1", now)).isTrue();
        assertThat(r.allow("ip1", now)).isTrue();
        assertThat(r.allow("ip1", now)).isFalse();
        assertThat(r.allow("ip2", now)).isTrue();
    }

    @Test
    void windowResetsNextMinute() {
        RateLimiter r = new RateLimiter(1);
        long now = 1_000_000L;
        assertThat(r.allow("ip1", now)).isTrue();
        assertThat(r.allow("ip1", now)).isFalse();
        assertThat(r.allow("ip1", now + 60_000)).isTrue();
    }
}
