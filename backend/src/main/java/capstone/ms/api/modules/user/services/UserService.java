package capstone.ms.api.modules.user.services;

import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.user.dto.PreferenceDto;
import capstone.ms.api.modules.user.dto.UserDto;
import capstone.ms.api.modules.user.entities.Preference;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.mappers.UserMapper;
import capstone.ms.api.modules.user.repositories.PreferenceRepository;
import capstone.ms.api.modules.user.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;
    private final UserMapper userMapper;

    public UserDto toDto(User user) {
        return userMapper.userToUserDto(user);
    }

    public Optional<User> findUserByIdpId(final String idpId) {
        return userRepository.findFirstByIdpId(idpId);
    }

    @Transactional
    public User createUserByDto(final UserDto userDto) {
        User user = userMapper.userDtoToUser(userDto);
        user.setCreatedAt(Instant.now());

        if (user.getPreference() != null) {
            user.getPreference().setUser(user);
        } else {
            Preference pref = new Preference();
            pref.setUser(user);
            pref.setLanguage("TH");
            user.setPreference(pref);
        }

        return userRepository.save(user);
    }

    @Transactional
    public PreferenceDto updateUserPreference(final Integer userId, final PreferenceDto updatedPreference) {
        final var preference = preferenceRepository.findByUser_Id(userId)
                .orElseThrow(() -> new NotFoundException("404", "user.404.preference"));

        preference.setLanguage(updatedPreference.getLanguage());
        final var savedPreference = preferenceRepository.save(preference);

        return userMapper.preferenceToPreferenceDto(savedPreference);
    }
}
