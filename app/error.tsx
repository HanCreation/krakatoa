"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section
      className="study-sheet"
      style={{ position: "fixed", inset: "12% 8% auto", zIndex: 100 }}
      role="alert"
    >
      <h1>This page could not load.</h1>
      <p>
        Retry the page. Official warnings remain available directly from Badan
        Geologi.
      </p>
      <button className="primary-button" onClick={reset}>
        Retry page
      </button>
      <a className="text-link" href="https://geologi.esdm.go.id/">
        Open Badan Geologi ↗
      </a>
    </section>
  );
}
