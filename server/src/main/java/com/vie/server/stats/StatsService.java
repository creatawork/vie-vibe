package com.vie.server.stats;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class StatsService {

    private final PageViewRepository repo;
    private final IpHasher ipHasher;
    private final RateLimiter trackLimiter = new RateLimiter(60);

    public StatsService(PageViewRepository repo, IpHasher ipHasher) {
        this.repo = repo;
        this.ipHasher = ipHasher;
    }

    public boolean track(String path, String referrer, String ip) {
        if (path == null || !path.startsWith("/") || path.length() > 512) return false;
        if (!trackLimiter.allow(ip)) return false;
        String ipHash = ipHasher.hash(ip);
        LocalDateTime threshold = LocalDateTime.now().minusSeconds(30);
        if (repo.existsByIpHashAndPathAndCreatedAtAfter(ipHash, path, threshold)) return false;

        PageView v = new PageView();
        v.setPath(path);
        v.setReferrer(referrer == null ? null :
                referrer.substring(0, Math.min(referrer.length(), 512)));
        v.setSource(SourceParser.parse(referrer));
        v.setIpHash(ipHash);
        v.setCreatedAt(LocalDateTime.now());
        repo.save(v);
        return true;
    }
}
