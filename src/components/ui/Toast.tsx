"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { CircleCheck, CircleX, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

interface ToastOptions {
  title: string;
  description?: string;
  variant: ToastVariant;
  /** Set to 0 to keep the toast visible until it is dismissed. */
  duration?: number;
}

interface ToastMessage extends ToastOptions {
  id: number;
}

interface ToastProps extends ToastOptions {
  className?: string;
  onDismiss: () => void;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => number;
  dismissToast: (id: number) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const DEFAULT_TOAST_DURATION = 5_000;
const MAX_VISIBLE_TOASTS = 3;
const ToastContext = createContext<ToastContextValue | null>(null);

function isSameToast(
  currentToast: ToastMessage,
  nextToast: ToastOptions,
): boolean {
  return (
    currentToast.title === nextToast.title &&
    currentToast.description === nextToast.description &&
    currentToast.variant === nextToast.variant
  );
}

function Toast({
  title,
  description,
  variant,
  duration = DEFAULT_TOAST_DURATION,
  className,
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    if (duration <= 0) {
      return;
    }

    const timeoutId = setTimeout(onDismiss, duration);

    return () => clearTimeout(timeoutId);
  }, [duration, onDismiss]);

  const isError = variant === "error";
  const Icon = isError ? CircleX : CircleCheck;

  return (
    <li
      data-slot="toast"
      data-variant={variant}
      role={isError ? "alert" : "status"}
      aria-atomic="true"
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-toast-border bg-toast-background p-4 text-toast-foreground shadow-[0_16px_40px_rgb(15_23_42/0.28)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-200",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isError
            ? "bg-toast-destructive-soft text-toast-destructive"
            : "bg-toast-success-soft text-toast-success",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-5 text-toast-muted">
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-toast-muted transition-colors hover:bg-toast-control-hover hover:text-toast-foreground focus-visible:ring-3 focus-visible:ring-toast-focus-ring/40 focus-visible:outline-none"
        aria-label="關閉通知"
        onClick={onDismiss}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </li>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  const handleDismiss = useCallback(
    () => onDismiss(toast.id),
    [onDismiss, toast.id],
  );

  return <Toast {...toast} onDismiss={handleDismiss} />;
}

function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextToastId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    nextToastId.current += 1;
    const id = nextToastId.current;

    setToasts((currentToasts) => {
      const uniqueToasts = currentToasts.filter(
        (toast) => !isSameToast(toast, options),
      );

      return [...uniqueToasts, { id, ...options }].slice(-MAX_VISIBLE_TOASTS);
    });

    return id;
  }, []);

  const contextValue = useMemo(
    () => ({ dismissToast, showToast }),
    [dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ol
        data-slot="toast-viewport"
        aria-label="通知"
        className="pointer-events-none fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-60 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:left-6"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </ol>
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast 必須在 ToastProvider 內使用");
  }

  return context;
}

export { ToastProvider, useToast };
