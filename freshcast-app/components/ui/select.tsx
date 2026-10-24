"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  hint?: string; // secondary text on the right, e.g. distance
}

interface Props<T extends string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  label: string; // accessible name
  icon?: React.ReactNode;
  className?: string;
}

// In-app dropdown (listbox pattern). Replaces the native OS menu so it matches
// the rest of the UI. Keyboard: arrows to move, Enter to pick, Esc to close.
export function Select<T extends string>({ value, options, onChange, label, icon, className }: Props<T>) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  function openMenu() {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") setActive((a) => Math.min(options.length - 1, a + 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
    else if (e.key === "Enter" || e.key === " ") {
      onChange(options[active].value);
      setOpen(false);
    } else return;
    e.preventDefault();
  }

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${current.label}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKey}
        className={cn(
          "flex w-full items-center gap-2 rounded-md border bg-canvas px-3 py-1.5 text-left text-xs transition-colors duration-150",
          open ? "border-good" : "border-border hover:border-text-muted"
        )}
      >
        {icon}
        <span className="flex-1 truncate text-text-primary">{current.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-text-muted transition-transform duration-150", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-40 mt-1 min-w-[220px] overflow-hidden rounded-lg border border-border bg-surface p-1"
          >
            {options.map((o, i) => {
              const selected = o.value === value;
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-xs",
                    i === active ? "bg-surface-hover text-text-primary" : "text-text-secondary"
                  )}
                >
                  <Check className={cn("h-3.5 w-3.5 shrink-0 text-good", !selected && "invisible")} />
                  <span className="flex-1">{o.label}</span>
                  {o.hint && <span className="text-[11px] text-text-muted">{o.hint}</span>}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
