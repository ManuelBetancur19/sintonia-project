// RESPONSABILIDAD: Consulta los álbumes populares de la API.
import { API_URL } from "../config.js";

// El objeto de opciones es opcional: sin él, la solicitud se hace sin señal de cancelación.
export async function obtenerAlbumesPopulares(limite, { signal } = {}) {
  // [API] Pide los álbumes ordenados por popularidad; el límite se codifica para la URL.
  const respuesta = await fetch(
    `${API_URL}/albumes?orden=populares&limite=${encodeURIComponent(limite)}`,
    {
      headers: { Accept: "application/json" },
      // [LOCAL] Permite a quien llama cancelar la solicitud en curso.
      signal,
    },
  );

  // Trata cualquier respuesta HTTP no exitosa como un fallo para que lo gestione quien llama.
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

  // Devuelve los álbumes tal como llegan de la API, sin transformarlos.
  return respuesta.json();
}