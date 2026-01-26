package com.polytech.app.service;

import java.math.BigDecimal;

import com.polytech.app.domain.LeaveBalance;
import com.polytech.app.domain.LeaveType;
import com.polytech.app.domain.User;
import com.polytech.app.repository.LeaveTypeRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@ApplicationScoped
public class LeaveBalanceService {

	@PersistenceContext
	EntityManager em;

	@Inject
	LeaveTypeRepository leaveTypeRepository;

	public void generateBalancesForYear(int year) {
		var leaveTypes = em.createQuery("SELECT lt FROM LeaveType lt WHERE lt.active = true", LeaveType.class)
				.getResultList();

		var users = em.createQuery("SELECT u FROM User", User.class).getResultList();

		for (User user : users) {
			for (LeaveType type : leaveTypes) {
				createOrUpdateBalance(user, type, year, type.getMaxDaysPerYear());
			}
		}
	}

	private void createOrUpdateBalance(User user, LeaveType type, int year, Integer entitledDays) {
		var list = em
				.createQuery(
						"SELECT b FROM LeaveBalance b "
								+ "WHERE b.userId = :userId AND b.leaveType = :type AND b.year = :year",
						LeaveBalance.class)
				.setParameter("userId", user.getId()).setParameter("type", type).setParameter("year", year)
				.getResultList();

		LeaveBalance b;
		if (list.isEmpty()) {
			b = new LeaveBalance();
			b.setUserId(user.getId());
			b.setLeaveType(type);
			b.setYear(year);
			b.setTakenDays(BigDecimal.ZERO);
			b.setCarriedOver(BigDecimal.ZERO);
		} else {
			b = list.get(0);
		}

		b.setEntitledDays(BigDecimal.valueOf(entitledDays));
		em.merge(b);
	}
}
