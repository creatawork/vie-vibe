package com.vie.server.stats;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "page_view", indexes = {
        @Index(name = "idx_created", columnList = "created_at"),
        @Index(name = "idx_path_created", columnList = "path, created_at")
})
public class PageView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 512)
    private String path;

    @Column(length = 512)
    private String referrer;

    @Column(length = 64)
    private String source;

    @Column(name = "ip_hash", nullable = false, length = 64)
    private String ipHash;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public String getReferrer() { return referrer; }
    public void setReferrer(String referrer) { this.referrer = referrer; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getIpHash() { return ipHash; }
    public void setIpHash(String ipHash) { this.ipHash = ipHash; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
