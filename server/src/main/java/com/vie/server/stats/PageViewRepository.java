package com.vie.server.stats;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface PageViewRepository extends JpaRepository<PageView, Long> {

    boolean existsByIpHashAndPathAndCreatedAtAfter(String ipHash, String path, LocalDateTime after);

    List<PageView> findByCreatedAtAfter(LocalDateTime after);
}
