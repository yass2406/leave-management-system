"use client"

import * as React from "react"
import { LeaveRequestForm } from "@/components/leave-request-form"
import { type DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import type { LeaveRequest, LeaveType, User } from "@/types/types"
import toast from "react-hot-toast"

type CreateLeaveRequestProps = {
  onCreated?: (request: LeaveRequest) => void
  onCancel?: () => void
  apiBase?: string
}

const formatLocalDate = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function CreateLeaveRequest({
  onCreated,
  onCancel,
  apiBase = "http://localhost:8080/leave-management-backend/api"
}: CreateLeaveRequestProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(2025, 5, 12),
    to: new Date(2025, 6, 15),
  })
  const today = new Date()
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User>({
    id: "",
    employeeCode: "",
    firstName: "",
    lastName: "",
    role: "EMPLOYEE",
    departmentId: null
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lmUser = sessionStorage.getItem("lm_user")
      if (lmUser) {
        setUser(JSON.parse(lmUser))
      }
      // Fetch leave types
      fetch(`${apiBase}/leave-types`)
        .then(res => res.json())
        .then(setLeaveTypes)
    }
  }, [apiBase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!dateRange?.from || !dateRange?.to || !selectedLeaveTypeId || !user?.id) return

    setLoading(true)
    const lmAuth = typeof window !== "undefined" ? sessionStorage.getItem("lm_auth") : null
    if (!lmAuth) {
      toast.error("No auth token found. Please log in.")
      setLoading(false)
      return
    }

    const body = {
      leaveTypeId: selectedLeaveTypeId,
      startDate: formatLocalDate(dateRange.from!),
      endDate: formatLocalDate(dateRange.to!),
      reason,
    }

    try {
      const response = await fetch(`${apiBase}/leaves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": lmAuth
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const created: LeaveRequest = await response.json()
        toast.success("Request created successfully!")
        onCreated?.(created)
      } else {
        try {
          const errorData = await response.json()
          toast.error(errorData.error || `Error ${response.status}`)
        } catch {
          toast.error(`Server error ${response.status}`)
        }
      }
    } catch (error) {
      toast.error("Network error. Please try again.")
      console.error('Create request failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      className="flex flex-col items-center px-4 py-4 space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="w-full max-w-3xl space-y-6">
        <LeaveRequestForm
          user={user}
          leaveTypes={leaveTypes}
          selectedLeaveTypeId={selectedLeaveTypeId}
          onLeaveTypeChange={setSelectedLeaveTypeId}
          reason={reason}
          onReasonChange={setReason}
        />

        <div className="flex justify-center">
          <div className="rounded-lg border bg-background p-4 shadow-sm">
            <Calendar
              mode="range"
              defaultMonth={today}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="rounded-md"
              disabled={{ before: today }}
              min={0}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit request"}
          </Button>
        </div>
      </div>
    </form>
  )
}