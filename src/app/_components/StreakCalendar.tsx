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

  const sortedLogs = taskLogs
    .map((log) => new Date(log.completionDate))
    .sort((a, b) => a.getTime() - b.getTime());

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedLogs.length; i++) {
    const dayDiff = differenceInCalendarDays(
      sortedLogs[i] ?? "",
      sortedLogs[i - 1] ?? "",
    );

    if (dayDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
};

// Component for rendering streak calendar
const StreakCalendar: React.FC = () => {
  const [taskData] = api.task.getAll.useSuspenseQuery();
  const [logData] = api.log.getAll.useSuspenseQuery();
  const allDays = eachDayOfInterval({
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  });
  const utils = api.useUtils();

  const daysByMonth = allDays.reduce<Record<number, Date[]>>((acc, day) => {
    const month = getMonth(day);
    (acc[month] = acc[month] ?? []).push(day);
    return acc;
  }, {});

  const refreshPage = async () => {
    await utils.task.getAll.invalidate();
    await utils.log.getAll.invalidate();
  };
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState<string>("");
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null); // Loading state

  // Edit Task
  const editTask = api.task.edit.useMutation({ onSuccess: refreshPage });
  // Delete Task
  const deleteTask = api.task.delete.useMutation({ onSuccess: refreshPage });

  // Handler for editing a task
  const handleEdit = (taskId: number) => {
    if (newTaskName.trim()) {
      editTask.mutate({ id: taskId, name: newTaskName });
      console.log(`Editing task ${taskId} to ${newTaskName}`);
      setEditTaskId(null);
      setNewTaskName("");
    }
  };
  // Check if task has been logged today
  const hasLoggedToday = (task: Task): boolean => {
    const todayDate = new Date().toISOString().split("T")[0] ?? "";
    return logData?.some(
      (log) => log.taskId === task.id && log.completionDate === todayDate,
    );
  };

  // Handler for deleting a task
  const handleDelete = (taskId: number) => {
    // Call your API to delete the task
    deleteTask.mutate({ id: taskId });
    console.log(`Deleting task ${taskId}`);
  };
  // Log Task Completion
  const logTask = api.log.create.useMutation({
    onSuccess: async () => {
      await refreshPage();
      setLoadingTaskId(null);
    },
  });

  // Undo Task Completion
  const undoLogTask = api.log.delete.useMutation({
    onSuccess: async () => {
      await refreshPage();
      setLoadingTaskId(null);
    },
  });
  // Handler for logging (mark done/undo) a task
  const handleLog = (taskId: number, hasLoggedToday: boolean) => {
    setLoadingTaskId(taskId); // Set the current task to loading
    const todayDate = new Date().toISOString().split("T")[0] ?? "";
    hasLoggedToday
      ? undoLogTask.mutate({ taskId, todayDate })
      : logTask.mutate({ taskId, todayDate });
  };

  return (
    <div className="streak-wrapper w-full rounded-lg bg-base-200 p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-bold">Task Calendar</h2>
      {(taskData as Task[]).map((task) => {
        const taskLogs = logData.filter((log) => log.taskId === task.id);
        const maxStreak = calculateMaxStreak(taskLogs);
        const loggedToday = hasLoggedToday(task);

        return (
          <div key={task.id}>
            <h3 className="mb-2 flex items-center justify-between text-xl font-semibold">
              <span>
                {editTaskId === task.id ? (
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="input input-bordered mb-2"
                    placeholder="New task name"
                  />
                ) : (
                  <span>
                    {task.name} (Streak: {maxStreak})
                  </span>
                )}
              </span>
              <div className="flex space-x-2">
                {editTaskId !== task.id ? (
                  <>
                    <button
                      onClick={() => {
                        setEditTaskId(task.id);
                        setNewTaskName(task.name);
                      }}
                      className="btn btn-info"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="btn btn-error"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleLog(task.id, loggedToday)}
                      className={`btn ${
                        loggedToday ? "btn-secondary" : "btn-primary"
                      }`}
                      disabled={loadingTaskId === task.id} // Disable button while loading
                    >
                      {loadingTaskId === task.id ? (
                        <span className="loader"></span> // Show loader
                      ) : loggedToday ? (
                        "UNDO"
                      ) : (
                        "DONE"
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit(task.id)}
                    className="btn btn-success"
                  >
                    Save
                  </button>
                )}
              </div>
            </h3>
            <div className="streak-calendar">
              {Object.keys(daysByMonth).map((monthIndex) => (
                <div key={monthIndex} className="month-row">
                  <div className="streak-grid">
                    {daysByMonth[parseInt(monthIndex)]?.map((day) => (
                      <StreakBox
                        key={day.toString()}
                        date={format(day, "yyyy-MM-dd")}
                        isPresent={taskLogs.some(
                          (log) =>
                            log.completionDate === format(day, "yyyy-MM-dd"),
                        )}
                      />
                    ))}
                  </div>
                  <div className="month-label">
                    {getMonthName(parseInt(monthIndex))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StreakCalendar;
