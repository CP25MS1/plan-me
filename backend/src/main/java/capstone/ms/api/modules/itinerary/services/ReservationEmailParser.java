package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.modules.email.dto.EmailData;
import capstone.ms.api.modules.itinerary.dto.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ReservationEmailParser {

    public FlightDetails parseFlight(EmailData emailData) {
        String content = String.join("\n", emailData.texts());
        List<FlightPassenger> passengers = parseFlightPassengers(content);

        FlightDetails flight = FlightDetails.builder()
                .airline(extractField(content, "Airline"))
                .flightNo(extractField(content, "Flight Number"))
                .boardingTime(parseDateTime(extractField(content, "Boarding Time")))
                .gateNo(extractField(content, "Gate No"))
                .departureAirport(extractField(content, "Departure Airport"))
                .departureTime(parseDateTime(extractField(content, "Departure Date")))
                .arrivalAirport(extractField(content, "Arrival Airport"))
                .arrivalTime(parseDateTime(extractField(content, "Arrival Date")))
                .flightClass(extractField(content, "Class"))
                .passengers(passengers)
                .build();

        return flight;
    }

    public List<FlightPassenger> parseFlightPassengers(String content) {
        List<FlightPassenger> passengers = new ArrayList<>();
        if (content == null || content.isBlank()) return passengers;

        Pattern pattern = Pattern.compile("(?i)Passenger\\s*[:\\-]?\\s*(.+?)[,\\n]\\s*Seat\\s*[:\\-]?\\s*(\\S+)");
        Matcher matcher = pattern.matcher(content);

        while (matcher.find()) {
            String name = matcher.group(1).trim();
            String seat = matcher.group(2).trim();
            if (!name.isEmpty() || !seat.isEmpty()) {
                passengers.add(FlightPassenger.builder()
                        .passengerName(name.isEmpty() ? null : name)
                        .seatNo(seat.isEmpty() ? null : seat)
                        .build());
            }
        }
        return passengers;
    }

    public LodgingDetails parseLodging(EmailData emailData) {
        String content = String.join("\n", emailData.texts());
        return LodgingDetails.builder()
                .lodgingName(extractField(content, "Hotel Name"))
                .lodgingAddress(extractField(content, "Hotel Address"))
                .underName(extractField(content, "Guest Name"))
                .checkinDate(parseDateTime(extractField(content, "Check In")))
                .checkoutDate(parseDateTime(extractField(content, "Check Out")))
                .build();
    }

    public RestaurantDetails parseRestaurant(EmailData emailData) {
        String content = String.join("\n", emailData.texts());
        return RestaurantDetails.builder()
                .restaurantName(extractField(content, "Restaurant Name"))
                .restaurantAddress(extractField(content, "Restaurant Address"))
                .underName(extractField(content, "Guest Name"))
                .reservationDate(parseDate(extractField(content, "Date")))
                .reservationTime(parseTime(extractField(content, "Time")))
                .tableNo(extractField(content, "Table No"))
                .queueNo(extractField(content, "Queue No"))
                .partySize(parseInt(extractField(content, "Party Size")))
                .build();
    }

    public TrainDetails parseTrain(EmailData emailData) {
        String content = String.join("\n", emailData.texts());
        return TrainDetails.builder()
                .trainNo(extractField(content, "Train Number"))
                .trainClass(extractField(content, "Train Class"))
                .seatClass(extractField(content, "Seat Class"))
                .seatNo(extractField(content, "Seat No"))
                .passengerName(extractField(content, "Passenger Name"))
                .departureStation(extractField(content, "Departure Station"))
                .departureTime(parseDateTime(extractField(content, "Departure Date")))
                .arrivalStation(extractField(content, "Arrival Station"))
                .arrivalTime(parseDateTime(extractField(content, "Arrival Date")))
                .build();
    }

    public BusDetails parseBus(EmailData emailData) {
        String content = String.join("\n", emailData.texts());
        return BusDetails.builder()
                .transportCompany(extractField(content, "Bus Company"))
                .departureStation(extractField(content, "Departure Station"))
                .departureTime(parseDateTime(extractField(content, "Departure Date")))
                .arrivalStation(extractField(content, "Arrival Station"))
                .busClass(extractField(content, "Class"))
                .passengerName(extractField(content, "Passenger Name"))
                .seatNo(extractField(content, "Seat No"))
                .build();
    }

    public FerryDetails parseFerry(EmailData emailData) {
        String content = String.join("\n", emailData.texts());
        return FerryDetails.builder()
                .transportCompany(extractField(content, "Ferry Company"))
                .passengerName(extractField(content, "Passenger Name"))
                .departurePort(extractField(content, "Departure Port"))
                .departureTime(parseDateTime(extractField(content, "Departure Date")))
                .arrivalPort(extractField(content, "Arrival Port"))
                .arrivalTime(parseDateTime(extractField(content, "Arrival Date")))
                .ticketType(extractField(content, "Ticket Type"))
                .build();
    }

    public CarRentalDetails parseCarRental(EmailData emailData) {
        String content = String.join("\n", emailData.texts());
        return CarRentalDetails.builder()
                .rentalCompany(extractField(content, "Company"))
                .carModel(extractField(content, "Car Model"))
                .vrn(extractField(content, "VRN"))
                .renterName(extractField(content, "Renter Name"))
                .pickupLocation(extractField(content, "Pickup Location"))
                .pickupTime(parseDateTime(extractField(content, "Pickup Date")))
                .dropoffLocation(extractField(content, "Dropoff Location"))
                .dropoffTime(parseDateTime(extractField(content, "Dropoff Date")))
                .build();
    }

    private String extractField(String content, String fieldName) {
        if (content == null || fieldName == null) return null;
        Pattern pattern = Pattern.compile(Pattern.quote(fieldName) + "\\s*[:\\-]?\\s*(.+?)(?=\\r?\\n|$)");
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) return matcher.group(1).trim();
        return null;
    }

    private LocalDateTime parseDateTime(String str) {
        if (str == null) return null;
        String[] patterns = {"yyyy-MM-dd HH:mm", "dd/MM/yyyy HH:mm", "dd MMM yyyy HH:mm"};
        for (String p : patterns) {
            try { return LocalDateTime.parse(str, DateTimeFormatter.ofPattern(p)); } catch (Exception ignored) {}
        }
        return null;
    }

    private LocalDate parseDate(String str) {
        if (str == null) return null;
        String[] patterns = {"yyyy-MM-dd", "dd/MM/yyyy", "dd MMM yyyy"};
        for (String p : patterns) {
            try { return LocalDate.parse(str, DateTimeFormatter.ofPattern(p)); } catch (Exception ignored) {}
        }
        return null;
    }

    private LocalTime parseTime(String str) {
        if (str == null) return null;
        String[] patterns = {"HH:mm", "H:mm"};
        for (String p : patterns) {
            try { return LocalTime.parse(str, DateTimeFormatter.ofPattern(p)); } catch (Exception ignored) {}
        }
        return null;
    }

    private Integer parseInt(String str) {
        if (str == null) return null;
        try { return Integer.parseInt(str.trim()); } catch (NumberFormatException e) { return null; }
    }
}
