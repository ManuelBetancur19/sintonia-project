// Punto de entrada de la aplicación: carga los estilos globales y
// monta el componente raíz <App /> dentro del elemento #root del HTML.
// ============================================================

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./styles/tokens.css"; // Variables de diseño (colores, fuentes, espacios)
import "./styles/global.css"; // Estilos globales que usan esas variables
import "./styles/accesibilidad.css";
import App from "./App.jsx";

// ------------------------------------------------------------
// MONTAJE
// ------------------------------------------------------------

// StrictMode activa avisos extra en desarrollo (por ejemplo, ejecuta los
// efectos dos veces para detectar errores). No afecta la versión final.
createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
