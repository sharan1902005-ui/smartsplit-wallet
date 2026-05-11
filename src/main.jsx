import { registerSW } from "virtual:pwa-register";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "16px",
            background: "#fff",
            color: "#111827",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.12)",
          },
        }}
      />
    </ThemeProvider>
  </React.StrictMode>
);
