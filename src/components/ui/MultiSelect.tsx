"use client";

import {
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface MultiSelectProps {
  id: string;
  label: string;
  options: readonly string[];
  emptyOptionLabel: string;
  value: string[];
  onValueChange: (value: string[]) => void;
}

function getSelectedLabel(value: string[], emptyOptionLabel: string): string {
  if (value.length === 0) {
    return emptyOptionLabel;
  }

  if (value.length === 1) {
    return value[0];
  }

  return `已選 ${value.length} 個`;
}

export function MultiSelect({
  id,
  label,
  options,
  emptyOptionLabel,
  value,
  onValueChange,
}: MultiSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = getSelectedLabel(value, emptyOptionLabel);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      const target = event.target;

      if (
        containerRef.current &&
        target instanceof Node &&
        !containerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, []);

  function focusOption(position: "first" | "last") {
    requestAnimationFrame(() => {
      const options = getFocusableOptions();
      const targetIndex = position === "first" ? 0 : options.length - 1;

      options[targetIndex]?.focus();
    });
  }

  function getFocusableOptions(): HTMLElement[] {
    return Array.from(
      optionsRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled)',
      ) ?? [],
    );
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    setIsOpen(true);
    focusOption(event.key === "ArrowDown" ? "first" : "last");
  }

  function handleOptionsKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (
      !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
    ) {
      return;
    }

    const options = getFocusableOptions();
    const currentIndex = options.indexOf(document.activeElement as HTMLElement);

    if (currentIndex === -1) {
      return;
    }

    event.preventDefault();

    if (event.key === "Home") {
      options[0]?.focus();
      return;
    }

    if (event.key === "End") {
      options.at(-1)?.focus();
      return;
    }

    const offset = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (currentIndex + offset + options.length) % options.length;
    options[nextIndex]?.focus();
  }

  function toggleOption(option: string) {
    const nextValue = value.includes(option)
      ? value.filter((selectedOption) => selectedOption !== option)
      : [...value, option];

    onValueChange(nextValue);
  }

  function handleContainerBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false);
    }
  }

  return (
    <div className="space-y-2">
      <span
        id={`${id}-label`}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </span>
      <div
        ref={containerRef}
        id={id}
        className="relative"
        onBlur={handleContainerBlur}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-labelledby={`${id}-label`}
          aria-expanded={isOpen}
          aria-controls={`${id}-options`}
          className="flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-control-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors duration-200 hover:bg-surface-elevated focus-visible:border-focus-ring focus-visible:ring-3 focus-visible:ring-focus-ring/30"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className={value.length === 0 ? "text-muted" : undefined}>
            {selectedLabel}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 text-muted transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>

        <div
          ref={optionsRef}
          id={`${id}-options`}
          role="group"
          aria-labelledby={`${id}-label`}
          aria-hidden={!isOpen}
          inert={!isOpen}
          onKeyDown={handleOptionsKeyDown}
          className={cn(
            "absolute z-50 mt-1 max-h-64 w-full origin-top overflow-y-auto rounded-md border border-control-border bg-surface p-1 text-foreground shadow-lg transition-[opacity,transform,visibility] duration-200 ease-out",
            isOpen
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible -translate-y-2 scale-95 opacity-0",
          )}
        >
          <button
            type="button"
            aria-pressed={value.length === 0}
            onClick={() => onValueChange([])}
            className="flex w-full cursor-pointer items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors duration-200 hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring"
          >
            <span
              aria-hidden="true"
              className="flex size-4 items-center justify-center rounded-sm border border-border text-primary"
            >
              {value.length === 0 && (
                <Check aria-hidden="true" className="size-3" />
              )}
            </span>
            {emptyOptionLabel}
          </button>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="checkbox"
              aria-checked={value.includes(option)}
              onClick={() => toggleOption(option)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors duration-200 hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring"
            >
              <span
                aria-hidden="true"
                className="flex size-4 items-center justify-center rounded-sm border border-border text-primary"
              >
                {value.includes(option) && (
                  <Check aria-hidden="true" className="size-3" />
                )}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
