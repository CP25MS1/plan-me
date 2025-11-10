package capstone.ms.api.modules.user.models;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Setter
@Getter
public class UserPageCache {
    private List<PublicUserInfo> content;
    private long totalElements;
    private int totalPages;
    private int pageNumber;
    private int pageSize;

    public UserPageCache() {}

    @JsonCreator
    public UserPageCache(
            @JsonProperty("content") List<PublicUserInfo> content,
            @JsonProperty("totalElements") long totalElements,
            @JsonProperty("totalPages") int totalPages,
            @JsonProperty("pageNumber") int pageNumber,
            @JsonProperty("pageSize") int pageSize
    ) {
        this.content = content;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
    }

    public Page<PublicUserInfo> toPage(Pageable pageable) {
        return new PageImpl<>(content, pageable, totalElements);
    }
}
