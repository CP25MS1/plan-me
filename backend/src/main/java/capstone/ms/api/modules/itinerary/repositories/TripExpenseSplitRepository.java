package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.expense.TripExpenseSplit;
import capstone.ms.api.modules.itinerary.entities.expense.TripExpenseSplitId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TripExpenseSplitRepository extends JpaRepository<TripExpenseSplit, TripExpenseSplitId> {
    @Query("""
            SELECT s FROM TripExpenseSplit s
            JOIN FETCH s.participant
            WHERE s.expense.id = :expenseId
            """)
    List<TripExpenseSplit> findByExpenseIdWithParticipant(@Param("expenseId") Integer expenseId);

    void deleteByExpense_Id(Integer expenseId);

    @Query("""
            SELECT s FROM TripExpenseSplit s
            JOIN FETCH s.participant
            JOIN FETCH s.expense e
            WHERE e.trip.id = :tripId
            """)
    List<TripExpenseSplit> findByTripIdWithExpenseAndParticipant(@Param("tripId") Integer tripId);
}
