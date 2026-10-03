import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { preloadDiffHighlighter } from "./lib/preloadDiffHighlighter";
import { initTheme } from "./features/settings";

// Before the first render, so the app never paints in the wrong theme.
initTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

preloadDiffHighlighter();
