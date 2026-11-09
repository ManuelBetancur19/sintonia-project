import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { obtenerGeneroPorId } from "../services/generos.js";

export function useGeneroSeleccionado() {
  const [parametros] = useSearchParams();
  const idGenero = parametros.get("genero")?.trim() || null;
  const [genero, setGenero] = useState(null);
  const [cargando, setCargando] = useState(Boolean(idGenero));
  const [error, setError] = useState(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [intento, setIntento] = useState(0);
  const recargar = useCallback(() => setIntento((actual) => actual + 1), []);

  useEffect(() => {
    if (!idGenero) {
      setGenero(null);
      setCargando(false);
      setError(null);
      setNoEncontrado(false);
      return undefined;
    }

    const controlador = new AbortController();
    let vigente = true;
    setGenero(null);
    setCargando(true);
    setError(null);
    setNoEncontrado(false);

    async function cargarGenero() {
      try {
        const datos = await obtenerGeneroPorId(idGenero, {
          signal: controlador.signal,
        });
        if (vigente) setGenero(datos);
      } catch (errorCarga) {
        if (!vigente || errorCarga?.name === "AbortError") return;

        if (errorCarga?.status === 404) {
          setNoEncontrado(true);
        } else {
          setError(errorCarga instanceof TypeError ? "sinConexion" : "error");
        }
      } finally {
        if (vigente) setCargando(false);
      }
    }

    cargarGenero();
    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [idGenero, intento]);

  return { idGenero, genero, cargando, error, noEncontrado, recargar };
}
