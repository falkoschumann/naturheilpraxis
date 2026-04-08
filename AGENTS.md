# Agents Guidelines

## Workaround for TanStack React Table

ESLint Warning:

> Compilation Skipped: Use of incompatible library, TanStack Table's
> `useReactTable()` API returns functions that cannot be memoized safely

Workaround:

Add `"use no memo";` and ignore the warning. See
https://github.com/TanStack/table/issues/6137

```typescript jsx
import {
    ColumnDef,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

export function DataTable<TData, TValue>({
    columns,
    data,
}: {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}) {
    "use no memo";

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // ... rest of the component
}
```
