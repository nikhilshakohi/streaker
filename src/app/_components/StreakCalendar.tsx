"use client";
import { api } from "~/trpc/react";
import React, { useState } from "react";
import {
  eachDayOfInterval,
  format,
  startOfYear,
  endOfYear,
  getMonth,
  differenceInCalendarDays,
} from "date-fns";
import "../styles/streak.css";

// Task type with optional logs
type Task = {
  id: number;
  name: string;
  userId: string;
  startDate: string;
  endDate?: string;
  streak?: number;
};

// Component for rendering a single streak box
const StreakBox: React.FC<{ date: string; isPresent: boolean }> = ({
  date,
  isPresent,
}) => (
  <div
    className={`streak-box ${isPresent ? "bg-green" : "bg-light"}`}
    title={`Date: ${date}`}
  />
);

// Helper to get month name
const getMonthName = (monthIndex: number) =>
  format(new Date(2024, monthIndex, 1), "MMMM");

// Function to calculate the maximum streak of consecutive days
const calculateMaxStreak = (taskLogs: { completionDate: string }[]): number => {
  if (taskLogs.length === 0) return 0;

  // Sort taskLogs by completionDate
  const sortedLogs = taskLogs
    .map((log) => new Date(log.completionDate))
    .sort((a, b) => a.getTime() - b.getTime());

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedLogs.length; i++) {
    // Calculate the difference in days between consecutive dates
    const dayDiff = differenceInCalendarDays(
      sortedLogs[i] ?? "",
      sortedLogs[i - 1] ?? "",
    );

    if (dayDiff === 1) {
      // Consecutive day found
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      // Streak breaks, reset currentStreak
      currentStreak = 1;
    }
  }

  return maxStreak;
};

// Component for rendering streak calendar
const StreakCalendar: React.FC = () => {
  const [taskData] = api.task.getAll.useSuspenseQuery();
  const [logData] = api.log.getAll.useSuspenseQuery();
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null); // Track loading state per task
  const allDays = eachDayOfInterval({
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  });

  const daysByMonth = allDays.reduce<Record<number, Date[]>>((acc, day) => {
    const month = getMonth(day);
    (acc[month] = acc[month] ?? []).push(day);
    return acc;
  }, {});

  // Handle log toggle for marking a task as done or undoing
  const toggleLogTask = (taskId: number, hasLoggedToday: boolean) => {
    setLoadingTaskId(taskId); // Start loading state
    const logTask = api.log.create.useMutation({
      onSuccess: () => setLoadingTaskId(null),
    });
    const undoLogTask = api.log.delete.useMutation({
      onSuccess: () => setLoadingTaskId(null),
    });

    const todayDate = new Date().toISOString().split("T")[0];
    if (hasLoggedToday) {
      undoLogTask.mutate({ taskId, todayDate: todayDate ?? "" });
    } else {
      logTask.mutate({ taskId, todayDate: todayDate ?? "" });
    }
  };

  return (
    <div className="streak-wrapper w-full rounded-lg bg-base-200 p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-bold">Task Calendar</h2>{" "}
      {/* Overall heading */}
      {(taskData as Task[]).map((task) => {
        // Filter logs specific to the current task
        const taskLogs = logData.filter((log) => log.taskId === task.id);
        const completionSet = new Set(
          taskLogs.map((log) => log.completionDate),
        ); // Create a Set for quick lookup

        // Calculate the max streak for this task
        const maxStreak = calculateMaxStreak(taskLogs);

        return (
          <div key={task.id}>
            <h3 className="mb-2 text-xl font-semibold">
              {task.name} (Streak: {maxStreak})
            </h3>{" "}
            {/* Task-specific heading with streak */}
            <div className="streak-calendar">
              {Object.keys(daysByMonth).map((monthIndex) => (
                <div key={monthIndex} className="month-row">
                  <div className="streak-grid">
                    {daysByMonth[parseInt(monthIndex)]?.map((day) => (
                      <StreakBox
                        key={day.toString()}
                        date={format(day, "yyyy-MM-dd")}
                        isPresent={completionSet.has(format(day, "yyyy-MM-dd"))}
                      />
                    ))}
                  </div>
                  <div className="month-label">
                    {getMonthName(parseInt(monthIndex))}
                  </div>
                </div>
              ))}
            </div>
            {/* Add buttons for done/undo with loader */}
            <button
              onClick={() =>
                toggleLogTask(
                  task.id,
                  completionSet.has(
                    new Date().toISOString().split("T")[0] ?? "",
                  ),
                )
              }
              className="btn btn-primary"
              disabled={loadingTaskId === task.id}
            >
              {loadingTaskId === task.id ? (
                <span className="loader"></span> // Show loader
              ) : completionSet.has(
                  new Date().toISOString().split("T")[0] ?? "",
                ) ? (
                "Undo"
              ) : (
                "Mark as Done"
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default StreakCalendar;
