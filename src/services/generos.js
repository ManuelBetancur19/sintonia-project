// RESPONSABILIDAD: Consulta y normaliza la lista y el detalle de géneros de la API.
import { API_URL } from "../config.js";

// [LOCAL] Guarda la petición de géneros en curso; vale null cuando no hay ninguna.
let solicitudGeneros = null;

// [API] Comparte la petición de géneros mientras sigue en curso.
export function obtenerGeneros() {
  // Lanza una petición nueva solo si no hay otra en curso.
  if (!solicitudGeneros) {
    solicitudGeneros = fetch(`${API_URL}/generos`, {
      headers: { Accept: "application/json" },
    })
      .then((respuesta) => {
        // Trata cualquier respuesta HTTP no exitosa como un fallo.
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return respuesta.json();
      })
      .finally(() => {
        // Libera la petición compartida, con éxito o con error, para permitir una consulta nueva.
        solicitudGeneros = null;
      });
  }

  return solicitudGeneros;
}

export function normalizarGeneroDetalle(respuesta) {
  // Acepta la respuesta con o sin el envoltorio "datos".
  const datos =
    respuesta?.datos && typeof respuesta.datos === "object"
      ? respuesta.datos
      : respuesta;

  // Devuelve colecciones vacías si la respuesta no es un objeto utilizable.
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return { artistas: [], albumes: [], pistas: [] };
  }

  // [LOCAL] Completa las colecciones ausentes para que la vista pueda iterarlas con seguridad.
  return {
    ...datos,
    artistas: Array.isArray(datos.artistas) ? datos.artistas : [],
    albumes: Array.isArray(datos.albumes) ? datos.albumes : [],
    pistas: Array.isArray(datos.pistas) ? datos.pistas : [],
  };
}

// El objeto de opciones es opcional: sin él, la solicitud se hace sin señal de cancelación.
export async function obtenerGeneroPorId(id, { signal } = {}) {
  // [API] Pide el detalle del género; el id se codifica para la URL.
  const respuesta = await fetch(
    `${API_URL}/generos/${encodeURIComponent(id)}`,
    {
      // [LOCAL] Permite a quien llama cancelar la solicitud en curso.
      signal,
      headers: { Accept: "application/json" },
    },
  );

  // Adjunta el código HTTP al error para que quien llama pueda reaccionar según el estado.
  if (!respuesta.ok) {
    const error = new Error(`HTTP ${respuesta.status}`);
    error.status = respuesta.status;
    throw error;
  }

  // Normaliza el detalle antes de entregarlo a la vista.
  return normalizarGeneroDetalle(await respuesta.json());
}