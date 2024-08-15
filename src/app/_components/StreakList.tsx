"use client";
import { api } from "~/trpc/react";

// Task type with optional logs
type Task = {
  id: number;
  name: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  streak?: number;
};

export default function StreakList() {
  const [taskData] = api.task.getAll.useSuspenseQuery();
  const [logData] = api.log.getAll.useSuspenseQuery();
  const utils = api.useUtils();

  const logTask = api.log.create.useMutation({
    onSuccess: async () => {
      await utils.task.getAll.invalidate();
      await utils.log.getAll.invalidate();
    },
  });

  const undoLogTask = api.log.delete.useMutation({
    onSuccess: async () => {
      await utils.task.getAll.invalidate();
      await utils.log.getAll.invalidate();
    },
  });

  const handleLog = (taskId: number, hasLoggedToday: boolean) => {
    hasLoggedToday
      ? undoLogTask.mutate({ taskId })
      : logTask.mutate({ taskId });
  };

  const hasLoggedToday = (task: Task): boolean => {
    const today = new Date().toDateString();
    return logData.some(
      (log) =>
        log.taskId === task.id && log.completionDate.toDateString() === today,
    );
  };

  return (
    <div className="w-full max-w-lg rounded-lg bg-base-200 p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Your Tasks</h2>
      {taskData.length ? (
        <ul>
          {(taskData as Task[]).map((task) => {
            const loggedToday = hasLoggedToday(task);
            return (
              <li key={task.id} className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{task.name}</p>
                    <p className="text-sm">Streak: {task.streak ?? 0}</p>
                  </div>
                  <button
                    onClick={() => handleLog(task.id, loggedToday)}
                    className={`btn ${
                      loggedToday ? "btn-secondary" : "btn-primary"
                    }`}
                  >
                    {loggedToday ? "Undo Today" : "Done Today"}
                  </button>
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
