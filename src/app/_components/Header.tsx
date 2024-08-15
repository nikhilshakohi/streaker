"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaSun, FaMoon } from "react-icons/fa";
import type { Session } from "next-auth";

interface HeaderProps {
  session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <header className="fixed top-0 z-10 flex w-full items-center justify-between bg-base-200 p-4">
      <Link href="/" className="text-2xl font-bold">
        Streaker
      </Link>
      <nav className="flex items-center gap-4">
        <button onClick={toggleTheme} className="btn btn-ghost">
          {theme === "light" ? (
            <FaMoon className="h-6 w-6" />
          ) : (
            <FaSun className="h-6 w-6" />
          )}
        </button>
        <Link href="/about" className="btn btn-ghost">
          About
        </Link>
        <Link
          href={!session?.user ? "/api/auth/signin" : "/api/auth/signout"}
          className="btn btn-ghost"
        >
          {session?.user ? "Sign Out" : "Sign In"}
        </Link>
      </nav>
    </header>
  );
}
