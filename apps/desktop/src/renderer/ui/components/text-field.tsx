// Copyright (c) 2026 Falko Schumann. MIT license.

import { useId, type InputHTMLAttributes } from "react";

// An input with a visible label, an optional help text and a message shown when
// the input is invalid. Required fields are marked with an asterisk.
export function TextField({
  label,
  value,
  onChange,
  help,
  invalidMessage,
  invalid = false,
  className = "col-12",
  ...attributes
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
  invalidMessage?: string;
  invalid?: boolean;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className">) {
  const id = useId();
  const helpId = `${id}-help`;
  const feedbackId = `${id}-feedback`;
  const describedBy = [help === undefined ? undefined : helpId, invalid ? feedbackId : undefined]
    .filter((value) => value !== undefined)
    .join(" ");

  return (
    <div className={className}>
      <label htmlFor={id} className={`form-label${attributes.required === true ? " required" : ""}`}>
        {label}
      </label>
      <input
        id={id}
        className={`form-control${invalid ? " is-invalid" : ""}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy === "" ? undefined : describedBy}
        {...attributes}
      />
      {help !== undefined && (
        <div id={helpId} className="form-text">
          {help}
        </div>
      )}
      {invalid && (
        <div id={feedbackId} className="invalid-feedback">
          {invalidMessage ?? `Bitte geben Sie ${label} an.`}
        </div>
      )}
    </div>
  );
}
