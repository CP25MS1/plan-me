package capstone.ms.api.modules.user.services;

import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User registerUserWithDefaultValue(final String username, final String email, final String idp, final String idpId) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setIdp(idp);
        user.setIdpId(idpId);
        return userRepository.save(user);
    }

    public Optional<User> findUserByIdpId(final String idpId) {
        return userRepository.findFirstByIdpId(idpId);
    }
}
