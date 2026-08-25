package com.vie.server.stats;

import java.util.List;

public record Summary(
        long totalPv,
        long totalUv,
        long todayPv,
        long todayUv,
        List<DayPoint> trend,
        List<PathCount> topPages,
        List<SourceCount> sources) {

    public record DayPoint(String date, long pv, long uv) {}
    public record PathCount(String path, long pv) {}
    public record SourceCount(String source, long pv) {}
}
