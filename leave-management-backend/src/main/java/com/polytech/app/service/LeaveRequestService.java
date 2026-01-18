package com.polytech.app.service;

import java.math.BigDecimal;

import com.polytech.app.domain.LeaveBalance;
import com.polytech.app.domain.LeaveRequest;
import com.polytech.app.domain.LeaveType;
import com.polytech.app.domain.User;
import com.polytech.app.repository.LeaveBalanceRepository;
import com.polytech.app.repository.LeaveRequestRepository;
import com.polytech.app.repository.UserRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
@Transactional
public class LeaveRequestService {
	
	@PersistenceContext
    EntityManager em;
	
	@Inject
	LeaveRequestRepository repo;
	
	@Inject
	LeaveBalanceRepository leaveBalanceRepository;
	
	@Inject 
	UserRepository userRepository;
	
	public String generateRequestNumber() {
	    String year = String.valueOf(java.time.Year.now().getValue());
	    Long seq = em.createQuery(
	        "SELECT count(lr) + 1 FROM LeaveRequest lr WHERE lr.requestNumber LIKE :pattern", Long.class)
	        .setParameter("pattern", "REQ-" + year + "-%")
	        .getSingleResult();
	        
	    return String.format("REQ-%s-%03d", year, seq);
	}
	
	public void validateBalance(String userId, LeaveType leaveType, BigDecimal totalDays) {
	    LeaveBalance balance = leaveBalanceRepository.findCurrentYear(userId, leaveType.getId())
	        .orElseThrow(() -> new BadRequestException("No balance for this leave type"));
	    
	    if (balance.getRemainingDays().compareTo(totalDays) < 0) {
	        throw new BadRequestException("Insufficient balance: " + 
	            balance.getRemainingDays() + " days remaining");
	    }
	}
	
    public LeaveRequest createWithManager(String employeeId, LeaveRequest request) {
    	validateBalance(employeeId, request.getLeaveType(), request.getTotalDays());
        
        User employee = userRepository.findById(employeeId)
            .orElseThrow(() -> new NotFoundException("Employee not found"));
            
        if (employee.getManagerId() == null) {
            throw new BadRequestException("No manager assigned to employee");
        }
        
        request.setCurrentApproverId(employee.getManagerId());
        request.setRequestNumber(generateRequestNumber());
        
        em.persist(request);
        em.flush();
        return request;
    }
}
