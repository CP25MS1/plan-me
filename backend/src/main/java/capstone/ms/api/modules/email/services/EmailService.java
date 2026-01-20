package capstone.ms.api.modules.email.services;

import capstone.ms.api.modules.email.clients.ImapStoreProvider;
import capstone.ms.api.modules.email.configs.EmailProperties;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.search.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {
    private final EmailProperties props;
    private final ImapStoreProvider storeProvider;

    public String buildAddressWithAlias(final String alias) {
        if (alias == null) return props.getUser();
        final String[] parts = props.getUser().split("@", 2);
        if (parts.length < 2) return props.getUser();
        return parts[0] + "+" + alias + "@" + parts[1];
    }

    public Optional<Store> openImapStore() {
        return storeProvider.openStore();
    }

    public Optional<SearchTerm> buildSearchTerm(final Map<String, String> criteria) {
        if (criteria == null || criteria.isEmpty()) return Optional.empty();


        final List<SearchTerm> terms = new ArrayList<>();


        try {
            if (hasText(criteria, "TO")) {
                terms.add(new RecipientTerm(Message.RecipientType.TO, new InternetAddress(criteria.get("TO"))));
            }
            if (hasText(criteria, "FROM")) {
                terms.add(new FromTerm(new InternetAddress(criteria.get("FROM"))));
            }
        } catch (Exception ex) {
            log.warn("Invalid email address in search criteria: {}", ex.getMessage());
        }


        if (hasText(criteria, "SUBJECT")) {
            terms.add(new SubjectTerm(criteria.get("SUBJECT")));
        }


        if (hasText(criteria, "UNREAD") && Boolean.parseBoolean(criteria.get("UNREAD"))) {
            terms.add(new FlagTerm(new Flags(Flags.Flag.SEEN), false));
        }


        if (terms.isEmpty()) return Optional.empty();
        if (terms.size() == 1) return Optional.of(terms.getFirst());
        return Optional.of(new AndTerm(terms.toArray(new SearchTerm[0])));
    }

    public Optional<String> extractAliasFromTo(Message message) throws MessagingException {
        if (message == null) return Optional.empty();

        Address[] recipients = message.getRecipients(Message.RecipientType.TO);
        if (recipients == null) return Optional.empty();

        for (Address addr : recipients) {
            if (addr instanceof InternetAddress internetAddress) {
                String email = internetAddress.getAddress(); // user+alias@domain
                if (email == null) continue;

                int plusIdx = email.indexOf('+');
                int atIdx = email.indexOf('@');

                if (plusIdx > 0 && atIdx > plusIdx) {
                    return Optional.of(email.substring(plusIdx + 1, atIdx));
                }
            }
        }
        return Optional.empty();
    }

    private boolean hasText(Map<String, String> map, String key) {
        return map != null && map.containsKey(key) && map.get(key) != null && !map.get(key).isBlank();
    }
}
