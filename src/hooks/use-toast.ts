

"use client";

// Este archivo se deja por compatibilidad de importaciones, pero ya no se usa.
// El sistema de notificaciones se maneja ahora con `sonner`.
// La funcionalidad se ha movido a `src/components/ui/use-toast.ts`.

import * as React from "react";
import type { ToastActionElement, ToastProps } from "../components/ui/toast";

const LIMITE_TOASTS = 1;
const RETRASO_ELIMINACION = 1_000_000;

type ToastJuego = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

function generarId() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9);
}

let estadoInicial: EstadoToast = { toasts: [] };
const listeners: Array<(state: EstadoToast) => void> = [];
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function reductor(state: EstadoToast, action: AccionToast): EstadoToast {
  switch (action.type) {
    case "AGREGAR_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, LIMITE_TOASTS),
      };

    case "ACTUALIZAR_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DESCARTAR_TOAST":
      if (action.toastId) {
        agregarAColaEliminacion(action.toastId);
      } else {
        state.toasts.forEach((t) => agregarAColaEliminacion(t.id));
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };

    case "ELIMINAR_TOAST":
      return {
        ...state,
        toasts: action.toastId === undefined
          ? []
          : state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}

function dispatch(action: AccionToast) {
  estadoInicial = reductor(estadoInicial, action);
  listeners.forEach((listener) => listener(estadoInicial));
}

function agregarAColaEliminacion(toastId: string) {
  if (timeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    timeouts.delete(toastId);
    dispatch({ type: "ELIMINAR_TOAST", toastId });
  }, RETRASO_ELIMINACION);

  timeouts.set(toastId, timeout);
}

export function toast({ ...props }: Omit<ToastJuego, "id">) {
  const id = generarId();

  const actualizar = (props: Partial<ToastJuego>) =>
    dispatch({ type: "ACTUALIZAR_TOAST", toast: { ...props, id } });

  const descartar = () => dispatch({ type: "DESCARTAR_TOAST", toastId: id });

  dispatch({
    type: "AGREGAR_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => !open && descartar(),
    },
  });

  return { id, descartar, actualizar };
}

export function useToast() {
  const [state, setState] = React.useState<EstadoToast>(estadoInicial);

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
    dismiss: (toastId?: string) => dispatch({ type: "DESCARTAR_TOAST", toastId }),
  };
}

type AccionToast =
  | { type: "AGREGAR_TOAST"; toast: ToastJuego }
  | { type: "ACTUALIZAR_TOAST"; toast: Partial<ToastJuego> }
  | { type: "DESCARTAR_TOAST"; toastId?: string }
  | { type: "ELIMINAR_TOAST"; toastId?: string };

interface EstadoToast {
  toasts: ToastJuego[];
}
