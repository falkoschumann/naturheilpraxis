// Copyright (c) 2026 Falko Schumann. MIT license.

import { useCallback, type ReactNode } from "react";

// The headers stay visible while the page scrolls and stack below each other:
// the navbar, the header of the page and the header of a list with the head of
// its table. Each header provides its height as a CSS variable, so the next one
// knows where to stick.

export function PageHeader({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useHeightAsVariable("--page-header-height", "document");
  return (
    <div ref={ref} className={`page-header${className === undefined ? "" : ` ${className}`}`}>
      {children}
    </div>
  );
}

// The header of a list sticks only while its parent, the list, is visible.
export function ListHeader({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useHeightAsVariable("--list-header-height", "parent");
  return (
    <div ref={ref} className={`list-header${className === undefined ? "" : ` ${className}`}`}>
      {children}
    </div>
  );
}

export function useHeightAsVariable(name: string, scope: "document" | "parent") {
  return useCallback(
    (element: HTMLElement | null) => {
      const target = scope === "document" ? document.documentElement : element?.parentElement;
      if (element === null || target == null) {
        return;
      }

      const update = () => target.style.setProperty(name, `${element.getBoundingClientRect().height}px`);
      update();
      // jsdom has no ResizeObserver.
      const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
      observer?.observe(element);
      return () => {
        observer?.disconnect();
        target.style.removeProperty(name);
      };
    },
    [name, scope],
  );
}
