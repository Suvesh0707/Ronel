import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // tailwind

// Suppress console noise from browser extensions (not from this app)
const origError = console.error;
console.error = (...args) => {
  const str = args.map((a) => (typeof a === "string" ? a : String(a))).join(" ");
  if (
    /lockdown-install|quillbot-content|chrome-extension:\/\/invalid|data:;base64,=|inpage\.js|sendSiteMetadata/i.test(str) ||
    (args[0]?.message && /chrome-extension|quillbot|lockdown/i.test(args[0].message))
  ) {
    return;
  }
  origError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App /> 
  </React.StrictMode>
);
