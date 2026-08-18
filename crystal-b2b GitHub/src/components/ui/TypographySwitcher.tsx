"use client";

import { useEffect, useState } from "react";

const modes = [
  { id: "calm", short: "A", label: "Тихая", description: "Спокойная Apple‑шкала" },
  { id: "balanced", short: "B", label: "Баланс", description: "Средний контраст" },
  { id: "editorial", short: "C", label: "Акцент", description: "Более редакционная шкала" },
] as const;

type TypographyMode = (typeof modes)[number]["id"];

const storageKey = "crystal-cube-typography";

function isTypographyMode(value: string | null): value is TypographyMode {
  return modes.some((mode) => mode.id === value);
}

function applyMode(mode: TypographyMode) {
  document.documentElement.dataset.typography = mode;
}

export function TypographySwitcher() {
  const [mode, setMode] = useState<TypographyMode>("calm");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(storageKey);
    } catch {
      // A blocked storage API should not prevent the visual preference from working.
    }
    const initialMode = isTypographyMode(stored) ? stored : "calm";
    const frame = window.requestAnimationFrame(() => {
      setMode(initialMode);
      applyMode(initialMode);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const selectMode = (nextMode: TypographyMode) => {
    setMode(nextMode);
    applyMode(nextMode);
    try {
      window.localStorage.setItem(storageKey, nextMode);
    } catch {
      // The current page still receives the selected mode without persistence.
    }
  };

  return (
    <aside className="typography-switcher" aria-label="Вариант типографики">
      <span className="typography-switcher-label">ТИП</span>
      <div role="group" aria-label="Выберите типографическую шкалу">
        {modes.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={mode === option.id}
            aria-label={`${option.label}: ${option.description}`}
            title={`${option.label} - ${option.description}`}
            onClick={() => selectMode(option.id)}
          >
            <b>{option.short}</b>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
