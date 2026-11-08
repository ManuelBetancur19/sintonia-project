import { API_URL } from "../config.js";

let solicitudGeneros = null;

// Comparte la petición en curso entre los hooks de la vista 1.
export function obtenerGeneros() {
  if (!solicitudGeneros) {
    solicitudGeneros = fetch(`${API_URL}/generos`, {
      headers: { Accept: "application/json" },
    })
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return respuesta.json();
      })
      .finally(() => {
        solicitudGeneros = null;
      });
  }

  return solicitudGeneros;
}
