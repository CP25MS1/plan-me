package capstone.ms.api.modules.google_maps.dto;

public enum MapPinColor {

    RED("#E53935"),
    PINK("#D81B60"),
    PURPLE("#8E24AA"),
    DEEP_PURPLE("#5E35B1"),
    INDIGO("#3949AB"),
    BLUE("#1E88E5"),
    LIGHT_BLUE("#039BE5"),
    TEAL("#00897B"),
    GREEN("#43A047"),
    LIGHT_GREEN("#7CB342"),
    YELLOW("#FDD835"),
    ORANGE("#FB8C00"),
    DEEP_ORANGE("#F4511E"),
    BROWN("#6D4C41"),
    BLUE_GREY("#546E7A");

    private final String hex;

    MapPinColor(String hex) {
        this.hex = hex;
    }

    public String hex() {
        return hex;
    }
}

