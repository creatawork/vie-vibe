package com.vie.server.stats;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HexFormat;

public class IpHasher {

    private final String secret;

    public IpHasher(String secret) {
        this.secret = secret;
    }

    public String hash(String ip) {
        return hash(ip, LocalDate.now());
    }

    public String hash(String ip, LocalDate day) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            byte[] key = (day + ":" + secret).getBytes(StandardCharsets.UTF_8);
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(ip.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("IP 哈希失败", e);
        }
    }
}
