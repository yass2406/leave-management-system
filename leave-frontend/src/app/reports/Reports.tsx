/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import * as React from "react";
import toast from "react-hot-toast";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { API_BASE } from "@/types/consts";
import type {
    DepartmentLeaveUtilization,
    EmployeeLeaveUsage,
    LeaveTypeDistribution,
    MonthlyLeaveStats,
} from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";

const chartConfig = {
    utilization: {
        label: "Utilization %",
        color: "hsl(var(--chart-1))",
    },
    avgDays: {
        label: "Avg days / employee",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;
import { helix } from "ldrs";

const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

helix.register();

export function Reports() {
    const [data, setData] = React.useState<DepartmentLeaveUtilization[]>([]);
    const [monthly, setMonthly] = React.useState<MonthlyLeaveStats[]>([]);
    const [byType, setByType] = React.useState<LeaveTypeDistribution[]>([]);
    const [topEmployees, setTopEmployees] = React.useState<EmployeeLeaveUsage[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [year, setYear] = React.useState<number>(new Date().getFullYear());

    const lmAuth = sessionStorage.getItem("lm_auth");
    if (!lmAuth) return null;

    const fetchReport = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE}/hr-dashboard/leave-utilization?year=${year}`,
                { headers: { Authorization: lmAuth } }
            );
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? "Failed to load report");
            }
            const json = (await res.json()) as DepartmentLeaveUtilization[];
            setData(json);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to load report");
        } finally {
            setLoading(false);
        }
    }, [lmAuth, year]);

    const fetchMonthly = React.useCallback(async () => {
        try {
            const res = await fetch(
                `${API_BASE}/hr-dashboard/leave-utilization/monthly?year=${year}`,
                { headers: { Authorization: lmAuth } }
            );
            if (!res.ok) throw new Error("Failed to load monthly stats");
            const json = (await res.json()) as MonthlyLeaveStats[];
            setMonthly(json);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to load monthly stats");
        }
    }, [lmAuth, year]);

    const fetchByType = React.useCallback(async () => {
        try {
            const res = await fetch(
                `${API_BASE}/hr-dashboard/leave-utilization/by-type?year=${year}`,
                { headers: { Authorization: lmAuth } }
            );
            if (!res.ok) throw new Error("Failed to load type distribution");
            const json = (await res.json()) as LeaveTypeDistribution[];
            setByType(json);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to load type distribution");
        }
    }, [lmAuth, year]);

    const fetchTopEmployees = React.useCallback(async () => {
        try {
            const res = await fetch(
                `${API_BASE}/hr-dashboard/leave-utilization/top-employees?year=${year}&limit=10`,
                { headers: { Authorization: lmAuth } }
            );
            if (!res.ok) throw new Error("Failed to load top employees");
            const json = (await res.json()) as EmployeeLeaveUsage[];
            setTopEmployees(json);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to load top employees");
        }
    }, [lmAuth, year]);

    React.useEffect(() => {
        fetchReport();
        fetchMonthly();
        fetchByType();
        fetchTopEmployees();
    }, [fetchReport, fetchMonthly, fetchByType, fetchTopEmployees]);

    const handleDownloadPdf = async () => {
        try {
            const res = await fetch(
                `${API_BASE}/hr-dashboard/leave-utilization/pdf?year=${year}`,
                { headers: { Authorization: lmAuth } }
            );
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? "Failed to generate PDF");
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `leave-utilization-${year}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to download PDF");
        }
    };

    const chartData = data.map((row) => ({
        dept:
            row.departmentCode && row.departmentName
                ? row.departmentCode
                : row.departmentName ?? "No dept",
        utilization: Number(row.utilizationRate.toFixed(2)),
        avgDays: Number(row.averageLeaveDaysPerEmployee.toFixed(2)),
    }));

    const monthlyChartData = monthly.map((m) => ({
        month: monthLabels[m.month - 1] ?? String(m.month),
        days: Number(m.totalLeaveDays.toFixed(2)),
    }));

    const typeChartData = byType.map((t) => ({
        type: t.leaveTypeCode || t.leaveTypeName,
        days: Number(t.totalLeaveDays.toFixed(2)),
    }));

    if (loading) {
        return (
            <div className="flex h-72 w-full items-center justify-center">
                <l-helix size="16" speed="1.2" color="#0a0a0a"></l-helix>
            </div>
        );
    }

    return (
        <Card className="border border-border bg-card">
            <CardHeader className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="text-base sm:text-lg">
                        Leave analytics – {year}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            className="w-24 rounded-md border border-border bg-background/80 px-2 py-1 text-xs sm:text-sm"
                            value={year}
                            onChange={(e) =>
                                setYear(Number(e.target.value) || new Date().getFullYear())
                            }
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                fetchReport();
                                fetchMonthly();
                                fetchByType();
                                fetchTopEmployees();
                            }}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>
                <Button size="sm" onClick={handleDownloadPdf} disabled={loading}>
                    Download PDF
                </Button>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* 1) Department chart – full width */}
                <section className="space-y-2">
                    {data.length > 0 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                                Department utilization and average days
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                                Approved leave, {year}
                            </span>
                        </div>
                    )}
                    {data.length > 0 && (
                        <ChartContainer
                            config={chartConfig}
                            className="h-72 w-full rounded-md border border-border bg-muted/40 px-3 py-3 sm:px-4"
                        >
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="dept"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 10 }}
                                    orientation="left"
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 10 }}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar
                                    yAxisId="left"
                                    dataKey="utilization"
                                    name={chartConfig.utilization.label}
                                    fill={chartConfig.utilization.color}
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="avgDays"
                                    name={chartConfig.avgDays.label}
                                    fill={chartConfig.avgDays.color}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    )}
                </section>

                {/* 2) Row: Monthly trend + Leave type distribution */}
                <section className="grid gap-4 lg:grid-cols-2">
                    {/* Monthly trend card */}
                    <div className="rounded-md border border-border bg-muted/40 px-3 py-3 sm:px-4">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium">Monthly leave trend</p>
                            <span className="text-[11px] text-muted-foreground">
                                Total approved leave days
                            </span>
                        </div>
                        {monthlyChartData.length > 0 ? (
                            <ChartContainer
                                config={{
                                    days: {
                                        label: "Total leave days",
                                        color: "hsl(var(--chart-3))",
                                    },
                                }}
                                className="h-64 w-full rounded-md border border-border bg-muted/40 px-3 py-3 sm:px-4"
                            >
                                <AreaChart data={monthlyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        type="monotone"
                                        dataKey="days"
                                        name="Total leave days"
                                        stroke="hsl(var(--chart-3))"
                                        fill="hsl(var(--chart-3))"
                                        fillOpacity={0.2}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        ) : (
                            <p className="mt-4 text-xs text-muted-foreground">
                                No monthly data for this year.
                            </p>
                        )}
                    </div>

                    {/* Leave type distribution card */}
                    <div className="rounded-md border border-border bg-muted/40 px-3 py-3 sm:px-4">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium">Leave days by type</p>
                            <span className="text-[11px] text-muted-foreground">
                                Approved leave, {year}
                            </span>
                        </div>
                        {typeChartData.length > 0 ? (
                            <ChartContainer
                                config={{
                                    days: {
                                        label: "Total leave days",
                                        color: "hsl(var(--chart-4))",
                                    },
                                }}
                                className="h-64 w-full"
                            >
                                <BarChart data={typeChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="type"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar
                                        dataKey="days"
                                        name="Total leave days"
                                        fill="hsl(var(--chart-4))"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <p className="mt-4 text-xs text-muted-foreground">
                                No leave type data for this year.
                            </p>
                        )}
                    </div>
                </section>

                {/* 3) Row: Top users + Department table */}
                <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] no-scrollbar">
                    {/* Top leave users card */}
                    <div className="rounded-md border border-border bg-muted/40 px-3 py-3 sm:px-4">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium">Top leave users</p>
                            <span className="text-[11px] text-muted-foreground">
                                Top 10 employees by leave days
                            </span>
                        </div>
                        {topEmployees.length > 0 ? (
                            <div className="max-h-60 overflow-x-auto overflow-y-hidden rounded-md border border-border/60 bg-card no-scrollbar">
                                <Table className="min-w-105">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10 text-center text-[11px]">#</TableHead>
                                            <TableHead className="text-[11px]">Employee</TableHead>
                                            <TableHead className="text-right text-[11px]">Dept</TableHead>
                                            <TableHead className="text-right text-[11px]">
                                                Total leave days
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topEmployees.map((emp, idx) => (
                                            <TableRow key={emp.employeeId}>
                                                <TableCell className="text-center text-[11px] text-muted-foreground">
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium">{emp.fullName}</span>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {emp.employeeCode}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-muted-foreground">
                                                    {emp.departmentCode ?? "—"}
                                                </TableCell>
                                                <TableCell className="text-right text-xs">
                                                    {emp.totalLeaveDays.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="mt-4 text-xs text-muted-foreground">
                                No employee-level data for this year.
                            </p>
                        )}
                    </div>

                    {/* Department table card */}
                    <div className="rounded-md border border-border/60 bg-card">
                        <div className="flex items-center justify-between border-b border-border px-3 py-2 sm:px-4">
                            <div className="flex flex-col">
                                <p className="text-sm font-medium">Department leave summary</p>
                                <span className="text-[11px] text-muted-foreground">
                                    Approved leave, {year}
                                </span>
                            </div>
                        </div>
                        {loading ? (
                            <div className="py-4 text-sm text-muted-foreground">
                                Loading utilization report...
                            </div>
                        ) : (
                            <div className="overflow-x-auto no-scrollbar p-3">
                                <Table className="min-w-130">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Department</TableHead>
                                            <TableHead className="text-right">Headcount</TableHead>
                                            <TableHead className="text-right">Total leave days</TableHead>
                                            <TableHead className="text-right">
                                                Avg days / employee
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Utilization (% of workdays)
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.map((row) => (
                                            <TableRow key={row.departmentId ?? row.departmentName}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">
                                                            {row.departmentCode
                                                                ? `${row.departmentCode} – ${row.departmentName}`
                                                                : row.departmentName ?? "No department"}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            ID: {row.departmentId ?? "n/a"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">{row.headcount}</TableCell>
                                                <TableCell className="text-right">
                                                    {row.totalApprovedLeaveDays.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {row.averageLeaveDaysPerEmployee.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {row.utilizationRate.toFixed(2)}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {data.length === 0 && !loading && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="py-4 text-center text-sm text-muted-foreground"
                                                >
                                                    No data for this year.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </section>
            </CardContent>
        </Card>
    );
}