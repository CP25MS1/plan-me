package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.expense.TripDebtBalance;
import capstone.ms.api.modules.itinerary.entities.expense.TripDebtBalanceId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripDebtBalanceRepository extends JpaRepository<TripDebtBalance, TripDebtBalanceId> {
}
