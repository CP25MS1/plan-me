package capstone.ms.api.modules.auth.controllers;

import capstone.ms.api.modules.user.dto.UserDto;
import capstone.ms.api.modules.auth.services.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @GetMapping("/google/callback")
    public ResponseEntity<UserDto> loginWithGoogleCallback(@RequestParam final String code, final HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(code, response));
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@Valid @RequestBody final UserDto userDto, final HttpServletResponse response) {
        return ResponseEntity.ok(authService.createUser(userDto, response));
    }
}
