package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.expense.TripExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TripExpenseRepository extends JpaRepository<TripExpense, Integer> {
    Optional<TripExpense> findByIdAndTripId(Integer expenseId, Integer tripId);
}
