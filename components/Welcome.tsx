"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Wordmark from "@/components/Wordmark";

const WORDS = [
  "wellbeing",
  "kindness",
  "confidence",
  "hope",
  "creativity",
  "connection",
];

export default function Welcome() {
  const [greeting, setGreeting] = useState("Welcome");
  const [wordIndex, setWordIndex] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Time-of-day greeting (client-only to avoid hydration mismatch)
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"
    );
  }, []);

  // Rotating inspiring word
  useEffect(() => {
    const id = setInterval(
      () => setWordIndex((i) => (i + 1) % WORDS.length),
      2200
    );
    return () => clearInterval(id);
  }, []);

  // Gentle mouse-parallax on the decorative shapes
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: MouseEvent) => {
      setOffset({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className="relative flex min-h-[calc(100vh-9rem)] items-center justify-center overflow-hidden px-4 py-16">
      {/* parallax shapes */}
      <div
        className="pointer-events-none absolute -left-12 top-8 h-64 w-64 rounded-full bg-accent2/25 blur-3xl transition-transform duration-300 ease-out"
        style={{ transform: `translate(${offset.x * 22}px, ${offset.y * 22}px)` }}
      />
      <div
        className="pointer-events-none absolute -right-8 top-1/3 h-72 w-72 rounded-full bg-glow/20 blur-3xl transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${offset.x * -30}px, ${offset.y * -30}px)`,
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent/20 blur-3xl transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${offset.x * 26}px, ${offset.y * -18}px)`,
        }}
      />

      <div className="relative z-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          {greeting}
        </p>

        <h1 className="mt-5 text-4xl leading-[1.05] sm:text-6xl">
          <Wordmark />
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          A warm little home for the apps our interns build — to nurture{" "}
          <span
            key={wordIndex}
            className="inline-block animate-fade-up font-semibold text-accent"
          >
            {WORDS[wordIndex]}
          </span>{" "}
          across our community.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/apps"
            className="group rounded-full bg-accent2 px-7 py-3 text-base font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 hover:brightness-110"
          >
            Explore the Apps{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-hairline bg-surface/60 px-7 py-3 text-base font-semibold text-ink backdrop-blur transition-colors hover:border-accent"
          >
            About us
          </Link>
        </div>
      </div>
    </section>
  );
}
