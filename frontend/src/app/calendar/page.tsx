"use client";

import { useState, useEffect } from "react";
import AuthLayout from "../components/AuthLayout";
import Cookies from "js-cookie";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

interface Sprint {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  projectId: string;
  projectName: string;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
            "http://localhost:4000/graphql",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
            body: JSON.stringify({
              query: `
              query {
                activeSprints {
                  _id
                  name
                  startDate
                  endDate
                  project {
                    name
                  }
                }
              }
            `,
            }),
          }
        );

        const { data, errors } = await response.json();
        if (errors) throw new Error(errors[0].message);

        setSprints(
          data.activeSprints.map((sprint: any) => ({
            _id: sprint._id,
            name: sprint.name,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            projectName: sprint.project?.name || "Unknown Project",
          }))
        );
      } catch (error) {
        setError("Failed to fetch sprints");
        console.error("Failed to fetch sprints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSprints();
  }, []);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const renderCalendarHeader = () => {
    return (
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold text-gray-800'>
          {format(currentMonth, "MMMM yyyy")}
        </h1>
        <div className='flex space-x-2'>
          <button
            onClick={prevMonth}
            className='p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors'
          >
            &lt; Prev
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className='p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors'
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className='p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors'
          >
            Next &gt;
          </button>
        </div>
      </div>
    );
  };

  const renderCalendarDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className='grid grid-cols-7 gap-1 mb-1'>
        {days.map((day) => (
          <div
            key={day}
            className='text-center py-2 font-medium text-gray-500 bg-gray-100'
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCalendarCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);

    const dateFormat = "d";

    let days = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    // Add days from previous month to start on Sunday
    const firstDayOfMonth = startDate.getDay();
    if (firstDayOfMonth > 0) {
      const prevMonthDays: Date[] = [];
      for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() - (i + 1));
        prevMonthDays.push(day);
      }
      days = [...prevMonthDays, ...days];
    }

    // Add days from next month to end on Saturday
    const lastDayOfMonth = endDate.getDay();
    if (lastDayOfMonth < 6) {
      const nextMonthDays: Date[] = [];
      for (let i = 1; i <= 6 - lastDayOfMonth; i++) {
        const day = new Date(endDate);
        day.setDate(endDate.getDate() + i);
        nextMonthDays.push(day);
      }
      days = [...days, ...nextMonthDays];
    }

    // Split days into weeks
    const weeks: Date[][] = [];
    let week: Date[] = [];

    days.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });

    return (
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className='grid grid-cols-7 border-b last:border-b-0'
          >
            {week.map((day: Date, dayIndex: number) => {
              const formattedDate = format(day, dateFormat);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              // Find sprints that include this day
              const dayStr = format(day, "yyyy-MM-dd");
              const daySprints = sprints.filter((sprint) => {
                const start = new Date(sprint.startDate);
                const end = new Date(sprint.endDate);
                const current = new Date(dayStr);
                return current >= start && current <= end;
              });

              return (
                <div
                  key={dayIndex}
                  className={`min-h-[100px] p-2 border-r last:border-r-0 ${
                    !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                  } ${isToday ? "bg-blue-50" : ""}`}
                >
                  <div className='text-right'>
                    <span
                      className={`inline-block w-6 h-6 text-center rounded-full ${
                        isToday ? "bg-blue-500 text-white" : ""
                      }`}
                    >
                      {formattedDate}
                    </span>
                  </div>

                  <div className='mt-1 space-y-1 max-h-[80px] overflow-y-auto'>
                    {daySprints.map((sprint) => (
                      <div
                        key={sprint._id}
                        className='text-xs p-1 rounded bg-green-100 text-green-800 truncate'
                        title={`${sprint.name} (${sprint.projectName})`}
                      >
                        {sprint.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <AuthLayout>
      <div className='space-y-6'>
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>
            Sprint Calendar
          </h1>
          <p className='text-gray-600'>
            View all your active sprints across projects
          </p>
        </div>

        {error && (
          <div className='bg-red-100 text-red-800 p-4 rounded-lg'>{error}</div>
        )}

        {loading ? (
          <div className='flex justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        ) : (
          <div className='bg-white p-6 rounded-lg shadow-md'>
            {renderCalendarHeader()}
            {renderCalendarDays()}
            {renderCalendarCells()}
          </div>
        )}

        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h2 className='text-xl font-bold text-gray-800 mb-4'>
            All Active Sprints
          </h2>

          <div className='space-y-4'>
            {sprints.map((sprint) => (
              <div
                key={sprint._id}
                className='border-l-4 border-green-500 bg-white p-4 shadow rounded-lg'
              >
                <h3 className='font-medium text-lg'>{sprint.name}</h3>
                <p className='text-gray-500 text-sm'>{sprint.projectName}</p>
                <div className='flex justify-between mt-2 text-sm'>
                  <span>
                    Start: {format(new Date(sprint.startDate), "MMM d, yyyy")}
                  </span>
                  <span>
                    End: {format(new Date(sprint.endDate), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
