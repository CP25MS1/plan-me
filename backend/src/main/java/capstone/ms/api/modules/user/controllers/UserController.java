package capstone.ms.api.modules.user.controllers;

import capstone.ms.api.common.redis.SearchAnalytics;
import capstone.ms.api.modules.user.dto.*;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.models.UserPageCache;
import capstone.ms.api.modules.user.services.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final SearchAnalytics searchAnalytics;

    @GetMapping("/search")
    public ResponseEntity<UserPageCache> searchUsers(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "idp", required = false) String idp,
            @RequestParam(value = "email", required = false) String email,
            @PageableDefault(size = 20, sort = "username", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        if (q != null && q.trim().length() >= 3) {
            searchAnalytics.recordQuery(SearchAnalytics.USER_KEY, q);
        }

        UserPageCache cache = userService.searchUsersCached(q, idp, email, pageable);
        return ResponseEntity.ok(cache);
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserDto> getUserProfile(@PathVariable Integer userId) {
        UserDto userDto = userService.getUserProfile(userId);
        return ResponseEntity.ok(userDto);
    }

    @GetMapping("/me/profile")
    public ResponseEntity<UserDto> getUserMeProfile(@AuthenticationPrincipal final User user) {
        return ResponseEntity.ok(userService.getUserProfile(user.getId()));
    }

    @PostMapping("/me/following")
    public ResponseEntity<PublicUserInfo> followUser(@AuthenticationPrincipal User currentUser,
                                                     @Valid @RequestBody final FollowingIdDto targetUser) {
        PublicUserInfo followedUser = userService.followUser(currentUser, targetUser.getFollowingId());
        return ResponseEntity.status(HttpStatus.CREATED).body(followedUser);
    }

    @DeleteMapping("/me/following")
    public ResponseEntity<Void> unfollow(@AuthenticationPrincipal User currentUser,
                                         @Valid @RequestBody final FollowingIdDto targetUser) {
        userService.unfollowUser(currentUser, targetUser.getFollowingId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/followers")
    public ResponseEntity<Void> removeFollower(@AuthenticationPrincipal User currentUser,
                                               @Valid @RequestBody final FollowerIdDto targetUser) {
        userService.removeFollower(currentUser, targetUser.getFollowerId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/preference")
    public ResponseEntity<PreferenceDto> updateUserPreference(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody final PreferenceDto updatedPreference
    ) {
        return ResponseEntity.ok(userService.updateUserPreference(user.getId(), updatedPreference));
    }
}
