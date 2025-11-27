package capstone.ms.api.common.redis;

import capstone.ms.api.modules.user.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PrewarmScheduler {
    private final SearchAnalytics analytics;
    private final UserService userService;

    @Scheduled(fixedDelayString = "300000")
    public void prewarmTopUserSearchQueries() {
        List<String> top = analytics.topQueries(SearchAnalytics.USER_KEY, 50);
        Pageable page0 = PageRequest.of(0, 20, Sort.by("username").ascending());

        for (String q : top) {
            userService.searchUsersCached(q, null, null, page0);
        }
    }
}
