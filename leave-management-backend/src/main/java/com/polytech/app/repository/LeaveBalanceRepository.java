package com.polytech.app.repository;

import java.util.List;
import java.util.Optional;

import com.polytech.app.domain.LeaveBalance;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Named;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@ApplicationScoped
@Named
@Transactional(Transactional.TxType.SUPPORTS)
public class LeaveBalanceRepository {

	@PersistenceContext
	EntityManager em;

	public Optional<LeaveBalance> findCurrentYear(String userId, String leaveTypeId) {
		int year = java.time.Year.now().getValue();
		return em
				.createQuery("SELECT b FROM LeaveBalance b WHERE b.userId = :userId AND "
						+ "b.leaveType.id = :leaveTypeId AND b.year = :year", LeaveBalance.class)
				.setParameter("userId", userId).setParameter("leaveTypeId", leaveTypeId).setParameter("year", year)
				.getResultList().stream().findFirst();
	}

	public Optional<LeaveBalance> findByUserTypeYear(String userId, String leaveTypeId, int year) {
		var result = em
				.createQuery(
						"SELECT b FROM LeaveBalance b "
								+ "WHERE b.userId = :userId AND b.leaveType.id = :leaveTypeId AND b.year = :year",
						LeaveBalance.class)
				.setParameter("userId", userId).setParameter("leaveTypeId", leaveTypeId).setParameter("year", year)
				.getResultList();
		return result.stream().findFirst();
	}

	public LeaveBalance update(LeaveBalance balance) {
		return em.merge(balance);
	}

	public List<LeaveBalance> findByUserAndYear(String userId, int year) {
		return em.createQuery("SELECT b FROM LeaveBalance b " + "JOIN FETCH b.leaveType " +
				"WHERE b.userId = :userId AND b.year = :year", LeaveBalance.class).setParameter("userId", userId)
				.setParameter("year", year).getResultList();
	}
}
