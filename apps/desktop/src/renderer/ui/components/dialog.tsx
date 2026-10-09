// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect, useId, useRef, type ReactNode } from "react";

// A modal dialog in the style of Bootstrap. The native dialog element keeps the
// focus inside, closes with Escape and returns the focus when it closes. The
// dialog is open while it is rendered.
export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="app-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        // The parent decides when the dialog closes by not rendering it.
        event.preventDefault();
        onClose();
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id={titleId} className="modal-title fs-5">
            {title}
          </h2>
          <button type="button" className="btn-close" aria-label="Schließen" onClick={onClose}></button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
