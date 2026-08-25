package com.vie.server.stats;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SourceParserTest {

    @Test
    void parsesKnownSources() {
        assertThat(SourceParser.parse(null)).isEqualTo("direct");
        assertThat(SourceParser.parse("")).isEqualTo("direct");
        assertThat(SourceParser.parse("https://www.baidu.com/s?wd=x")).isEqualTo("baidu");
        assertThat(SourceParser.parse("https://www.google.com/search?q=x")).isEqualTo("google");
        assertThat(SourceParser.parse("https://github.com/foo/bar")).isEqualTo("github");
        assertThat(SourceParser.parse("https://zhihu.com/answer/1")).isEqualTo("zhihu");
    }

    @Test
    void unknownHostPrefixedAndTruncated() {
        String s = SourceParser.parse("https://example.com/page");
        assertThat(s).isEqualTo("other:example.com");
        assertThat(s.length()).isLessThanOrEqualTo(64);
    }
}
