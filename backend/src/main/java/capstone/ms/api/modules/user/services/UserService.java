package capstone.ms.api.modules.user.services;

import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.user.dto.PreferenceDto;
import capstone.ms.api.modules.user.dto.PublicUserInfo;
import capstone.ms.api.modules.user.dto.UserDto;
import capstone.ms.api.modules.user.entities.Preference;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.mappers.UserMapper;
import capstone.ms.api.modules.user.models.UserPageCache;
import capstone.ms.api.modules.user.repositories.PreferenceRepository;
import capstone.ms.api.modules.user.repositories.UserRepository;
import capstone.ms.api.modules.user.repositories.UserSpecs;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final String USER_404_KEY = "user.404";
    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;
    private final UserMapper userMapper;

    public UserDto toDto(User user) {
        return userMapper.userToUserDto(user);
    }

    public Optional<User> findUserByIdpId(final String idpId) {
        return userRepository.findFirstByIdpId(idpId);
    }

    @Cacheable(
            value = "users.search",
            key = "T(java.util.Objects).hash(#q, #pageable.pageSize, #pageable.sort.toString())",
            condition = "#pageable.pageNumber == 0 && #q != null && #q.trim().length() >= 3",
            unless = "#result == null || #result.totalElements == 0"
    )
    public UserPageCache searchUsersCached(String q, String idp, String email, Pageable pageable) {
        if (!StringUtils.hasText(q) && !StringUtils.hasText(idp) && !StringUtils.hasText(email)) {
            return new UserPageCache(List.of(), 0, 0, pageable.getPageNumber(), pageable.getPageSize());
        }

        Specification<User> spec = UserSpecs.search(q)
                .and(UserSpecs.idpEquals(idp))
                .and(UserSpecs.emailEquals(email));

        Page<User> page = userRepository.findAll(spec, pageable);

        return new UserPageCache(
                page.getContent().stream().map(userMapper::userToPublicUserInfo).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
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
                .orElseThrow(() -> new NotFoundException(USER_404_KEY));
        return userMapper.userToUserDto(user);
    }

    @Transactional
    public PublicUserInfo followUser(User user, Integer followingId) {
        User currentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new NotFoundException(USER_404_KEY));

        User followUser = userRepository.findById(followingId)
                .orElseThrow(() -> new NotFoundException(USER_404_KEY));

        currentUser.getFollowing().add(followUser);
        followUser.getFollowers().add(currentUser);
        userRepository.save(currentUser);

        return userMapper.userToPublicUserInfo(followUser);
    }

    @Transactional
    public void unfollowUser(User user, Integer followingId) {
        User currentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new NotFoundException(USER_404_KEY));

        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new NotFoundException(USER_404_KEY));

        if (!currentUser.getFollowing().contains(following)) {
            throw new ConflictException("user.409.following");
        }

        currentUser.getFollowing().remove(following);
        following.getFollowers().remove(currentUser);

        userRepository.save(currentUser);
    }

    @Transactional
    public void removeFollower(User user, Integer followerId) {
        User currentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new NotFoundException(USER_404_KEY));

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new NotFoundException(USER_404_KEY));

        if (!currentUser.getFollowers().contains(follower)) {
            throw new ConflictException("user.409.follower");
        }

        currentUser.getFollowers().remove(follower);
        follower.getFollowing().remove(currentUser);
        userRepository.save(currentUser);
    }

    public List<PublicUserInfo> getMutualFriends(User user) {
        User currentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new NotFoundException(USER_404_KEY));
        List<User> mutualFriends = userRepository.findMutualFriends(currentUser.getId());
        return mutualFriends.stream()
                .map(userMapper::userToPublicUserInfo)
                .toList();
    }
}
