// RESPONSABILIDAD: Carga y expone los álbumes destacados y sus estados.
import { useCallback, useEffect, useState } from "react";
import { obtenerAlbumesPopulares } from "../services/albumes.js";

// [STATIC] Limita la fila de destacados a seis álbumes.
const LIMITE = 6;

// Devuelve los textos de la sección solo si todos los requeridos son cadenas no vacías; si no, null.
function textosValidos(textos) {
  const destacados = textos?.paginas?.inicioPublico?.destacados;
  const estados = textos?.estados;
  // Textos que la sección necesita para mostrar el título, el enlace y los estados.
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
  // Null mientras los textos falten o estén incompletos.
  const textosSeccion = textosValidos(textos);
  // [API] Álbumes destacados devueltos por el servicio.
  const [albumes, setAlbumes] = useState([]);
  // [LOCAL] Estado de la carga: en curso, error ("error" o "sinConexion") y contador de reintentos.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);
  // Cambia el contador de intentos para volver a ejecutar la carga.
  const recargar = useCallback(() => setIntento((valor) => valor + 1), []);

  useEffect(() => {
    // Permite cancelar la petición si el efecto se limpia antes de que termine.
    const controlador = new AbortController();
    // Evita actualizar el estado con respuestas de una carga que ya no está vigente.
    let vigente = true;

    // Reinicia el estado antes de cada carga o reintento.
    setCargando(true);
    setError(null);
    setAlbumes([]);

    async function cargarAlbumes() {
      try {
        const respuesta = await obtenerAlbumesPopulares(LIMITE, {
          signal: controlador.signal,
        });

        // [API] Conserva el orden de respuesta y elimina álbumes con ids repetidos.
        const idsIncluidos = new Set();
        const seleccionados = [];
        // Usa una lista vacía si la respuesta no trae datos en forma de arreglo.
        const albumesApi = Array.isArray(respuesta?.datos) ? respuesta.datos : [];
        for (const album of albumesApi) {
          // Omite álbumes sin id o ya incluidos.
          if (!album?.id || idsIncluidos.has(album.id)) continue;
          idsIncluidos.add(album.id);
          seleccionados.push(album);
          // Detiene la selección al llegar al límite.
          if (seleccionados.length === LIMITE) break;
        }
        if (vigente) setAlbumes(seleccionados);
      } catch (errorCarga) {
        // Ignora las cancelaciones; los demás fallos se registran y se clasifican.
        if (vigente && errorCarga?.name !== "AbortError") {
          console.error("Error al cargar los álbumes destacados:", errorCarga);
          // Un TypeError indica fallo de red (sin conexión); cualquier otro es un error general.
          setError(errorCarga instanceof TypeError ? "sinConexion" : "error");
        }
      } finally {
        if (vigente) setCargando(false);
      }
    }

    cargarAlbumes();
    // Al limpiar, marca la carga como obsoleta y cancela la petición en curso.
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