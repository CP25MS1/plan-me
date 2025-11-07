package capstone.ms.api.modules.user.services;

import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.user.dto.PublicUserInfo;
import capstone.ms.api.modules.user.dto.UserDto;
import capstone.ms.api.modules.user.dto.PreferenceDto;
import capstone.ms.api.modules.user.entities.Preference;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.mappers.UserMapper;
import capstone.ms.api.modules.user.repositories.PreferenceRepository;
import capstone.ms.api.modules.user.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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

    public UserDto getUserProfile(final Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("user.404"));
        return userMapper.userToUserDto(user);
    }

        public User getCurrentUser() {
        return userRepository.findById(2)
                .orElseThrow(() -> new NotFoundException("user.404"));
    }

    @Transactional
    public PublicUserInfo followUser(Integer followingId) {
        User me = getCurrentUser();
        User followUser = userRepository.findById(followingId)
                .orElseThrow(() -> new NotFoundException("user.404"));

        me.getFollowing().add(followUser);
        followUser.getFollowers().add(me);
        userRepository.save(me);

        return userMapper.userToPublicUserInfo(followUser);
    }

    @Transactional
    public void unfollowUser(Integer followingId) {
        User me = getCurrentUser();
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new NotFoundException("user.404"));

        if (!me.getFollowing().contains(following)) {
            throw new ConflictException("user.409.following");
        }

        me.getFollowing().remove(following);
        following.getFollowers().remove(me);

        userRepository.save(me);
    }

    @Transactional
    public void removeFollower(Integer followerId) {
        User me = getCurrentUser();
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new NotFoundException("user.404"));

        if (!me.getFollowers().contains(follower)) {
            throw new ConflictException("user.409.follower");
        }

        me.getFollowers().remove(follower);
        follower.getFollowing().remove(me);
        userRepository.save(me);
    }
}
