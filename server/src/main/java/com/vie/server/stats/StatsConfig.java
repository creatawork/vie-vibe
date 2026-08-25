package com.vie.server.stats;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StatsConfig {

    @Bean
    public IpHasher ipHasher(@Value("${app.ip-secret}") String secret) {
        return new IpHasher(secret);
    }
}
