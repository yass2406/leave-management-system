package com.polytech.app.repository;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.polytech.app.domain.LeaveRequest;
import com.polytech.app.dto.DepartmentLeaveUtilizationDTO;
import com.polytech.app.dto.EmployeeLeaveUsageDTO;
import com.polytech.app.dto.LeaveRequestDTO;
import com.polytech.app.dto.LeaveTypeDistributionDTO;
import com.polytech.app.dto.MonthlyLeaveStatsDTO;

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
				) FROM LeaveRequest lr WHERE lr.employee.id = :empId
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
				WHERE lr.employee.id = :empId
				AND YEAR(lr.startDate) = :year
				ORDER BY lr.startDate
				""", LeaveRequestDTO.class).setParameter("empId", userId).setParameter("year", year).getResultList();
	}

	public Optional<LeaveRequest> findEntityById(String id) {
		return Optional.ofNullable(em.find(LeaveRequest.class, id));
	}

	public LeaveRequest update(LeaveRequest request) {
		return em.merge(request);
	}

	public List<LeaveRequest> findTeamRequestsForYear(String managerId, int year) {
		return em.createQuery("""
				SELECT lr
				FROM LeaveRequest lr
				JOIN FETCH lr.leaveType
				JOIN lr.employee u
				WHERE u.manager.id = :managerId
				  AND FUNCTION('YEAR', lr.startDate) = :year
				ORDER BY lr.createdAt DESC
				""", LeaveRequest.class).setParameter("managerId", managerId).setParameter("year", year)
				.getResultList();
	}

	public List<LeaveRequest> findAllForYear(int year) {
		return em.createQuery(
				"SELECT lr FROM LeaveRequest lr " + "JOIN FETCH lr.leaveType "
						+ "WHERE FUNCTION('YEAR', lr.startDate) = :year " + "ORDER BY lr.createdAt DESC",
				LeaveRequest.class).setParameter("year", year).getResultList();
	}

	public List<DepartmentLeaveUtilizationDTO> findDepartmentLeaveStatsForYear(int year) {
		String jpql = """
				SELECT new com.polytech.app.dto.DepartmentLeaveUtilizationDTO(
				    d.id,
				    d.code,
				    d.name,
				    COUNT(DISTINCT u.id),
				    COALESCE(SUM(lr.totalDays), 0)
				)
				FROM User u
				LEFT JOIN u.department d
				LEFT JOIN LeaveRequest lr
				       ON lr.employee = u
				      AND lr.status = com.polytech.app.domain.LeaveRequest.Status.APPROVED
				      AND FUNCTION('YEAR', lr.startDate) = :year
				WHERE u.active = true
				GROUP BY d.id, d.code, d.name
				ORDER BY d.name
				""";

		return em.createQuery(jpql, DepartmentLeaveUtilizationDTO.class).setParameter("year", year).getResultList();
	}

	public List<MonthlyLeaveStatsDTO> findMonthlyLeaveStatsForYear(int year) {
		String jpql = """
				SELECT FUNCTION('MONTH', lr.startDate),
				       COALESCE(SUM(lr.totalDays), 0)
				FROM LeaveRequest lr
				WHERE lr.status = com.polytech.app.domain.LeaveRequest.Status.APPROVED
				  AND FUNCTION('YEAR', lr.startDate) = :year
				GROUP BY FUNCTION('MONTH', lr.startDate)
				ORDER BY FUNCTION('MONTH', lr.startDate)
				""";

		@SuppressWarnings("unchecked")
		List<Object[]> rows = em.createQuery(jpql).setParameter("year", year).getResultList();

		List<MonthlyLeaveStatsDTO> result = new java.util.ArrayList<>();
		for (Object[] row : rows) {
			Number monthNum = (Number) row[0];
			Object sumObj = row[1];

			int month = monthNum != null ? monthNum.intValue() : 0;
			double totalLeaveDays;

			if (sumObj instanceof java.math.BigDecimal bd) {
				totalLeaveDays = bd.doubleValue();
			} else if (sumObj instanceof Number n) {
				totalLeaveDays = n.doubleValue();
			} else {
				totalLeaveDays = 0.0;
			}

			result.add(new MonthlyLeaveStatsDTO(month, totalLeaveDays));
		}

		return result;
	}

	public List<LeaveTypeDistributionDTO> findLeaveTypeDistributionForYear(int year) {
		String jpql = """
				SELECT lt.code,
				       lt.name,
				       COALESCE(SUM(lr.totalDays), 0)
				FROM LeaveRequest lr
				JOIN lr.leaveType lt
				WHERE lr.status = com.polytech.app.domain.LeaveRequest.Status.APPROVED
				  AND FUNCTION('YEAR', lr.startDate) = :year
				GROUP BY lt.code, lt.name
				ORDER BY COALESCE(SUM(lr.totalDays), 0) DESC
				""";

		@SuppressWarnings("unchecked")
		List<Object[]> rows = em.createQuery(jpql).setParameter("year", year).getResultList();

		List<LeaveTypeDistributionDTO> result = new java.util.ArrayList<>();
		for (Object[] row : rows) {
			String code = (String) row[0];
			String name = (String) row[1];
			Object sumObj = row[2];

			double totalLeaveDays;
			if (sumObj instanceof java.math.BigDecimal bd) {
				totalLeaveDays = bd.doubleValue();
			} else if (sumObj instanceof Number n) {
				totalLeaveDays = n.doubleValue();
			} else {
				totalLeaveDays = 0.0;
			}

			result.add(new LeaveTypeDistributionDTO(code, name, totalLeaveDays));
		}
		return result;
	}

	public List<EmployeeLeaveUsageDTO> findTopEmployeeLeaveUsageForYear(int year, int limit) {
		String jpql = """
				SELECT u.id,
				       u.employeeCode,
				       CONCAT(u.firstName, ' ', u.lastName),
				       d.code,
				       COALESCE(SUM(lr.totalDays), 0)
				FROM LeaveRequest lr
				JOIN lr.employee u
				LEFT JOIN u.department d
				WHERE lr.status = com.polytech.app.domain.LeaveRequest.Status.APPROVED
				  AND FUNCTION('YEAR', lr.startDate) = :year
				GROUP BY u.id, u.employeeCode, u.firstName, u.lastName, d.code
				ORDER BY COALESCE(SUM(lr.totalDays), 0) DESC
				""";

		@SuppressWarnings("unchecked")
		List<Object[]> rows = em.createQuery(jpql).setParameter("year", year).setMaxResults(limit).getResultList();

		List<EmployeeLeaveUsageDTO> result = new java.util.ArrayList<>();
		for (Object[] row : rows) {
			String employeeId = (String) row[0];
			String employeeCode = (String) row[1];
			String fullName = (String) row[2];
			String departmentCode = (String) row[3];
			Object sumObj = row[4];

			double totalLeaveDays;
			if (sumObj instanceof java.math.BigDecimal bd) {
				totalLeaveDays = bd.doubleValue();
			} else if (sumObj instanceof Number n) {
				totalLeaveDays = n.doubleValue();
			} else {
				totalLeaveDays = 0.0;
			}

			result.add(new EmployeeLeaveUsageDTO(employeeId, employeeCode, fullName, departmentCode, totalLeaveDays));
		}

		return result;
	}
}
