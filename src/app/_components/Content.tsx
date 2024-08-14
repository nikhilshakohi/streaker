import { getServerAuthSession } from "~/server/auth";
import Dashboard from "./Dashboard";

export default async function Content() {
  const session = await getServerAuthSession();
  const getGreetingBasedOnTime = (hours: number) =>
    hours < 12 ? "Morning" : hours < 18 ? "Afternoon" : "Evening";

  return (
    <main className="relative m-4 mt-24 flex justify-center text-center">
      <div className="relative flex flex-col items-center gap-4">
        <div className="greeting-wrapper">
          <div className="greeting-message animate-greeting">
            {session?.user
              ? `Good ${getGreetingBasedOnTime(new Date().getHours())}, ${session.user.name}!`
              : `Good ${getGreetingBasedOnTime(new Date().getHours())}!`}
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-bold">Welcome to Streaker</h1>

        {session?.user && (
          <>
            <Dashboard />
          </>
        )}

        {!session?.user && (
          <a href="/api/auth/signin" className="btn btn-primary btn-info">
            Get Started
          </a>
        )}
      </div>
    </main>
  );
}
