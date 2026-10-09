// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect } from "react";

// A toast with an action stays longer, so that there is time to use it.
const displayDuration = 4000;
const displayDurationWithAction = 8000;

export type ToastAction = Readonly<{
  label: string;
  onAction: () => void;
}>;

export type Meldung = Readonly<{ message: string; action?: ToastAction }>;

// Reads a message that a page passes with the navigation, like
// navigate(path, { state: { meldung } }).
export function meldungAus(state: unknown): Meldung | undefined {
  if (typeof state === "object" && state !== null && "meldung" in state && typeof state.meldung === "string") {
    return { message: state.meldung };
  }
  return undefined;
}

// Confirms that an action succeeded. It appears at the bottom center, where it
// does not cover the buttons at the end of a form. The message hides by itself
// after a few seconds; screen readers announce it as a status. An optional
// action like "Rückgängig" refers to what was just done.
export function Toast({ message, action, onClose }: { message: string; action?: ToastAction; onClose: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(onClose, action === undefined ? displayDuration : displayDurationWithAction);
    return () => clearTimeout(timeout);
  }, [message, action, onClose]);

  return (
    <div className="toast-container position-fixed bottom-0 start-50 translate-middle-x p-3">
      <div className="toast show align-items-center" role="status">
        <div className="d-flex">
          <div className="toast-body">
            <i className="fa-solid fa-circle-check text-success me-2" aria-hidden="true"></i>
            {message}
          </div>
          {action !== undefined && (
            <button
              type="button"
              className="btn btn-link btn-sm me-1"
              onClick={() => {
                onClose();
                action.onAction();
              }}
            >
              {action.label}
            </button>
          )}
          <button type="button" className="btn-close me-2 m-auto" aria-label="Schließen" onClick={onClose}></button>
        </div>
      </div>
    </div>
  );
}
