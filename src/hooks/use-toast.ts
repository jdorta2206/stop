

"use client";

// This file is kept for import compatibility but is no longer used.
// The notification system is now handled by `sonner`.
// The functionality has been moved to `src/components/ui/use-toast.ts`.

import * as React from "react";
import type { ToastActionElement, ToastProps } from "../components/ui/toast";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1_000_000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

function genId() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9);
}

let memoryState: ToastState = { toasts: [] };
const listeners: Array<(state: ToastState) => void> = [];
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function reducer(state: ToastState, action: Action): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST":
      if (action.toastId) {
        addToRemoveQueue(action.toastId);
      } else {
        state.toasts.forEach((t) => addToRemoveQueue(t.id));
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: action.toastId === undefined
          ? []
          : state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

function addToRemoveQueue(toastId: string) {
  if (timeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    timeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);

  timeouts.set(toastId, timeout);
}

export function toast({ ...props }: Omit<ToasterToast, "id">) {
  const id = genId();

  const update = (props: Partial<ToasterToast>) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => !open && dismiss(),
    },
  });

  return { id, dismiss, update };
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

interface ToastState {
  toasts: ToasterToast[];
}
