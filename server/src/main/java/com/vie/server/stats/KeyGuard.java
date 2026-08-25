package com.vie.server.stats;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class KeyGuard {

    private static final int MAX_FAILURES = 5;
    private static final long BAN_MILLIS = 10 * 60_000;

    private final Map<String, Integer> failures = new ConcurrentHashMap<>();
    private final Map<String, Long> bannedUntil = new ConcurrentHashMap<>();

    public boolean isBanned(String ip) {
        Long until = bannedUntil.get(ip);
        return until != null && until > System.currentTimeMillis();
    }

    public void onFailure(String ip) {
        int n = failures.merge(ip, 1, Integer::sum);
        if (n >= MAX_FAILURES) {
            bannedUntil.put(ip, System.currentTimeMillis() + BAN_MILLIS);
            failures.remove(ip);
        }
    }

    public void onSuccess(String ip) {
        failures.remove(ip);
    }
}
