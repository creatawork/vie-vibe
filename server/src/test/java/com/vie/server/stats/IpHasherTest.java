package com.vie.server.stats;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class IpHasherTest {

    @Test
    void sameIpSameDaySameHash() {
        IpHasher h = new IpHasher("s");
        LocalDate day = LocalDate.of(2026, 8, 25);
        assertThat(h.hash("1.2.3.4", day)).isEqualTo(h.hash("1.2.3.4", day));
        assertThat(h.hash("1.2.3.4", day)).hasSize(64);
    }

    @Test
    void differentDayDifferentHash() {
        IpHasher h = new IpHasher("s");
        assertThat(h.hash("1.2.3.4", LocalDate.of(2026, 8, 25)))
                .isNotEqualTo(h.hash("1.2.3.4", LocalDate.of(2026, 8, 26)));
    }
}
