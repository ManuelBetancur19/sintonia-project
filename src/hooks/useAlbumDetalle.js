// RESPONSABILIDAD: Carga el detalle del álbum indicado por la ruta.
import { useCallback, useEffect, useState } from "react";
import { obtenerAlbumPorId } from "../services/albumes.js";

export function useAlbumDetalle(id) {
  const [resultado, setResultado] = useState({ id: null, intento: 0 });
  const [intento, setIntento] = useState(0);
  const recargar = useCallback(() => setIntento((actual) => actual + 1), []);

  useEffect(() => {
    if (!id) {
      setResultado({ id, intento, album: null, cargando: false, error: null, noEncontrado: true });
      return undefined;
    }

    const controlador = new AbortController();
    let vigente = true;
    setResultado({ id, intento, album: null, cargando: true, error: null, noEncontrado: false });

    async function cargarAlbum() {
      try {
        const datos = await obtenerAlbumPorId(id, {
          signal: controlador.signal,
        });
        if (!vigente) return;

        if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
          throw new Error("La API devolvió un álbum sin datos utilizables.");
        }
        setResultado({ id, intento, album: datos, cargando: false, error: null, noEncontrado: false });
      } catch (errorCarga) {
        if (!vigente || errorCarga?.name === "AbortError") return;
        if (errorCarga?.status === 404) {
          setResultado({ id, intento, album: null, cargando: false, error: null, noEncontrado: true });
        } else {
          setResultado({
            id,
            intento,
            album: null,
            cargando: false,
            error: errorCarga instanceof TypeError ? "sinConexion" : "error",
            noEncontrado: false,
          });
        }
      }
    }

    cargarAlbum();
    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [id, intento]);

  // Associa el estado al ID y reintento actuales para nunca mostrar una respuesta anterior.
  const vigente = resultado.id === id && resultado.intento === intento;
  return {
    album: vigente ? resultado.album : null,
    cargando: Boolean(id) && (!vigente || resultado.cargando),
    error: vigente ? resultado.error : null,
    noEncontrado: vigente && resultado.noEncontrado,
    recargar,
  };
}
