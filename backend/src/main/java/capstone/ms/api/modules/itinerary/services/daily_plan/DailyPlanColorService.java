package capstone.ms.api.modules.itinerary.services.daily_plan;

import capstone.ms.api.modules.google_maps.dto.MapPinColor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DailyPlanColorService {

    private static final double LIGHTEN_FACTOR = 0.15;
    private static final double DARKEN_FACTOR = -0.15;

    public String resolvePinColor(int dayIndex) {
        List<MapPinColor> baseColors = List.of(MapPinColor.values());
        int baseColorSize = baseColors.size();

        MapPinColor baseColor = baseColors.get(dayIndex % baseColorSize);

        int shadeLevel = dayIndex / baseColorSize;
        if (shadeLevel == 0) {
            return baseColor.hex();
        }

        double factor = (shadeLevel % 2 == 0)
                ? LIGHTEN_FACTOR
                : DARKEN_FACTOR;

        return adjustShade(baseColor.hex(), factor);
    }

    private String adjustShade(String hex, double factor) {
        int r = Integer.parseInt(hex.substring(1, 3), 16);
        int g = Integer.parseInt(hex.substring(3, 5), 16);
        int b = Integer.parseInt(hex.substring(5, 7), 16);

        r = clamp((int) (r + r * factor));
        g = clamp((int) (g + g * factor));
        b = clamp((int) (b + b * factor));

        return String.format("#%02X%02X%02X", r, g, b);
    }

    private int clamp(int value) {
        return Math.clamp(value, 0, 255);
    }
}