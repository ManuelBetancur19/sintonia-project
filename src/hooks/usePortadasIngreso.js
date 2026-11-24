// RESPONSABILIDAD: Carga portadas reales para la cuadrícula decorativa del acceso.
import { useEffect, useState } from "react";
import { obtenerAlbumesPopulares } from "../services/albumes.js";

const CANTIDAD_PORTADAS = 8;

export function usePortadasIngreso() {
  const [portadas, setPortadas] = useState([]);

  useEffect(() => {
    const controlador = new AbortController();
    let vigente = true;

    async function cargarPortadas() {
      try {
        const respuesta = await obtenerAlbumesPopulares(CANTIDAD_PORTADAS, {
          signal: controlador.signal,
        });
        const ids = new Set();
        const disponibles = [];
        const albumes = Array.isArray(respuesta?.datos) ? respuesta.datos : [];

        for (const album of albumes) {
          if (!album?.id || !album?.portada || ids.has(album.id)) continue;
          ids.add(album.id);
          disponibles.push(album);
          if (disponibles.length === CANTIDAD_PORTADAS) break;
        }

        if (vigente) setPortadas(disponibles);
      } catch (error) {
        if (vigente && error?.name !== "AbortError") setPortadas([]);
      }
    }

    cargarPortadas();
    return () => {
      vigente = false;
      controlador.abort();
    };
  }, []);

  return portadas;
}
