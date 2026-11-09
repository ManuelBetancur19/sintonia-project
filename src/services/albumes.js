import { API_URL } from "../config.js";

export async function obtenerAlbumesPopulares(limite, { signal } = {}) {
  const respuesta = await fetch(
    `${API_URL}/albumes?orden=populares&limite=${encodeURIComponent(limite)}`,
    {
      headers: { Accept: "application/json" },
      signal,
    },
  );

  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

  return respuesta.json();
}
