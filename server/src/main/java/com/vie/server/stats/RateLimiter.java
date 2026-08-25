package com.vie.server.stats;

import java.util.concurrent.ConcurrentHashMap;

public class RateLimiter {

    private final ConcurrentHashMap<String, long[]> windows = new ConcurrentHashMap<>();
    private final int limit;

    public RateLimiter(int limit) {
        this.limit = limit;
    }

    public boolean allow(String key) {
        return allow(key, System.currentTimeMillis());
    }

    boolean allow(String key, long now) {
        long minute = now / 60_000;
        long[] slot = windows.compute(key,
                (k, v) -> (v == null || v[0] != minute) ? new long[]{minute, 0} : v);
        if (slot[1] >= limit) return false;
        slot[1]++;
        return true;
    }
}
