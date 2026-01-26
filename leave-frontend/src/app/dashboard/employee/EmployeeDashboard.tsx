import {
  Calendar,
  CalendarCurrentDate,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
  CalendarViewTrigger,
  CalendarYearView,
} from '@/components/full-calendar'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { API_BASE } from '@/types/consts';
import type { LeaveBalance, LeaveRequest, LeaveType } from '@/types/types';
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function EmployeeDashboard() {
  const [currentYear] = useState(new Date().getFullYear());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);

  const loadData = async () => {
    const lmAuth = sessionStorage.getItem("lm_auth");
    if (!lmAuth) return;

    const [requestsRes, typesRes, balancesRes] = await Promise.all([
      fetch(`${API_BASE}/leaves/year/${currentYear}`, { headers: { Authorization: lmAuth } }),
      fetch(`${API_BASE}/leave-types`, { headers: { Authorization: lmAuth } }),
      fetch(`${API_BASE}/leave-balances/me/${currentYear}`, { headers: { Authorization: lmAuth } }),
    ]);

    setLeaveRequests(await requestsRes.json());
    setLeaveTypes(await typesRes.json());
    setBalances(await balancesRes.json());
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear]);

  const annualBalance = balances.find((b) => b.leaveTypeCode === "ANNUAL");
  const sickBalance = balances.find((b) => b.leaveTypeCode === "SICK");

  const nextApprovedLeave = (() => {
    const today = new Date();
    const approved = leaveRequests.filter(
      (r) => r.status === "Approved" && new Date(r.startDate) >= today
    );
    approved.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return approved[0] ?? null;
  })();

  return (
    <div className="flex flex-1 flex-col gap-2 p-4 pt-5">
    <div className="flex flex-1 flex-col gap-2 p-4 pt-5">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {/* Annual leave card */}
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Annual leave</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {annualBalance ? `${annualBalance.remainingDays} days remaining` : "—"}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              {annualBalance && (
                <div className="text-muted-foreground">
                  Entitled: {annualBalance.entitledDays} • Taken: {annualBalance.takenDays}
                </div>
              )}
            </CardFooter>
          </Card>

          {/* Sick leave card */}
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Sick leave</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {sickBalance ? `${sickBalance.remainingDays} days remaining` : "—"}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              {sickBalance && (
                <div className="text-muted-foreground">
                  Entitled: {sickBalance.entitledDays} • Taken: {sickBalance.takenDays}
                </div>
              )}
            </CardFooter>
          </Card>

          {/* Next approved leave card */}
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Next approved leave</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {nextApprovedLeave
                  ? `${nextApprovedLeave.startDate} → ${nextApprovedLeave.endDate}`
                  : "No upcoming leave"}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              {nextApprovedLeave && (
                <div className="text-muted-foreground">
                  {nextApprovedLeave.leaveTypeName} • {nextApprovedLeave.totalDays} days
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      <div className="min-h-screen flex-1 md:min-h-min">
        <Calendar leaveRequests={leaveRequests} leaveTypes={leaveTypes}>
          <div className="py-5 px-3 flex flex-col">
            <div className="flex px-6 items-center gap-2 mb-6">
              <CalendarViewTrigger
                view="year"
                className="aria-current:bg-accent"
              >
                Year
              </CalendarViewTrigger>
              <span className="flex-1" />
              <CalendarCurrentDate />
              <CalendarPrevTrigger>
                <ChevronLeft size={20} />
                <span className="sr-only">Previous</span>
              </CalendarPrevTrigger>
              <CalendarTodayTrigger>Today</CalendarTodayTrigger>
              <CalendarNextTrigger>
                <ChevronRight size={20} />
                <span className="sr-only">Next</span>
              </CalendarNextTrigger>
            </div>
            <div className="flex-1 px-6 overflow-hidden">
              <CalendarYearView />
            </div>
          </div>
        </Calendar>
      </div>
    </div>
  )
}
