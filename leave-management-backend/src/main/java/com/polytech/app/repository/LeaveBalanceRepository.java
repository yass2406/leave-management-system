package com.polytech.app.repository;

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
	    return em.createQuery(
	        "SELECT b FROM LeaveBalance b WHERE b.userId = :userId AND " +
	        "b.leaveType.id = :leaveTypeId AND b.year = :year", LeaveBalance.class)
	        .setParameter("userId", userId)
	        .setParameter("leaveTypeId", leaveTypeId)
	        .setParameter("year", year)
	        .getResultList().stream().findFirst();
	}

}
