package capstone.ms.api.modules.itinerary.services.realtime;

import capstone.ms.api.modules.itinerary.dto.realtime.TripRealtimeUserDto;
import capstone.ms.api.modules.itinerary.services.TripAccessService;
import capstone.ms.api.modules.user.entities.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Slf4j
@Component
@RequiredArgsConstructor
public class TripRealtimeWebSocketHandler extends TextWebSocketHandler {

    private final TripRealtimeHub hub;
    private final TripAccessService tripAccessService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Integer tripId = extractTripIdFromUri(session);
        if (tripId == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        User user = extractUserEntity(session);
        if (user == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthorized"));
            return;
        }

        try {
            tripAccessService.assertTripmateLevelAccess(user, tripId);
        } catch (Exception e) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Forbidden"));
            return;
        }

        TripRealtimeUserDto userDto = new TripRealtimeUserDto(user.getId(), user.getUsername(), user.getProfilePicUrl());
        hub.subscribe(tripId, userDto, session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // We only use WebSocket for pushing downstream events for now.
        // Locking and presence updates are still handled via standard HTTP endpoints.
        // We could implement an echo or basic ping/pong here if needed.
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Integer tripId = extractTripIdFromUri(session);
        if (tripId != null) {
            hub.unsubscribe(tripId, session);
        }
    }

    private Integer extractTripIdFromUri(WebSocketSession session) {
        if (session.getUri() == null) return null;
        String path = session.getUri().getPath();
        String[] parts = path.split("/");
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].equals("trips") && i + 1 < parts.length) {
                try {
                    return Integer.parseInt(parts[i + 1]);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return null;
    }

    private User extractUserEntity(WebSocketSession session) {
        if (session.getPrincipal() instanceof Authentication auth && auth.getPrincipal() instanceof User user) {
            return user;
        }
        return null; // or throw exception depending on security config
    }
}
