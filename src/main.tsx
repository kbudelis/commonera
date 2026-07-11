import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

function FoundationShell() {
  return (
    <main>
      <h1>Cosmic Calendar</h1>
      <p>The mobile flow is being assembled.</p>
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Application root #root was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <FoundationShell />
  </StrictMode>,
);
