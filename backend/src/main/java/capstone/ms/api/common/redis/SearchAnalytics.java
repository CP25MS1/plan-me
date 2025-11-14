package capstone.ms.api.common.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class SearchAnalytics {

    public static final String USER_KEY = "users.search.freq";
    private final StringRedisTemplate redis;

    public void recordQuery(String key, String q) {
        if (q == null || q.trim().length() < 3) return;
        String k = q.trim().toLowerCase();
        redis.opsForZSet().incrementScore(key, k, 1);
    }

    public List<String> topQueries(String key, int n) {
        return Objects.requireNonNull(redis.opsForZSet().reverseRange(key, 0, n - 1L)).stream().toList();
    }
}
