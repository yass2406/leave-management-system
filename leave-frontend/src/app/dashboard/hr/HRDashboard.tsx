import {
    Calendar,
    CalendarCurrentDate,
    CalendarNextTrigger,
    CalendarPrevTrigger,
    CalendarTodayTrigger,
    CalendarViewTrigger,
    CalendarYearView,
} from "@/components/full-calendar";
import { IconCircleCheckFilled, IconCircleXFilled, IconClockHour4 } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { HrSummary, HrLeaveRequest, LeaveRequest, LeaveType } from "@/types/types";
import { API_BASE } from "@/types/consts";

export default function HRDashboard() {
    const [currentYear] = useState(new Date().getFullYear());
    const [summary, setSummary] = useState<HrSummary | null>(null);
    const [requests, setRequests] = useState<HrLeaveRequest[]>([]);
    const [leaveRequestsCalendar, setLeaveRequestsCalendar] = useState<LeaveRequest[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

    const [page, setPage] = useState(1);
    const pageSize = 10;
    const loadData = async () => {
        const lmAuth = sessionStorage.getItem("lm_auth");
        if (!lmAuth) return;

        const [sumRes, hrReqRes, calReqRes, typesRes] = await Promise.all([
            fetch(`${API_BASE}/hr-dashboard/summary`, {
                headers: { Authorization: lmAuth },
            }),
            fetch(`${API_BASE}/hr-dashboard/requests/${currentYear}`, {
                headers: { Authorization: lmAuth },
            }),
            fetch(`${API_BASE}/leaves/year/${currentYear}`, {
                headers: { Authorization: lmAuth },
            }),
            fetch(`${API_BASE}/leave-types`, {
                headers: { Authorization: lmAuth },
            }),
        ]);

        setSummary(await sumRes.json());
        setRequests(await hrReqRes.json());
        setLeaveRequestsCalendar(await calReqRes.json());
        setLeaveTypes(await typesRes.json());
    };

    useEffect(() => {
        void loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentYear]);

    const totalEmployees = summary?.totalEmployees ?? 0;
    const totalManagers = summary?.totalManagers ?? 0;
    const totalEmployeesOnly = summary?.totalEmployeesOnly ?? 0;

    const sortedRequests = useMemo(
        () =>
            [...requests].sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
        [requests]
    );
    const totalPages = Math.max(1, Math.ceil(sortedRequests.length / pageSize));
    const pageData = sortedRequests.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    return (
        <div className="flex flex-1 flex-col gap-2 p-4 pt-5">
            {/* Cards: employees / managers / total */}
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Employees</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {totalEmployeesOnly}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="text-muted-foreground">
                            Total employees working today.
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Managers</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {totalManagers}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="text-muted-foreground">
                            Total users working today.
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total workforce</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {totalEmployees}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="text-muted-foreground">
                            Employees, managers and HR combined.
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Calendar: all employees' leave */}
            <div className="min-h-screen flex-1 md:min-h-min">
                <Calendar leaveRequests={leaveRequestsCalendar} leaveTypes={leaveTypes}>
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

            {/* Latest leave requests for all employees */}
            <div className="min-h-screen flex-1 md:min-h-min m-5">
                <Table>
                    <TableCaption>All employees&apos; latest leave requests.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Request #</TableHead>
                            <TableHead>Employee Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
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
                                <TableCell>{req.role}</TableCell>
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
