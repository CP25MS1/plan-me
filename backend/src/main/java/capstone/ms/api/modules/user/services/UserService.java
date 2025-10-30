package capstone.ms.api.modules.user.services;

import capstone.ms.api.modules.auth.dto.UserDto;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User createUserByDto(final UserDto userDto) {
        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setIdp(userDto.getIdp());
        user.setIdpId(userDto.getIdpId());
        user.setProfilePicUrl(userDto.getProfilePicUrl());
        user.setCreatedAt(java.time.Instant.now());
        return userRepository.save(user);
    }

    public Optional<User> findUserByIdpId(final String idpId) {
        return userRepository.findFirstByIdpId(idpId);
    }
}
