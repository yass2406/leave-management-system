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
  IconCircleCheckFilled
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

export default function ManagerDashboard() {
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
                <Calendar>
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
            <div className="min-h-screen flex-1 md:min-h-min m-5">
                <Table>
                    <TableCaption>Your Team's Leave Requests.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Request Number</TableHead>
                            <TableHead>Employee Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Leave Type</TableHead>
                            <TableHead>Total Days</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">INV001</TableCell>
                            <TableCell>EMP001</TableCell>
                            <TableCell>Yasmine Mizouri</TableCell>
                            <TableCell>Annual</TableCell>
                            <TableCell>2</TableCell>
                            <TableCell>11-01-2026</TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="text-muted-foreground px-1.5">
                                    Approved
                                    <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
                                </Badge>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
