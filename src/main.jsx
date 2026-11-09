// RESPONSABILIDAD: Monta React, el enrutador y los estilos globales.
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/accesibilidad.css";
import App from "./App.jsx";

// Monta la aplicación en el elemento #root, dentro de StrictMode y del enrutador,
// para que toda la app tenga acceso a las rutas.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);