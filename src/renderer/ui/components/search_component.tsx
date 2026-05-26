// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export function SearchComponent({
  suchtext,
  setSuchtext,
}: {
  suchtext: string;
  setSuchtext: (suchtext: string) => void;
}) {
  // TODO replace with DebouncedInput
  //  see https://github.com/TanStack/table/blob/main/examples/react/query-router-search-params/src/components/debouncedInput.tsx
  return (
    <form className="d-flex" role="search" onSubmit={(event) => event.preventDefault()}>
      <input
        className="form-control me-2"
        type="search"
        placeholder="Suche"
        aria-label="Suche"
        value={suchtext}
        onChange={(e) => setSuchtext(String(e.target.value))}
      />
      <button className="btn btn-outline-primary" type="submit">
        Suche
      </button>
    </form>
  );
}

export default SearchComponent;
