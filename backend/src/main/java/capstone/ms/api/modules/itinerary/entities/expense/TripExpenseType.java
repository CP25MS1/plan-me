package capstone.ms.api.modules.itinerary.entities.expense;

import java.util.Locale;

public enum TripExpenseType {
    TRAVEL,
    LODGING,
    FOOD,
    ACTIVITY,
    SHOPPING,
    OTHER;

    public static TripExpenseType from(String raw) {
        if (raw == null) return null;
        String normalized = raw.trim().toUpperCase(Locale.ROOT);
        if (normalized.isEmpty()) return null;
        try {
            return TripExpenseType.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
