"use client";

import { api } from "~/trpc/react";

export default function StreakList() {
  const [data] = api.task.getAll.useSuspenseQuery();
  return (
    <div className="bg-base-200 w-full max-w-lg rounded-lg p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Your Tasks</h2>
      {data.length ? (
        <ul>
          {data.map((item) => (
            <li key={item.name}>{item.name}</li>
          ))}
        </ul>
      ) : (
        <span>No tasks added yet..</span>
      )}
    </div>
  );
}
