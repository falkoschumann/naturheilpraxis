// Copyright (c) 2026 Falko Schumann. MIT license.

import type { ReactNode } from "react";

import { Dialog } from "./dialog.tsx";

// Asks before an action that is destructive or has consequences. The confirming button names the action.
export function ConfirmDialog({
  title,
  confirmLabel,
  variant = "danger",
  onConfirm,
  onCancel,
  children,
}: {
  title: string;
  confirmLabel: string;
  // Only destructive actions are confirmed with a red button.
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog title={title} onClose={onCancel}>
      <div className="modal-body">{children}</div>
      <div className="modal-footer">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="button" className={`btn btn-${variant}`} data-autofocus onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
