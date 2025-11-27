package capstone.ms.api.modules.user.dto;

import io.jsonwebtoken.Claims;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GoogleClaimsDto {
    private String idpId;
    private String name;
    private String email;
    private String picture;

    public static GoogleClaimsDto build(String idpId, Claims claims) {
        return GoogleClaimsDto.builder()
                .idpId(idpId)
                .name(claims.get("name", String.class))
                .email(claims.get("email", String.class))
                .picture(claims.get("picture", String.class))
                .build();
    }
}
