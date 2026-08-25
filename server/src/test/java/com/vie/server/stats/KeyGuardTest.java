package com.vie.server.stats;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class KeyGuardTest {

    @Test
    void bansAfterFiveFailures() {
        KeyGuard g = new KeyGuard();
        for (int i = 0; i < 5; i++) {
            assertThat(g.isBanned("ip1")).isFalse();
            g.onFailure("ip1");
        }
        assertThat(g.isBanned("ip1")).isTrue();
    }

    @Test
    void successClearsFailures() {
        KeyGuard g = new KeyGuard();
        for (int i = 0; i < 4; i++) g.onFailure("ip1");
        g.onSuccess("ip1");
        for (int i = 0; i < 4; i++) g.onFailure("ip1");
        assertThat(g.isBanned("ip1")).isFalse();
    }
}
