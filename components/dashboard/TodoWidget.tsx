"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

type Task = {
  id: number;
  label: string;
  done: boolean;
  due_date: string | null;
  created_at: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/**
 * A personal, self-contained to-do list — add/complete/delete tasks with an
 * optional due date, persisted per-user in Supabase (supabase/tasks.sql) so
 * they survive across sessions and devices, not just this browser.
 *
 * Toggle/delete are optimistic with a TARGETED revert on failure (only the
 * one field/row that changed, never a whole-array snapshot — a snapshot
 * revert could silently undo a different update that succeeded in the
 * meantime). Add is deliberately NOT optimistic: a task's id doesn't exist
 * until the insert round-trips, and a temp-id-then-reconcile scheme isn't
 * worth the complexity for a low-frequency personal action.
 *
 * Due dates are always shown in the same neutral/muted style regardless of
 * whether they're overdue — no red, no bold, no "(overdue)" tag. This hub
 * has a standing rule against evaluative red/yellow/green treatment of the
 * user's own data (see ActivityDot); red here is reserved for an actual
 * save/load failure, same as the login/signup pages' error banner.
 */
export default function TodoWidget() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error) {
          setError("Couldn't load your tasks.");
          return;
        }
        setTasks(data ?? []);
      });
  }, [user?.id]);

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.due_date !== b.due_date) {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      }
      return a.created_at.localeCompare(b.created_at);
    });
  }, [tasks]);

  if (!user) return null;

  const toggleDone = async (task: Task) => {
    const previousDone = task.done;
    setTasks(
      (prev) =>
        prev?.map((t) => (t.id === task.id ? { ...t, done: !previousDone } : t)) ??
        null
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("tasks")
      .update({ done: !previousDone })
      .eq("id", task.id);
    if (error) {
      setError("Couldn't update that task — try again.");
      setTasks(
        (prev) =>
          prev?.map((t) => (t.id === task.id ? { ...t, done: previousDone } : t)) ??
          null
      );
    }
  };

  const deleteTask = async (task: Task) => {
    setTasks((prev) => prev?.filter((t) => t.id !== task.id) ?? null);
    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      setError("Couldn't delete that task — try again.");
      setTasks((prev) => [...(prev ?? []), task]);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;

    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .insert({ user_id: user.id, label, due_date: newDueDate || null })
      .select()
      .single();
    setSubmitting(false);

    if (error || !data) {
      setError("Couldn't add that task — try again.");
      return;
    }
    setTasks((prev) => [...(prev ?? []), data]);
    setNewLabel("");
    setNewDueDate("");
  };

  return (
    <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-hairline bg-surface/60 p-4 backdrop-blur">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
        Tasks
      </h3>

      {tasks === null ? (
        <p className="text-sm text-muted">Loading your tasks…</p>
      ) : sortedTasks.length === 0 ? (
        <p className="text-sm text-muted">No tasks yet — add one below.</p>
      ) : (
        <ul className="space-y-1.5">
          {sortedTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-bg2"
            >
              <button
                type="button"
                onClick={() => toggleDone(task)}
                aria-pressed={task.done}
                aria-label={task.done ? "Mark as not done" : "Mark as done"}
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors ${
                  task.done
                    ? "border-accent bg-accent text-white"
                    : "border-hairline text-transparent hover:border-accent"
                }`}
              >
                ✓
              </button>
              <span
                className={`flex-1 truncate text-sm ${
                  task.done ? "text-muted line-through" : "text-ink"
                }`}
              >
                {task.label}
              </span>
              {task.due_date && (
                <span className="flex-shrink-0 text-xs text-muted">
                  {dateFormatter.format(new Date(`${task.due_date}T00:00:00`))}
                </span>
              )}
              <button
                type="button"
                onClick={() => deleteTask(task)}
                aria-label="Delete task"
                className="flex-shrink-0 text-muted transition-colors hover:text-ink"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={addTask} className="mt-3 flex flex-wrap gap-2">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Add a task…"
          disabled={submitting}
          className="min-w-0 flex-1 rounded-xl border border-hairline bg-bg2/70 px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60"
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          disabled={submitting}
          className="rounded-xl border border-hairline bg-bg2/70 px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={submitting || !newLabel.trim()}
          className="rounded-xl bg-accent2 px-4 py-1.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {submitting ? "Adding…" : "Add"}
        </button>
      </form>
    </div>
  );
}
