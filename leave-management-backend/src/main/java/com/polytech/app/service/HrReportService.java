package com.polytech.app.service;

import com.polytech.app.dto.DepartmentLeaveUtilizationDTO;
import com.polytech.app.dto.EmployeeLeaveUsageDTO;
import com.polytech.app.dto.LeaveTypeDistributionDTO;
import com.polytech.app.dto.MonthlyLeaveStatsDTO;
import com.polytech.app.repository.LeaveRequestRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
@Transactional
public class HrReportService {

	@Inject
	LeaveRequestRepository leaveRequestRepository;

	public List<DepartmentLeaveUtilizationDTO> getDepartmentLeaveUtilization(int year) {
		int workdaysInYear = calculateWorkdaysInYear(year);
		List<DepartmentLeaveUtilizationDTO> dtos = leaveRequestRepository.findDepartmentLeaveStatsForYear(year);

		for (DepartmentLeaveUtilizationDTO dto : dtos) {
			long headcount = dto.getHeadcount();
			double totalLeaveDays = dto.getTotalApprovedLeaveDays();

			double avgPerEmployee = headcount > 0 ? totalLeaveDays / headcount : 0.0;
			double utilizationRate = workdaysInYear > 0 ? (avgPerEmployee / workdaysInYear) * 100.0 : 0.0;

			dto.setAverageLeaveDaysPerEmployee(avgPerEmployee);
			dto.setUtilizationRate(utilizationRate);
		}

		return dtos;
	}

	private int calculateWorkdaysInYear(int year) {
		LocalDate date = LocalDate.of(year, 1, 1);
		LocalDate end = LocalDate.of(year, 12, 31);
		int workdays = 0;
		while (!date.isAfter(end)) {
			DayOfWeek dow = date.getDayOfWeek();
			if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
				workdays++;
			}
			date = date.plusDays(1);
		}
		return workdays;
	}

	public List<MonthlyLeaveStatsDTO> getMonthlyLeaveStats(int year) {
		return leaveRequestRepository.findMonthlyLeaveStatsForYear(year);
	}

	public List<LeaveTypeDistributionDTO> getLeaveTypeDistribution(int year) {
		return leaveRequestRepository.findLeaveTypeDistributionForYear(year);
	}

	public List<EmployeeLeaveUsageDTO> getTopEmployeeLeaveUsage(int year, int limit) {
		return leaveRequestRepository.findTopEmployeeLeaveUsageForYear(year, limit);
	}

	public byte[] buildLeaveUtilizationPdf(int year) {
		try {
			List<DepartmentLeaveUtilizationDTO> deptData = getDepartmentLeaveUtilization(year);
			List<MonthlyLeaveStatsDTO> monthlyData = getMonthlyLeaveStats(year);
			List<LeaveTypeDistributionDTO> typeData = getLeaveTypeDistribution(year);
			List<EmployeeLeaveUsageDTO> topEmployees = getTopEmployeeLeaveUsage(year, 10);

			try (InputStream is = getClass().getResourceAsStream("/reports/leave_utilization.jrxml")) {
				if (is == null) {
					throw new IllegalStateException("JRXML template not found at /reports/leave_utilization.jrxml");
				}

				JasperReport jasperReport = JasperCompileManager.compileReport(is);

				Map<String, Object> params = new HashMap<>();
				params.put("REPORT_YEAR", year);
				params.put("MONTHLY_DS", new JRBeanCollectionDataSource(monthlyData));
				params.put("TYPE_DS", new JRBeanCollectionDataSource(typeData));
				params.put("TOP_EMP_DS", new JRBeanCollectionDataSource(topEmployees));

				JRBeanCollectionDataSource deptDs = new JRBeanCollectionDataSource(deptData);

				JasperPrint print = JasperFillManager.fillReport(jasperReport, params, deptDs);

				ByteArrayOutputStream baos = new ByteArrayOutputStream();
				JasperExportManager.exportReportToPdfStream(print, baos);
				return baos.toByteArray();
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("Failed to generate leave utilization PDF: " + e.getMessage(), e);
		}
	}
}
