import { API_BASE } from "@/types/consts";
import type { LeaveRequest, LeaveType } from "@/types/types";

export async function fetchLeaveTypes(): Promise<LeaveType[]> {
    const res = await fetch(`${API_BASE}/leave-types`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load leave types");
    return res.json();
}

export async function createLeaveRequest(payload: LeaveRequest) {
    const res = await fetch(`${API_BASE}/leave-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create leave request");
    }
    return res.json();
}