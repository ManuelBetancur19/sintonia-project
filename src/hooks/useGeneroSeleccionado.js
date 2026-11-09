// RESPONSABILIDAD: Carga el género indicado por la consulta de URL y expone sus estados.
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { obtenerGeneroPorId } from "../services/generos.js";

export function useGeneroSeleccionado() {
  const [parametros] = useSearchParams();
  // [LOCAL] Id del género tomado del parámetro "genero" de la URL; null si falta o está vacío.
  const idGenero = parametros.get("genero")?.trim() || null;
  // [API] Género devuelto por el servicio para el id de la URL.
  const [genero, setGenero] = useState(null);
  // [LOCAL] Empieza cargando solo si la URL trae un género.
  const [cargando, setCargando] = useState(Boolean(idGenero));
  // [LOCAL] Estado de la carga: error ("error" o "sinConexion"), género inexistente y contador de reintentos.
  const [error, setError] = useState(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [intento, setIntento] = useState(0);
  // Cambia el contador de intentos para volver a ejecutar la carga.
  const recargar = useCallback(() => setIntento((actual) => actual + 1), []);

  useEffect(() => {
    // Sin género en la URL: limpia el estado y no hace ninguna petición.
    if (!idGenero) {
      setGenero(null);
      setCargando(false);
      setError(null);
      setNoEncontrado(false);
      return undefined;
    }

    // [LOCAL] Cancela la petición anterior al cambiar el género o desmontar la vista.
    const controlador = new AbortController();
    // Evita actualizar el estado con respuestas de una carga que ya no está vigente.
    let vigente = true;
    // Reinicia el estado antes de cada carga o reintento.
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
        // Ignora las cargas obsoletas y las cancelaciones.
        if (!vigente || errorCarga?.name === "AbortError") return;

        // Un 404 significa que el género no existe; no es un fallo de carga.
        if (errorCarga?.status === 404) {
          setNoEncontrado(true);
        } else {
          // Un TypeError indica fallo de red (sin conexión); cualquier otro es un error general.
          setError(errorCarga instanceof TypeError ? "sinConexion" : "error");
        }
      } finally {
        if (vigente) setCargando(false);
      }
    }

    cargarGenero();
    // Al limpiar, marca la carga como obsoleta y cancela la petición en curso.
    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [idGenero, intento]);

  return { idGenero, genero, cargando, error, noEncontrado, recargar };
}