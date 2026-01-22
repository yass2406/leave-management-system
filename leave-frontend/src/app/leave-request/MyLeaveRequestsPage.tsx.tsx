// TODO: REMOVE ANY CONSOLE LOGS BEFORE PRODUCTION

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import CreateLeaveRequest from "../leave-request/CreateLeaveRequest"
import type { LeaveRequest } from "@/types/types"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import toast from "react-hot-toast"

export default function MyLeaveRequestsPage() {
    const apiBase = "http://localhost:8080/leave-management-backend/api"
    const [showCreateForm, setShowCreateForm] = React.useState(false)
    const [requests, setRequests] = React.useState<LeaveRequest[]>([])

    // TODO: TAKE CARE OF FILTERS TO INCLUDE LEAVE TYPE ALSO 
    // AND IMPROVE THE FILTER LOGIC WITH THE API 

    const [filters, setFilters] = React.useState({
        status: "",
        startDateFrom: "",
        leaveTypeId: ""
    })
    const [loading, setLoading] = React.useState(false)
    const loadRequests = async () => {
        setLoading(true)
        try {
            const lmAuth = sessionStorage.getItem("lm_auth")
            if (!lmAuth) throw new Error("No auth token")
            const params = new URLSearchParams()
            if (filters.status) params.append("status", filters.status)
            if (filters.startDateFrom) params.append("startDateFrom", filters.startDateFrom)
            if (filters.leaveTypeId) params.append("leaveTypeId", filters.leaveTypeId)
            const res = await fetch(`${apiBase}/leaves?${params}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": lmAuth
                },
            })

            if (!res.ok) {
                const errorData = await res.json()
                toast.error(errorData.error || `Error ${res.status}`)
                return
            }
            const data: LeaveRequest[] = await res.json()
            setRequests(data)
        } catch (error) {
            console.error('Request failed:', error)
            toast.error("Network error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        loadRequests()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const applyFilters = () => loadRequests()
    const clearFilters = () => {
        setFilters({ status: "", startDateFrom: "", leaveTypeId: "" })
        loadRequests()
    }

    const handleCreated = (savedRequest: LeaveRequest) => {
        setRequests(prev => [savedRequest, ...prev])
        setShowCreateForm(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    My leave requests
                </h2>
                <Button onClick={() => setShowCreateForm(true)}>
                    New leave request
                </Button>
            </div>
            {/* Filters */}
            {!showCreateForm && (
                <div className="rounded-lg border bg-background p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium block mb-1">Status</label>
                            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">From Date</label>
                            <Input
                                type="date"
                                value={filters.startDateFrom}
                                onChange={(e) => setFilters({ ...filters, startDateFrom: e.target.value })}
                            />
                        </div>
                        <div className="flex items-end space-x-2">
                            <Button onClick={applyFilters} disabled={loading}>
                                {loading ? "Loading..." : "Filter"}
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {showCreateForm ? (
                <div className="rounded-lg border bg-background p-4">
                    <CreateLeaveRequest
                        onCreated={handleCreated}
                        onCancel={() => setShowCreateForm(false)}
                    />
                </div>
            ) : (
                <div className="rounded-lg border bg-background p-4">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 text-left">Request #</th>
                                <th className="py-2 text-left">Type</th>
                                <th className="py-2 text-left">Start date</th>
                                <th className="py-2 text-left">End date</th>
                                <th className="py-2 text-left">Total Days</th>
                                <th className="py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} className="border-b last:border-0">
                                    <td className="py-2">{req.requestNumber}</td>
                                    <td className="py-2">{req.leaveTypeName}</td>
                                    <td className="py-2">{req.startDate}</td>
                                    <td className="py-2">{req.endDate}</td>
                                    <td className="py-2">{req.totalDays}</td>
                                    <td className="py-2">
                                        <div className="inline-flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    req.status === "Approved"
                                                        ? "default"
                                                        : req.status === "Pending"
                                                            ? "secondary"
                                                            : req.status === "Rejected"
                                                                ? "destructive"
                                                                : req.status === "Cancelled"
                                                                    ? "outline"
                                                                    : "default"
                                                }
                                                className="inline-flex items-center gap-1"
                                            >
                                                {req.status}
                                            </Badge>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-muted-foreground">
                                        No leave requests yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}