import { useCallback, useEffect, useState } from "react";
import { obtenerAlbumesPopulares } from "../services/albumes.js";

const LIMITE = 6;

function textosValidos(textos) {
  const destacados = textos?.paginas?.inicioPublico?.destacados;
  const estados = textos?.estados;
  const requeridos = [
    destacados?.titulo,
    destacados?.enlaces?.descubrirMas,
    estados?.cargando?.titulo,
    estados?.cargando?.aria,
    estados?.error?.titulo,
    estados?.error?.descripcion,
    estados?.error?.botones?.reintentar,
    estados?.sinConexion?.titulo,
    estados?.sinConexion?.descripcion,
    estados?.sinConexion?.botones?.reintentar,
    estados?.vacio?.generico,
  ];

  return requeridos.every((texto) => typeof texto === "string" && texto.trim())
    ? { destacados, estados }
    : null;
}

export function useDestacados({ textos }) {
  const textosSeccion = textosValidos(textos);
  const [albumes, setAlbumes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);
  const recargar = useCallback(() => setIntento((valor) => valor + 1), []);

  useEffect(() => {
    const controlador = new AbortController();
    let vigente = true;

    setCargando(true);
    setError(null);
    setAlbumes([]);

    async function cargarAlbumes() {
      try {
        const respuesta = await obtenerAlbumesPopulares(LIMITE, {
          signal: controlador.signal,
        });

        const idsIncluidos = new Set();
        const seleccionados = [];
        const albumesApi = Array.isArray(respuesta?.datos) ? respuesta.datos : [];
        for (const album of albumesApi) {
          if (!album?.id || idsIncluidos.has(album.id)) continue;
          idsIncluidos.add(album.id);
          seleccionados.push(album);
          if (seleccionados.length === LIMITE) break;
        }
        if (vigente) setAlbumes(seleccionados);
      } catch (errorCarga) {
        if (vigente && errorCarga?.name !== "AbortError") {
          console.error("Error al cargar los álbumes destacados:", errorCarga);
          setError(errorCarga instanceof TypeError ? "sinConexion" : "error");
        }
      } finally {
        if (vigente) setCargando(false);
      }
    }

    cargarAlbumes();
    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [intento]);

  return {
    textos: textosSeccion,
    albumes,
    cargando,
    error,
    recargar,
  };
}
