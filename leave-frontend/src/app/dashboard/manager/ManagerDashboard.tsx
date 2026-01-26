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
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconClockHour4
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from '@/components/ui/separator'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { LeaveBalance, LeaveRequest, LeaveType, TeamLeaveRequest } from '@/types/types'
import { API_BASE } from '@/types/consts'

export default function ManagerDashboard() {
    const [currentYear] = useState(new Date().getFullYear());
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [teamRequests, setTeamRequests] = useState<TeamLeaveRequest[]>([]);
    const [teamSize, setTeamSize] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const loadData = async () => {
        const lmAuth = sessionStorage.getItem("lm_auth");
        if (!lmAuth) return;
        const [requestsRes, typesRes, balancesRes, teamRes] = await Promise.all([
            fetch(`${API_BASE}/leaves/year/${currentYear}`, {
                headers: { Authorization: lmAuth },
            }),
            fetch(`${API_BASE}/leave-types`, {
                headers: { Authorization: lmAuth },
            }),
            fetch(`${API_BASE}/leave-balances/me/${currentYear}`, {
                headers: { Authorization: lmAuth },
            }),
            fetch(`${API_BASE}/leaves/team/year/${currentYear}`, {
                headers: { Authorization: lmAuth },
            }),
        ]);
        setLeaveRequests(await requestsRes.json());
        setLeaveTypes(await typesRes.json());
        setBalances(await balancesRes.json());

        const teamJson = await teamRes.json();
        setTeamRequests(teamJson.requests ?? teamJson);
        setTeamSize(teamJson.teamSize ?? (teamJson.requests
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? new Set(teamJson.requests.map((r: any) => r.employeeId)).size
            : 0));
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentYear]);

    const annualBalance = balances.find((b) => b.leaveTypeCode === "ANNUAL");
    const sickBalance = balances.find((b) => b.leaveTypeCode === "SICK");

    const nextApprovedLeave = useMemo(() => {
        const today = new Date();
        const approved = leaveRequests.filter(
            (r) => r.status === "Approved" && new Date(r.startDate) >= today
        );
        approved.sort(
            (a, b) =>
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        return approved[0] ?? null;
    }, [leaveRequests]);

    const teamOnLeaveToday = useMemo(() => {
        const today = new Date();
        const ids = new Set<string>();
        teamRequests.forEach((r) => {
            if (r.status !== "Approved") return;
            const start = new Date(r.startDate);
            const end = new Date(r.endDate);
            if (start <= today && today <= end) {
                ids.add(r.employeeId);
            }
        });
        return ids.size;
    }, [teamRequests]);

    const sortedTeamRequests = useMemo(() => {
        return [...teamRequests].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [teamRequests]);

    const totalPages = Math.max(
        1,
        Math.ceil(sortedTeamRequests.length / pageSize)
    );
    const pageData = sortedTeamRequests.slice(
        (page - 1) * pageSize,
        page * pageSize
    );
    return (
        <div className="flex flex-1 flex-col gap-2 p-4 pt-5">
            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Annual leave</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {annualBalance
                                ? `${annualBalance.remainingDays} days remaining`
                                : "—"}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        {annualBalance && (
                            <div className="text-muted-foreground">
                                Entitled: {annualBalance.entitledDays} • Taken:{" "}
                                {annualBalance.takenDays} • Carried over:{" "}
                                {annualBalance.carriedOver}
                            </div>
                        )}
                    </CardFooter>
                </Card>

                {/* Sick */}
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Sick leave</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {sickBalance
                                ? `${sickBalance.remainingDays} days remaining`
                                : "—"}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        {sickBalance && (
                            <div className="text-muted-foreground">
                                Entitled: {sickBalance.entitledDays} • Taken:{" "}
                                {sickBalance.takenDays}
                            </div>
                        )}
                    </CardFooter>
                </Card>

                {/* Next approved */}
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
                                {nextApprovedLeave.leaveTypeName} •{" "}
                                {nextApprovedLeave.totalDays} days
                            </div>
                        )}
                    </CardFooter>
                </Card>

                {/* Team on leave */}
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Team on leave today</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {teamOnLeaveToday} / {teamSize}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="text-muted-foreground">
                            Direct reports currently on approved leave.
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
            <Separator className="my-4" />
            {/* Latest team requests table */}
            <div className="min-h-screen flex-1 md:min-h-min m-5">
                <Table>
                    <TableCaption>Your team&apos;s latest leave requests.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Request #</TableHead>
                            <TableHead>Employee Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Leave Type</TableHead>
                            <TableHead>Total Days</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageData.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">
                                    {req.requestNumber}
                                </TableCell>
                                <TableCell>{req.employeeCode}</TableCell>
                                <TableCell>{req.employeeName}</TableCell>
                                <TableCell>{req.leaveTypeName}</TableCell>
                                <TableCell>{req.totalDays}</TableCell>
                                <TableCell>
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            req.status === "Approved"
                                                ? "secondary"
                                                : req.status === "Rejected"
                                                    ? "destructive"
                                                    : "outline"
                                        }
                                        className="inline-flex items-center gap-1 px-1.5"
                                    >
                                        {req.status === "Approved" && (
                                            <IconCircleCheckFilled className="h-3.5 w-3.5 fill-green-500 dark:fill-green-400" />
                                        )}
                                        {req.status === "Rejected" && (
                                            <IconCircleXFilled className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                                        )}
                                        {req.status === "Pending" && (
                                            <IconClockHour4 className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                                        )}
                                        {req.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 text-sm">
                    <span>
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </button>
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}