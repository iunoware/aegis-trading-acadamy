"use client";

import { useId } from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export default function Toggle({ checked, onChange, id }: ToggleProps) {
  const generatedId = useId();
  const toggleId = id ?? generatedId;

  return (
    <label
      htmlFor={toggleId}
      className="relative block h-7 w-13 shrink-0 cursor-pointer rounded-full bg-gray-300 transition-colors has-checked:bg-primary [-webkit-tap-highlight-color:transparent] dark:bg-gray-600 dark:has-checked:bg-primary"
    >
      <input
        id={toggleId}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />

      <span className="absolute inset-y-0 inset-s-0 m-1 size-5 rounded-full bg-white transition-[inset-inline-start] peer-checked:inset-s-6 dark:bg-gray-900" />
    </label>
  );
}
