# BACKEND IMPLEMENTATION PATTERN

This document defines HOW to implement backend code.
Architecture rules are defined in layer-boundary.md.

---

# 1. CONTROLLER PATTERN

Controller responsibilities:

- Accept request
- Validate input (@Valid)
- Call service
- Return DTO
- No business logic

Example:

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Integer id) {
        return userService.getUserById(id);
    }

}

Rules:

- No repository injection
- No entity return
- No transaction
- Max 150 LOC

---

# 2. SERVICE PATTERN (USE CASE STYLE)

Service = Use Case
Each public method = 1 use case

Example:

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public UserResponse getUserById(Integer id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("user.not_found"));

        return userMapper.toResponse(user);
    }

}

Rules:

- Must not exceed 250 LOC
- One responsibility per method
- Cross-module call via service only
- Repository from other module is forbidden

---

# 3. CROSS-MODULE ACCESS PATTERN

If user module needs itinerary data:

Define interface in itinerary module:

public interface ItineraryQueryService {
ItinerarySummary getSummaryByUserId(Integer userId);
}

Implementation stays inside itinerary module.

Inject interface only:

private final ItineraryQueryService itineraryQueryService;

Never inject:
ItineraryRepository

---

# 4. DTO PATTERN

DTO must:

- Represent API contract only
- Contain no JPA annotations
- Be immutable if possible

Response naming:
UserResponse
CreateUserRequest
UpdateUserRequest

Never expose:

- Entity
- Lazy collections

---

# 5. MAPSTRUCT PATTERN

Mapping happens in service layer only.

@Mapper(componentModel = "spring")
public interface UserMapper {
UserResponse toResponse(User entity);
}

No mapping in controller.
No manual field-by-field mapping in service unless complex.

---

# 6. VALIDATION PATTERN

Use Jakarta validation in DTO:

public record CreateUserRequest(
@NotBlank String email,
@Size(min = 8) String password
) {}

Never validate inside service manually unless business rule.

---

# 7. EXCEPTION PATTERN

Throw domain-specific exception only:

- NotFoundException
- ConflictException
- BadRequestException
- ForbiddenException

Never throw generic RuntimeException.

Define bilingual messages in `error-messages.yml` or details in `error-details.yml`. Then use them in exception.

---

# 8. LOGGING PATTERN

Log only:

- Important state change
- External API call
- Security-sensitive event

Example:

log.info("User created: id={}", user.getId());

Never log:

- Full entity JSON
- Sensitive info (password, token)
- Inside repository

---

# 9. REDIS CACHE PATTERN (SEARCH ONLY)

Cache only read-heavy search result.
Cache key pattern:

user:search:{normalizedQuery}

TTL must be defined.
Never cache domain mutation.

---

# 10. FILE SPLIT RULE

If service >250 LOC:

- Extract private methods
- Extract domain helper
- Or split use case into another service

If entity >300 LOC:

- Re-evaluate aggregate design

---

# 11. PR ENFORCEMENT CHECKLIST

Reject PR if:

- Repository injected cross-module
- Entity returned in controller
- Business logic in controller
- Transaction missing where required
- Service >250 LOC without justification
- Generic exception thrown

---

# 12. VIBE-CODE PREVENTION RULE

Before merge:

- Developer must explain use case in PR description
- Must specify which layer logic belongs to
- Must specify transaction boundary

If cannot explain clearly → code likely misplaced.
