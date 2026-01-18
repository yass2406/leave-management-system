import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { LeaveType, User } from "@/types/types"

interface LeaveRequestFormProps {
  user: User
  leaveTypes: LeaveType[]
  selectedLeaveTypeId: string
  onLeaveTypeChange: (id: string) => void
  reason: string
  onReasonChange: (reason: string) => void
}

export function LeaveRequestForm({ user, leaveTypes, selectedLeaveTypeId, onLeaveTypeChange, reason, onReasonChange }: LeaveRequestFormProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <div className="flex flex-col gap-1 text-left">
        <h1 className="text-2xl font-semibold">Request time off</h1>
        <p className="text-muted-foreground text-sm">Please review your details carefully.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="employeeCode">Employee code</FieldLabel>
          <Input id="employeeCode" value={user?.employeeCode || ""} disabled />
        </Field>
        <Field>
          <FieldLabel htmlFor="fullName">Full name</FieldLabel>
          <Input id="fullName" value={`${user?.firstName || ""} ${user?.lastName || ""}`} disabled />
        </Field>
        <Field>
          <FieldLabel htmlFor="leaveType">Leave type</FieldLabel>
          <Select value={selectedLeaveTypeId} onValueChange={onLeaveTypeChange}>
            <SelectTrigger id="leaveType" className="w-full">
              <SelectValue placeholder="Select a leave type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Leave types</SelectLabel>
                {leaveTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="reason">Reason for leave</FieldLabel>
        <Textarea id="reason" value={reason} onChange={e => onReasonChange(e.target.value)} rows={3} />
      </Field>
    </div>
  )
}