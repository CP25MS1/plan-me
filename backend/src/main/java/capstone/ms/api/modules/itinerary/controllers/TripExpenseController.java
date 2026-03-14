package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.expense.CreateTripExpenseRequest;
import capstone.ms.api.modules.itinerary.dto.expense.TripExpenseDto;
import capstone.ms.api.modules.itinerary.dto.expense.TripExpenseListDto;
import capstone.ms.api.modules.itinerary.dto.expense.UpdateTripExpenseRequest;
import capstone.ms.api.modules.itinerary.services.expense.TripExpenseService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/trips/{tripId}/expenses")
public class TripExpenseController {
    private final TripExpenseService tripExpenseService;

    @GetMapping
    public ResponseEntity<TripExpenseListDto> getTripExpenses(@PathVariable Integer tripId,
                                                              @AuthenticationPrincipal User currentUser) {
        TripExpenseListDto expenses = tripExpenseService.getTripExpenses(tripId, currentUser);
        return ResponseEntity.ok(expenses);
    }

    @PostMapping
    public ResponseEntity<TripExpenseDto> createExpense(
            @PathVariable Integer tripId,
            @Valid @RequestBody CreateTripExpenseRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        TripExpenseDto created = tripExpenseService.createExpense(tripId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<TripExpenseDto> updateExpense(
            @PathVariable Integer tripId,
            @PathVariable Integer expenseId,
            @Valid @RequestBody UpdateTripExpenseRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        TripExpenseDto updated = tripExpenseService.updateExpense(tripId, expenseId, request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Integer tripId,
            @PathVariable Integer expenseId,
            @AuthenticationPrincipal User currentUser
    ) {
        tripExpenseService.deleteExpense(tripId, expenseId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
