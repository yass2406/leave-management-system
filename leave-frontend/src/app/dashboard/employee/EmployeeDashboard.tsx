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
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function EmployeeDashboard() {
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
    </div>
  )
}
