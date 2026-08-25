package com.vie.server.stats;

import java.net.URI;

public class SourceParser {

    public static String parse(String referrer) {
        if (referrer == null || referrer.isBlank()) return "direct";
        String host;
        try {
            host = new URI(referrer).getHost();
        } catch (Exception e) {
            return "direct";
        }
        if (host == null) return "direct";
        host = host.toLowerCase();
        String source;
        if (host.contains("baidu")) source = "baidu";
        else if (host.contains("google")) source = "google";
        else if (host.contains("bing")) source = "bing";
        else if (host.contains("github")) source = "github";
        else if (host.contains("zhihu")) source = "zhihu";
        else source = "other:" + host;
        return source.length() > 64 ? source.substring(0, 64) : source;
    }
}
