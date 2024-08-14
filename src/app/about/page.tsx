import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import Footer from "../_components/Footer";
import Header from "../_components/Header";

export default async function About() {
  const session = await getServerAuthSession();

  return (
    <HydrateClient>
      <Header session={session} />
      <main className="relative m-auto mt-8 w-3/4 text-center">
        <div className="container mx-auto px-4 pt-16 text-center">
          <h1 className="mb-4 text-4xl font-bold">About Streakify</h1>

          <p className="mb-12 text-lg text-gray-500">
            Streakify is your daily habit tracking app that helps you stay
            committed to your goals. Create, track, and maintain streaks for
            your daily activities effortlessly. With reminders, detailed stats,
            and a supportive community, achieve your objectives one day at a
            time.
          </p>
        </div>
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg p-6 shadow-md">
            <div className="mb-4 text-blue-500">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 20h9M12 4h9M4 12h9M4 20h0M4 4h0"
                ></path>
              </svg>
            </div>
            <h2 className="mb-4 text-xl font-semibold">Track Your Habits</h2>
            <p className="text-gray-600">
              Monitor your daily activities and stay committed to your goals.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-lg p-6 shadow-md">
            <div className="mb-4 text-green-500">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12l5 5L20 7"
                ></path>
              </svg>
            </div>
            <h2 className="mb-4 text-xl font-semibold">Set Reminders</h2>
            <p className="text-gray-600">
              Receive timely reminders to keep you on track with your habits.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-lg p-6 shadow-md">
            <div className="mb-4 text-yellow-500">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16M4 12h16"
                ></path>
              </svg>
            </div>
            <h2 className="mb-4 text-xl font-semibold">View Detailed Stats</h2>
            <p className="text-gray-600">
              Analyze your progress with detailed statistics and insights.
            </p>
          </div>
        </div>

        {!session?.user && (
          <>
            <h3 className="mb-4 text-xl">
              Login to Streakify now and start building better habits today!
            </h3>
            <a href="/api/auth/signin" className="btn btn-primary btn-info">
              Get Started
            </a>
          </>
        )}
      </main>
      <Footer />
    </HydrateClient>
  );
}
