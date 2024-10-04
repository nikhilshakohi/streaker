"use client";
import { api } from "~/trpc/react";
import { differenceInCalendarDays } from "date-fns";
import { useState } from "react";

// Task type without optional streak
type Task = {
  id: number;
  name: string;
  userId: string;
  startDate: string;
  endDate?: string;
};

export default function StreakList() {
  const [taskData] = api.task.getAll.useSuspenseQuery();
  const [logData] = api.log.getAll.useSuspenseQuery();
  const utils = api.useUtils();

  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null); // Loading state

  const refreshPage = async () => {
    await utils.task.getAll.invalidate();
    await utils.log.getAll.invalidate();
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

  // Edit Task
  const editTask = api.task.edit.useMutation({ onSuccess: refreshPage });
  // Delete Task
  const deleteTask = api.task.delete.useMutation({ onSuccess: refreshPage });

  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState<string>("");

  // Toggle Task (mark done/undo)
  const handleLog = (taskId: number, hasLoggedToday: boolean) => {
    setLoadingTaskId(taskId); // Set the current task to loading
    const todayDate = new Date().toISOString().split("T")[0] ?? "";
    hasLoggedToday
      ? undoLogTask.mutate({ taskId, todayDate })
      : logTask.mutate({ taskId, todayDate });
  };

  // Check if task has been logged today
  const hasLoggedToday = (task: Task): boolean => {
    const todayDate = new Date().toISOString().split("T")[0] ?? "";
    return logData?.some(
      (log) => log.taskId === task.id && log.completionDate === todayDate,
    );
  };

  // Function to calculate the maximum streak of consecutive days
  const calculateMaxStreak = (
    taskLogs: { completionDate: string }[],
  ): number => {
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

  // Handle task edit
  const handleEdit = (taskId: number) => {
    if (newTaskName.trim()) {
      editTask.mutate({ id: taskId, name: newTaskName });
      setEditTaskId(null);
      setNewTaskName("");
    }
  };

  // Handle task delete
  const handleDelete = (taskId: number) => {
    deleteTask.mutate({ id: taskId });
  };

  return (
    <div className="w-full max-w-lg rounded-lg bg-base-200 p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Your Tasks</h2>
      {taskData.length ? (
        <ul>
          {(taskData as Task[]).map((task) => {
            // Filter logs specific to the current task
            const taskLogs = logData.filter((log) => log.taskId === task.id);
            const loggedToday = hasLoggedToday(task);
            const maxStreak = calculateMaxStreak(taskLogs); // Calculate the streak

            return (
              <li key={task.id} className="mb-4">
                <div className="flex items-center justify-between">
                  {/* Left side: Task name and streak */}
                  <div className="flex flex-col">
                    {editTaskId === task.id ? (
                      <>
                        <input
                          type="text"
                          value={newTaskName}
                          onChange={(e) => setNewTaskName(e.target.value)}
                          className="input input-bordered mb-2"
                          placeholder="New task name"
                        />
                        <button
                          onClick={() => handleEdit(task.id)}
                          className="btn btn-success"
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-semibold">{task.name}</p>
                        <p className="text-left text-sm">Streak: {maxStreak}</p>
                      </>
                    )}
                  </div>

                  {/* Right side: Edit, Delete, Done/Undo buttons */}
                  <div className="flex space-x-2">
                    {editTaskId !== task.id && (
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
                      </>
                    )}
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
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <span>No tasks added yet..</span>
      )}
    </div>
  );
}
