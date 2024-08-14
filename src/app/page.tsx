import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import Footer from "./_components/Footer";
import Header from "./_components/Header";
import Dashboard from "./_components/Dashboard";

export default async function Home() {
  const session = await getServerAuthSession();
  const getGreetingBasedOnTime = (hours: number) =>
    hours < 12 ? "Morning" : hours < 18 ? "Afternoon" : "Evening";

  return (
    <HydrateClient>
      <Header session={session} />
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
          <Dashboard />

          {!session?.user && (
            <a href="/api/auth/signin" className="btn btn-primary btn-info">
              Get Started
            </a>
          )}
        </div>
      </main>
      <Footer />
    </HydrateClient>
  );
}
