// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect, useId, useRef } from "react";

// A search over a list with the number of hits. "/" focuses the search, like in
// many list views. The rules of the search are those of suchwoerterAus.
export function SearchField({
  label,
  placeholder,
  value,
  onChange,
  treffer,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  // Like "12 Patienten", unknown while loading.
  treffer?: string | undefined;
}) {
  const id = useId();
  const suche = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.key === "/" && target?.closest("input, textarea, select, dialog") == null) {
        event.preventDefault();
        suche.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <div className="input-group">
        <span className="input-group-text">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        </span>
        <input
          ref={suche}
          id={id}
          type="search"
          className="form-control"
          placeholder={placeholder}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={`${id}-hilfe`}
        />
        <span className="input-group-text small text-body-secondary">
          <kbd>/</kbd>
        </span>
      </div>
      <div className="form-text d-flex justify-content-between gap-3">
        <span id={`${id}-hilfe`}>
          Alle Wörter müssen vorkommen. Setzen Sie Wörter mit Leerzeichen in Anführungszeichen, z. B. "Lindenweg 5".
        </span>
        <span className="text-nowrap" aria-live="polite">
          {treffer}
        </span>
      </div>
    </>
  );
}

export function anzahl(anzahl: number, einzahl: string, mehrzahl: string): string {
  return `${anzahl.toLocaleString("de-DE")} ${anzahl === 1 ? einzahl : mehrzahl}`;
}
