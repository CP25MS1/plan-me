package capstone.ms.api.modules.user.services;

import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.user.dto.PreferenceDto;
import capstone.ms.api.modules.user.dto.UserDto;
import capstone.ms.api.modules.user.entities.Preference;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.repositories.PreferenceRepository;
import capstone.ms.api.modules.user.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;

    @Transactional
    public User createUserByDto(final UserDto userDto) {
        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setIdp(userDto.getIdp());
        user.setIdpId(userDto.getIdpId());
        user.setProfilePicUrl(userDto.getProfilePicUrl());
        user.setCreatedAt(java.time.Instant.now());

        Preference preference = new Preference();
        preference.setUser(user);
        preference.setLanguage("TH");

        user.setPreference(preference);

        return userRepository.save(user);
    }

    public Optional<User> findUserByIdpId(final String idpId) {
        return userRepository.findFirstByIdpId(idpId);
    }

    @Transactional
    public PreferenceDto updateUserPreference(final Integer userId, final PreferenceDto updatedPreference) {
        final var preferenceOptional = preferenceRepository.findByUser_Id(userId);

        if (preferenceOptional.isEmpty()) {
            throw new NotFoundException("404", "user.404.preference");
        }

        var preference = preferenceOptional.get();
        preference.setLanguage(updatedPreference.getLanguage());
        final var savedPreference = preferenceRepository.save(preference);

        return PreferenceDto.builder()
                .language(savedPreference.getLanguage())
                .build();
    }
}
