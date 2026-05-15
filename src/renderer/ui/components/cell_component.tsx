// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { CellContext } from "@tanstack/react-table";
import type { PropsWithChildren } from "react";

export function CellComponent<TData, T>({
  info,
  renderer = (value) => String(value),
  children,
}: {
  info: CellContext<TData, T>;
  renderer?: (value: T) => string;
} & PropsWithChildren) {
  if (info.getValue() == null) {
    return;
  }

  if (children != null) {
    return children;
  }

  return renderer(info.getValue());
}

export default CellComponent;
