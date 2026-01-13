'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  type Locale,
  addDays,
  addMonths,
  addYears,
  format,
  getMonth,
  isSameDay,
  //   isSameMonth,
  //   isToday,
  setMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subYears,
} from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import {
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';


type View = 'month' | 'year';

type LeaveStatus = 'pending' | 'approved' | 'rejected' | null;
const getLeaveStatus = (date: Date): LeaveStatus => {
  const day = date.getDate();

  if (day % 7 === 0) return 'approved'; // green
  if (day % 5 === 0) return 'pending';  // orange
  if (day % 9 === 0) return 'rejected'; // red

  return null;
};
const statusBorder = {
  pending: 'border-t-[#F5A30E]',
  approved: 'border-t-[#0DF003]',
  rejected: 'border-t-[#F04900]',
};

type ContextType = {
  view: View;
  setView: (view: View) => void;
  date: Date;
  setDate: (date: Date) => void;
  locale: Locale;
  onChangeView?: (view: View) => void;
  enableHotkeys?: boolean;
  today: Date;
};

const Context = createContext<ContextType>({} as ContextType);

type CalendarProps = {
  children: ReactNode;
  defaultDate?: Date;
  view?: View;
  locale?: Locale;
  enableHotkeys?: boolean;
  onChangeView?: (view: View) => void;
};

const Calendar = ({
  children,
  defaultDate = new Date(),
  locale = enUS,
  view: _defaultMode = 'year',
  onChangeView,
}: CalendarProps) => {
  const [view, setView] = useState<View>(_defaultMode);
  const [date, setDate] = useState(defaultDate);

  return (
    <Context.Provider
      value={{
        view,
        setView,
        date,
        setDate,
        locale,
        onChangeView,
        today: new Date(),
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useCalendar = () => useContext(Context);

const CalendarViewTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & {
    view: View;
  }
>(({ children, view, ...props }) => {
  const { view: currentView, setView, onChangeView } = useCalendar();

  return (
    <Button
      aria-current={currentView === view}
      size="sm"
      variant="ghost"
      {...props}
      onClick={() => {
        setView(view);
        onChangeView?.(view);
      }}
    >
      {children}
    </Button>
  );
});
CalendarViewTrigger.displayName = 'CalendarViewTrigger';

// TODO: MONTH VIEW TO BE IMPLEMENTED IN THE FUTURE, ///
// FOR SIMPLICITY, NOW WE WORK WITH YEAR VIEW ONLY   ///

// const CalendarMonthView = () => {
//   const { date, view, locale } = useCalendar();

//   const monthDates = useMemo(() => getDaysInMonth(date), [date]);
//   const weekDays = useMemo(() => generateWeekdays(locale), [locale]);

//   if (view !== 'month') return null;

//   return (
//     <div className="h-full flex flex-col">
//       <div className="grid grid-cols-7 gap-px sticky top-0 bg-background border-b">
//         {weekDays.map((day, i) => (
//           <div
//             key={day}
//             className={cn(
//               'mb-2 text-right text-sm text-muted-foreground pr-2',
//               [0, 6].includes(i) && 'text-muted-foreground/50'
//             )}
//           >
//             {day}
//           </div>
//         ))}
//       </div>
//       <div className="grid overflow-hidden -mt-px flex-1 auto-rows-fr p-px grid-cols-7 gap-px">
//         {monthDates.map((_date) => {
//           return (
//             <div
//               className={cn(
//                 'ring-1 p-2 text-sm text-muted-foreground ring-border overflow-auto',
//                 !isSameMonth(date, _date) && 'text-muted-foreground/50'
//               )}
//               key={_date.toString()}
//             >
//               <span
//                 className={cn(
//                   'size-6 grid place-items-center rounded-full mb-1 sticky top-0',
//                   isToday(_date) && 'bg-primary text-primary-foreground'
//                 )}
//               >
//                 {format(_date, 'd')}
//               </span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

const CalendarYearView = () => {
  const { view, date, today, locale } = useCalendar();

  const months = useMemo(() => {
    if (!view) {
      return [];
    }

    return Array.from({ length: 12 }).map((_, i) => {
      return getDaysInMonth(setMonth(date, i));
    });
  }, [date, view]);

  const weekDays = useMemo(() => generateWeekdays(locale), [locale]);

  if (view !== 'year') return null;

  return (
    <div className="grid grid-cols-4 gap-10 overflow-auto h-full">
      {months.map((days, i) => (
        <div key={days[0].toString()}>
          <span className="text-xl">{i + 1}</span>

          <div className="grid grid-cols-7 gap-2 my-5">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid gap-x-0 gap-y-1 text-center grid-cols-7 text-xs tabular-nums">
            {days.map((_date) => {
              const status = getLeaveStatus(_date);
              return (
                <div
                  key={_date.toString()}
                  className={cn(
                    getMonth(_date) !== i && 'text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'aspect-square grid place-content-center size-full tabular-nums',
                      'border-t-4 border-transparent',
                      status && statusBorder[status],
                      isSameDay(today, _date) &&
                      getMonth(_date) === i &&
                      'ring-2 ring-primary'
                    )}
                  >
                    {format(_date, 'd')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const CalendarNextTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { date, setDate, view, enableHotkeys } = useCalendar();

  const next = useCallback(() => {
    if (view === 'month') {
      setDate(addMonths(date, 1));
    } else if (view === 'year') {
      setDate(addYears(date, 1));
    }
  }, [date, view, setDate]);

  useHotkeys('ArrowRight', () => next(), {
    enabled: enableHotkeys,
  });

  return (
    <Button
      size="icon"
      variant="outline"
      ref={ref}
      {...props}
      onClick={(e) => {
        next();
        onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
});
CalendarNextTrigger.displayName = 'CalendarNextTrigger';

const CalendarPrevTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { date, setDate, view, enableHotkeys } = useCalendar();

  useHotkeys('ArrowLeft', () => prev(), {
    enabled: enableHotkeys,
  });

  const prev = useCallback(() => {
    if (view === 'month') {
      setDate(subMonths(date, 1));
    } else if (view === 'year') {
      setDate(subYears(date, 1));
    }
  }, [date, view, setDate]);

  return (
    <Button
      size="icon"
      variant="outline"
      ref={ref}
      {...props}
      onClick={(e) => {
        prev();
        onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
});
CalendarPrevTrigger.displayName = 'CalendarPrevTrigger';

const CalendarTodayTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { setDate, enableHotkeys, today } = useCalendar();

  useHotkeys('t', () => jumpToToday(), {
    enabled: enableHotkeys,
  });

  const jumpToToday = useCallback(() => {
    setDate(today);
  }, [today, setDate]);

  return (
    <Button
      variant="outline"
      ref={ref}
      {...props}
      onClick={(e) => {
        jumpToToday();
        onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
});
CalendarTodayTrigger.displayName = 'CalendarTodayTrigger';

const CalendarCurrentDate = () => {
  const { date } = useCalendar();

  return (
    <time dateTime={date.toISOString()} className="tabular-nums">
      {format(date, 'MMMM yyyy')}
    </time>
  );
};

const getDaysInMonth = (date: Date) => {
  const startOfMonthDate = startOfMonth(date);
  const startOfWeekForMonth = startOfWeek(startOfMonthDate, {
    weekStartsOn: 0,
  });

  let currentDate = startOfWeekForMonth;
  const calendar = [];

  while (calendar.length < 42) {
    calendar.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return calendar;
};

const generateWeekdays = (locale: Locale) => {
  const daysOfWeek = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), i);
    daysOfWeek.push(format(date, 'EEEEEE', { locale }));
  }
  return daysOfWeek;
};

export {
  Calendar,
  CalendarCurrentDate,
  //   CalendarMonthView,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
  CalendarViewTrigger,
  CalendarYearView,
};