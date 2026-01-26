package com.polytech.app.repository;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.polytech.app.domain.LeaveRequest;
import com.polytech.app.dto.LeaveRequestDTO;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Named;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@ApplicationScoped
@Named
@Transactional
public class LeaveRequestRepository {
	@PersistenceContext
	EntityManager em;

	public LeaveRequest save(LeaveRequest request) {
		em.persist(request);
		em.flush();
		return request;
	}

	public List<LeaveRequestDTO> findByEmployeeId(String effectiveEmployeeId, String status, String startDateFrom,
			String leaveTypeId) {
		StringBuilder jpql = new StringBuilder("""
				SELECT new com.polytech.app.dto.LeaveRequestDTO(
				lr.id, lr.requestNumber, lr.leaveType, lr.startDate, lr.endDate,
				lr.status, lr.totalDays, lr.reason
				) FROM LeaveRequest lr WHERE lr.employeeId = :empId
				""");

		Map<String, Object> params = new HashMap<>();
		params.put("empId", effectiveEmployeeId);

		if (status != null && !status.isEmpty()) {
			jpql.append(" AND lr.status = :status");
			params.put("status", LeaveRequest.Status.valueOf(status.toUpperCase()));
		}
		if (startDateFrom != null) {
			jpql.append(" AND lr.startDate >= :startFrom");
			params.put("startFrom", LocalDate.parse(startDateFrom));
		}
		if (leaveTypeId != null) {
			jpql.append(" AND lr.leaveType.id = :leaveTypeId");
			params.put("leaveTypeId", leaveTypeId);
		}

		jpql.append(" ORDER BY lr.createdAt DESC");

		var query = em.createQuery(jpql.toString(), LeaveRequestDTO.class);
		params.forEach(query::setParameter);

		return query.getResultList();
	}

	public List<LeaveRequestDTO> findByEmployeeIdAndYear(String userId, int year) {
		return em.createQuery("""
				SELECT new com.polytech.app.dto.LeaveRequestDTO(
				    lr.id, lr.requestNumber, lr.leaveType, lr.startDate, lr.endDate,
				    lr.status, lr.totalDays, lr.reason
				) FROM LeaveRequest lr
				WHERE lr.employeeId = :empId
				AND YEAR(lr.startDate) = :year
				ORDER BY lr.startDate
				""", LeaveRequestDTO.class).setParameter("empId", userId).setParameter("year", year)
				.getResultList();
	}

	public Optional<LeaveRequest> findEntityById(String id) {
		return Optional.ofNullable(em.find(LeaveRequest.class, id));
	}

	public LeaveRequest update(LeaveRequest request) {
		return em.merge(request);
	}

	public List<LeaveRequest> findTeamRequestsForYear(String managerId, int year) {
		return em
				.createQuery(
						"SELECT lr FROM LeaveRequest lr " + "JOIN FETCH lr.leaveType "
								+ "JOIN User u ON u.id = lr.employeeId " + "WHERE u.manager.id = :managerId "
								+ "AND FUNCTION('YEAR', lr.startDate) = :year " + "ORDER BY lr.createdAt DESC",
						LeaveRequest.class)
				.setParameter("managerId", managerId).setParameter("year", year).getResultList();
	}

	public List<LeaveRequest> findAllForYear(int year) {
		return em.createQuery("SELECT lr FROM LeaveRequest lr " + "JOIN FETCH lr.leaveType " +
				"WHERE FUNCTION('YEAR', lr.startDate) = :year " + "ORDER BY lr.createdAt DESC", LeaveRequest.class)
				.setParameter("year", year).getResultList();
	}

}
