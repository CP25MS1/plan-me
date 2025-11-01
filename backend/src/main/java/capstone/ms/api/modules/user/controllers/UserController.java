package capstone.ms.api.modules.user.controllers;

import capstone.ms.api.modules.user.dto.PreferenceDto;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.services.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
