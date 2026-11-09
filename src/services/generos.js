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

export function normalizarGeneroDetalle(respuesta) {
  const datos =
    respuesta?.datos && typeof respuesta.datos === "object"
      ? respuesta.datos
      : respuesta;

  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return { artistas: [], albumes: [], pistas: [] };
  }

  return {
    ...datos,
    artistas: Array.isArray(datos.artistas) ? datos.artistas : [],
    albumes: Array.isArray(datos.albumes) ? datos.albumes : [],
    pistas: Array.isArray(datos.pistas) ? datos.pistas : [],
  };
}

export async function obtenerGeneroPorId(id, { signal } = {}) {
  const respuesta = await fetch(
    `${API_URL}/generos/${encodeURIComponent(id)}`,
    {
      signal,
      headers: { Accept: "application/json" },
    },
  );

  if (!respuesta.ok) {
    const error = new Error(`HTTP ${respuesta.status}`);
    error.status = respuesta.status;
    throw error;
  }

  return normalizarGeneroDetalle(await respuesta.json());
}
