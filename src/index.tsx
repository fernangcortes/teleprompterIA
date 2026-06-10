import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ConfigProvider } from "./context/ConfigContext";
import { PlaybackProvider } from "./context/PlaybackContext";
import "./index.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ConfigProvider>
        <PlaybackProvider>
          <App />
        </PlaybackProvider>
      </ConfigProvider>
    </React.StrictMode>
  );
}
export default {};
