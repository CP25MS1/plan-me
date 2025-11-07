package capstone.ms.api.modules.user.controllers;

import capstone.ms.api.modules.user.dto.*;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.services.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @PutMapping("/me/preference")
    public ResponseEntity<PreferenceDto> updateUserPreference(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody final PreferenceDto updatedPreference
    ) {
        return ResponseEntity.ok(userService.updateUserPreference(user.getId(), updatedPreference));
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserDto> getUserProfile(@PathVariable Integer userId) {
        UserDto userDto = userService.getUserProfile(userId);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/me/followings")
    public ResponseEntity<PublicUserInfo> followUser(@Valid @RequestBody final FollowingDto followingDto) {
        PublicUserInfo followedUser = userService.followUser(followingDto.getFollowingId());
        return ResponseEntity.status(HttpStatus.CREATED).body(followedUser);
    }

    @DeleteMapping("/me/followings")
    public ResponseEntity<Void> unfollow(@Valid @RequestBody FollowingDto followingDto) {
        userService.unfollowUser(followingDto.getFollowingId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/followers")
    public ResponseEntity<Void> removeFollower(@Valid @RequestBody FollowerDto followerDto) {
        userService.removeFollower(followerDto.getFollowerId());
        return ResponseEntity.noContent().build();
    }

}
