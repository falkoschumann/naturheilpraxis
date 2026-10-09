// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect } from "react";

const displayDuration = 4000;

// Confirms that an action succeeded. The message hides by itself after a few
// seconds; screen readers announce it as a status.
export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(onClose, displayDuration);
    return () => clearTimeout(timeout);
  }, [message, onClose]);

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      <div className="toast show align-items-center" role="status">
        <div className="d-flex">
          <div className="toast-body">
            <i className="fa-solid fa-circle-check text-success me-2" aria-hidden="true"></i>
            {message}
          </div>
          <button type="button" className="btn-close me-2 m-auto" aria-label="Schließen" onClick={onClose}></button>
        </div>
      </div>
    </div>
  );
}
