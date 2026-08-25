package com.vie.server.stats;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class StatsController {

    private final StatsService stats;
    private final String statsKey;
    private final KeyGuard keyGuard = new KeyGuard();

    public StatsController(StatsService stats, @Value("${app.stats-key}") String statsKey) {
        this.stats = stats;
        this.statsKey = statsKey;
    }

    @PostMapping("/track")
    public ResponseEntity<Void> track(@RequestBody TrackRequest req, HttpServletRequest http) {
        stats.track(req.path(), req.referrer(), clientIp(http));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats/summary")
    public ResponseEntity<Summary> summary(@RequestParam(required = false) String key,
                                           HttpServletRequest http) {
        String ip = clientIp(http);
        if (keyGuard.isBanned(ip)) return ResponseEntity.status(429).build();
        if (key == null || !statsKey.equals(key)) {
            keyGuard.onFailure(ip);
            return ResponseEntity.status(401).build();
        }
        keyGuard.onSuccess(ip);
        return ResponseEntity.ok(stats.summary());
    }

    private String clientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        return xff != null ? xff.split(",")[0].trim() : req.getRemoteAddr();
    }
}
