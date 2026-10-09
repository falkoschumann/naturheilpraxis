// Copyright (c) 2026 Falko Schumann. MIT license.

import { useId, type SelectHTMLAttributes } from "react";

export type SelectOption = Readonly<{ value: string; label: string }>;

// A selection with a visible label and a message shown when the selection is
// invalid. Required fields are marked with an asterisk.
export function SelectField({
  label,
  value,
  options,
  onChange,
  help,
  invalidMessage,
  invalid = false,
  className = "col-12",
  ...attributes
}: {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  help?: string;
  invalidMessage?: string;
  invalid?: boolean;
  className?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange" | "className">) {
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
      <select
        id={id}
        className={`form-select${invalid ? " is-invalid" : ""}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy === "" ? undefined : describedBy}
        {...attributes}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help !== undefined && (
        <div id={helpId} className="form-text">
          {help}
        </div>
      )}
      {invalid && (
        <div id={feedbackId} className="invalid-feedback">
          {invalidMessage ?? `Bitte wählen Sie ${label}.`}
        </div>
      )}
    </div>
  );
}
