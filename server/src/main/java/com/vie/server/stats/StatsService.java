package com.vie.server.stats;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatsService {

    private final PageViewRepository repo;
    private final IpHasher ipHasher;
    private final RateLimiter trackLimiter = new RateLimiter(60);

    private volatile Summary cached;
    private volatile long cachedAt;

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
        cached = null;
        return true;
    }

    public Summary summary() {
        if (cached != null && System.currentTimeMillis() - cachedAt < 60_000) {
            return cached;
        }
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<PageView> recent = repo.findByCreatedAtAfter(since);

        long totalPv = repo.count();
        long totalUv = repo.findAll().stream().map(PageView::getIpHash).distinct().count();

        String today = LocalDate.now().toString();
        List<PageView> todayViews = recent.stream()
                .filter(v -> v.getCreatedAt().toLocalDate().toString().equals(today))
                .toList();

        Map<String, List<PageView>> byDay = recent.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getCreatedAt().toLocalDate().toString()));
        List<Summary.DayPoint> trend = new ArrayList<>();
        for (int i = 29; i >= 0; i--) {
            String day = LocalDate.now().minusDays(i).toString();
            List<PageView> views = byDay.getOrDefault(day, List.of());
            trend.add(new Summary.DayPoint(day, views.size(),
                    views.stream().map(PageView::getIpHash).distinct().count()));
        }

        List<Summary.PathCount> topPages = repo.findAll().stream()
                .collect(Collectors.groupingBy(
                        PageView::getPath, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> new Summary.PathCount(e.getKey(), e.getValue()))
                .toList();

        List<Summary.SourceCount> sources = repo.findAll().stream()
                .collect(Collectors.groupingBy(
                        PageView::getSource, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new Summary.SourceCount(e.getKey(), e.getValue()))
                .toList();

        cached = new Summary(totalPv, totalUv,
                todayViews.size(),
                todayViews.stream().map(PageView::getIpHash).distinct().count(),
                trend, topPages, sources);
        cachedAt = System.currentTimeMillis();
        return cached;
    }
}
