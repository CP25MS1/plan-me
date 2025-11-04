package capstone.ms.api.common.services;

import capstone.ms.api.common.models.LocalizedText;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class YamlMessageService {

    private static final String MESSAGES_PATH = "messages/error-messages.yml";
    private static final String DETAILS_PATH = "messages/error-details.yml";

    private Map<String, Object> messagesRoot = new HashMap<>();
    private Map<String, Object> detailsRoot = new HashMap<>();

    @PostConstruct
    public void init() {
        Yaml yaml = new Yaml();
        messagesRoot = loadYamlAsMap(yaml, MESSAGES_PATH);
        detailsRoot = loadYamlAsMap(yaml, DETAILS_PATH);
    }

    /**
     * get LocalizedText by dot-delimited key, e.g. "key11.key21".
     * returns null if not found.
     */
    public LocalizedText getMessage(String key) {
        Object node = findNode(messagesRoot, key);
        if (!(node instanceof Map<?, ?> m)) return null;
        Object th = m.get("th");
        Object en = m.get("en");
        return LocalizedText.builder()
                .th(th == null ? null : th.toString())
                .en(en == null ? null : en.toString())
                .build();
    }

    /**
     * get details map by key. If details node is a scalar -> return map with root->value,
     * if a nested map -> flatten keys into dot paths.
     */
    public Map<String, String> getDetails(String key) {
        Object node = findNode(detailsRoot, key);
        if (node == null) return Map.of();
        Map<String, String> out = new LinkedHashMap<>();
        flatten("", node, out);
        return out;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> loadYamlAsMap(Yaml yaml, String path) {
        try (InputStream in = new ClassPathResource(path).getInputStream()) {
            Object loaded = yaml.load(in);
            return (loaded instanceof Map<?, ?> map)
                    ? (Map<String, Object>) map
                    : new HashMap<>();
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private Object findNode(Map<String, Object> root, String dottedKey) {
        if (dottedKey == null) return null;
        String[] parts = dottedKey.split("\\.");
        Object cur = root;
        for (String p : parts) {
            if (!(cur instanceof Map<?, ?> curMap)) return null;
            if (!curMap.containsKey(p)) return null;
            cur = curMap.get(p);
        }
        return cur;
    }

    private void flatten(String prefix, Object node, Map<String, String> out) {
        switch (node) {
            case Map<?, ?> map -> {
                for (Map.Entry<?, ?> e : map.entrySet()) {
                    String k = String.valueOf(e.getKey());
                    String newPrefix = prefix.isEmpty() ? k : prefix + "." + k;
                    flatten(newPrefix, e.getValue(), out);
                }
            }
            case List<?> list -> {
                for (int i = 0; i < list.size(); i++) {
                    String newPrefix = prefix + "[" + i + "]";
                    flatten(newPrefix, list.get(i), out);
                }
            }
            case null, default -> out.put(prefix, node == null ? null : node.toString());
        }
    }

}

