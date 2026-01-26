import { type Icon } from "@tabler/icons-react"

export type LeaveRequestStatus =
    | "Pending"
    | "Approved"
    | "Rejected"
    | "Cancelled"

export type Role = "EMPLOYEE" | "MANAGER" | "HR";

export type LeaveType = {
    id: string
    code: string
    name: string
    maxDaysPerYear: number
    isPaid: boolean
    requiresApproval: boolean
    color: string
    active: boolean;
    // createdAt: string
    // updatedAt: string
}

export interface LeaveRequest extends NewLeaveRequest {
    id: string
    requestNumber: string
    employeeId: string
    leaveTypeName: string
    leaveTypeCode?: string
    startDate: string
    endDate: string
    totalDays: number
    reason?: string
    status: LeaveRequestStatus
    currentApproverId: string | null
    approvalLevel: number | null
    approvedAt: string | null
    rejectedAt: string | null
    createdAt: string
    updatedAt: string
}
export interface NewLeaveRequest {
    leaveTypeId: string
    startDate: string
    endDate: string
    reason?: string
}

export type User = {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    role: Role;
    departmentId: string | null;
    mustChangePassword: boolean;
};

export type SectionId = "dashboard" | "my-leave-requests" | "team" | "reports" | "users" | "leave-policies";

export type NavItem = {
    id: SectionId;
    title: string;
    icon?: Icon;
};

export interface UserTeam {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    role: Role;
    fullName?: string;
}

export interface LeaveBalance {
    leaveTypeId: string;
    leaveTypeCode: string;
    leaveTypeName: string;
    year: number;
    entitledDays: number;
    carriedOver: number;
    takenDays: number;
    remainingDays: number;
}

export interface TeamLeaveRequest {
    id: string;
    requestNumber: string;
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    leaveTypeId: string;
    leaveTypeName: string;
    leaveTypeCode: string;
    status: LeaveRequestStatus;
    totalDays: number;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export interface HrSummary {
    totalEmployees: number;
    totalManagers: number;
    totalEmployeesOnly: number;
}

export interface HrLeaveRequest {
    id: string;
    requestNumber: string;
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    role: Role;
    leaveTypeName: string;
    status: LeaveRequestStatus;
    totalDays: number;
    startDate: string;
    endDate: string;
    createdAt: string;
}


export interface DepartmentDTO {
    id: string;
    name: string;
}

export interface UserAdminDTO {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;    
    departmentId: string;
    departmentName: string;
    active: boolean;
}