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
import type { LeaveRequest, LeaveType } from '@/types/types';
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function EmployeeDashboard() {
  const [currentYear] = useState(new Date().getFullYear());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const apiBase = "http://localhost:8080/leave-management-backend/api";
  const loadData = async () => {
    const lmAuth = sessionStorage.getItem("lm_auth");
    // Fetch requests for year
    const requestsRes = await fetch(`${apiBase}/leaves/year/${currentYear}`, {
      headers: { Authorization: lmAuth! }
    });
    setLeaveRequests(await requestsRes.json());

    // Fetch leave types (for colors)
    const typesRes = await fetch(`${apiBase}/leave-types`, {
      headers: { Authorization: lmAuth! }
    });
    setLeaveTypes(await typesRes.json());
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear]);
  return (
    <div className="flex flex-1 flex-col gap-2 p-4 pt-5">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Leave Balance</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              12 Days Remaining
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              This number represents your leave balance, including any days you’ve requested that are still pending approval.
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Leave Balance</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              12 Days Remaining
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              This number represents your leave balance, including any days you’ve requested that are still pending approval.
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Leave Balance</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              12 Days Remaining
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              This number represents your leave balance, including any days you’ve requested that are still pending approval.
            </div>
          </CardFooter>
        </Card>
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
