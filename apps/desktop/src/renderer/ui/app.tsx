// Copyright (c) 2026 Falko Schumann. MIT license.

export function App() {
  return (
    <>
      <nav className="navbar navbar-expand bg-primary" data-bs-theme="dark" aria-label="Hauptnavigation">
        <div className="container-fluid">
          <span className="navbar-brand">
            <i className="fa-solid fa-leaf me-2" aria-hidden="true"></i>
            Naturheilpraxis
          </span>
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#start">
                Start
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <main className="container py-4" id="start">
        <h1 className="h3">Willkommen</h1>
        <p className="text-body-secondary">Die Anwendung ist im Aufbau. Praxen, Patienten und Leistungen folgen.</p>
      </main>
    </>
  );
}
