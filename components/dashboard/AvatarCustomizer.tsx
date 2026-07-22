"use client";

import { useEffect } from "react";
import ConfigurableAvatar from "./ConfigurableAvatar";
import {
  AvatarConfig,
  AVATAR_COLORS,
  ENERGY_OPTIONS,
  POSE_OPTIONS,
  HAIR_OPTIONS,
  SYMBOL_OPTIONS,
} from "@/lib/avatarOptions";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
    </h3>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-accent2 text-white shadow-soft"
          : "border border-hairline text-muted hover:border-accent hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Swatch({
  value,
  active,
  onClick,
  title,
}: {
  value: string;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
        active ? "ring-2 ring-white ring-offset-2 ring-offset-surface" : ""
      }`}
      style={{ backgroundColor: value, boxShadow: `0 0 10px ${value}80` }}
    />
  );
}

export default function AvatarCustomizer({
  open,
  onClose,
  config,
  setConfig,
}: {
  open: boolean;
  onClose: () => void;
  config: AvatarConfig;
  setConfig: (c: AvatarConfig) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (patch: Partial<AvatarConfig>) => setConfig({ ...config, ...patch });
  const toggleSymbol = (id: string) =>
    set({
      symbols: config.symbols.includes(id)
        ? config.symbols.filter((s) => s !== id)
        : [...config.symbols, id],
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-hairline bg-surface shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Personalize your figure</h2>
            <p className="text-xs text-muted">
              A quick way to make your space feel like you.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto md:flex-row">
          {/* live preview */}
          <div className="flex items-center justify-center border-b border-hairline bg-bg2/40 p-6 md:w-2/5 md:border-b-0 md:border-r">
            <div className="flex h-72 items-center justify-center">
              <ConfigurableAvatar config={config} size={120} />
            </div>
          </div>

          {/* sections */}
          <div className="flex-1 space-y-6 p-6">
            <section>
              <SectionLabel>Color &amp; glow</SectionLabel>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => set({ color: null })}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    config.color === null
                      ? "bg-accent2 text-white"
                      : "border border-hairline text-muted hover:text-ink"
                  }`}
                >
                  Theme
                </button>
                {AVATAR_COLORS.map((c) => (
                  <Swatch
                    key={c.id}
                    value={c.value}
                    title={c.label}
                    active={config.color === c.value}
                    onClick={() => set({ color: c.value })}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionLabel>Energy</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {ENERGY_OPTIONS.map((o) => (
                  <Chip
                    key={o.id}
                    active={config.energy === o.id}
                    onClick={() => set({ energy: o.id })}
                  >
                    {o.label}
                  </Chip>
                ))}
              </div>
            </section>

            <section>
              <SectionLabel>Stance</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {POSE_OPTIONS.map((o) => (
                  <Chip
                    key={o.id}
                    active={config.pose === o.id}
                    onClick={() => set({ pose: o.id })}
                  >
                    {o.label}
                  </Chip>
                ))}
              </div>
            </section>

            <section>
              <SectionLabel>Accent symbols</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {SYMBOL_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => toggleSymbol(o.id)}
                    aria-pressed={config.symbols.includes(o.id)}
                    title={o.label}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-colors ${
                      config.symbols.includes(o.id)
                        ? "bg-accent2/20 ring-1 ring-accent2"
                        : "border border-hairline hover:border-accent"
                    }`}
                  >
                    {o.char}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <SectionLabel>Hair</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {HAIR_OPTIONS.map((o) => (
                  <Chip
                    key={o.id}
                    active={config.hair === o.id}
                    onClick={() => set({ hair: o.id })}
                  >
                    {o.label}
                  </Chip>
                ))}
              </div>
              {config.hair !== "none" && (
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <span className="text-xs text-muted">Hair color:</span>
                  <button
                    type="button"
                    onClick={() => set({ hairColor: null })}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      config.hairColor === null
                        ? "bg-accent2 text-white"
                        : "border border-hairline text-muted hover:text-ink"
                    }`}
                  >
                    Match
                  </button>
                  {AVATAR_COLORS.map((c) => (
                    <Swatch
                      key={c.id}
                      value={c.value}
                      title={c.label}
                      active={config.hairColor === c.value}
                      onClick={() => set({ hairColor: c.value })}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-hairline px-5 py-3">
          <p className="text-xs text-muted">
            Preview only — saving your look comes next.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-accent2 px-5 py-2 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
