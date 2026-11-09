// RESPONSABILIDAD: Carga la lista de géneros y prepara los textos de la sección.
import { useCallback, useEffect, useState } from "react";
import { obtenerGeneros } from "../services/generos.js";

// [STATIC] Define la cantidad predeterminada de géneros visibles en inicio.
const LIMITE_GENEROS = 8;

// Devuelve los textos de la sección solo si todos los requeridos son cadenas no vacías; si no, null.
function textosValidos(textos) {
  const generos = textos?.paginas?.inicioPublico?.generos;
  const estados = textos?.estados;
  // Textos que la sección necesita para mostrar el título, el enlace y los estados.
  const requeridos = [
    generos?.titulo,
    generos?.enlaces?.verCatalogo,
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
    ? { generos, estados }
    : null;
}

export function useExploraGeneros({ textos, limite = LIMITE_GENEROS }) {
  // Null mientras los textos falten o estén incompletos.
  const textosSeccion = textosValidos(textos);
  // [API] Géneros mostrados y total real devuelto por el servicio (null hasta que llegue).
  const [generos, setGeneros] = useState([]);
  const [totalGeneros, setTotalGeneros] = useState(null);
  // [LOCAL] Estado de la carga: en curso, error ("error" o "sinConexion") y contador de reintentos.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);
  // Cambia el contador de intentos para volver a ejecutar la carga.
  const recargar = useCallback(() => setIntento((valor) => valor + 1), []);

  useEffect(() => {
    // Evita actualizar el estado con respuestas de una carga que ya no está vigente.
    let vigente = true;
    // Reinicia el estado antes de cada carga o reintento.
    setCargando(true);
    setError(null);
    setGeneros([]);
    setTotalGeneros(null);

    async function cargarGeneros() {
      try {
        const respuesta = await obtenerGeneros();
        // [API] Conserva el total real para el hero y limita solo la lista presentada.
        // Usa una lista vacía si la respuesta no trae datos en forma de arreglo.
        const lista = Array.isArray(respuesta?.datos) ? respuesta.datos : [];
        if (vigente) {
          setTotalGeneros(lista.length);
          setGeneros(lista.slice(0, limite));
        }
      } catch (errorCarga) {
        if (vigente) {
          console.error("Error al cargar los géneros para explorar:", errorCarga);
          // Un TypeError indica fallo de red (sin conexión); cualquier otro es un error general.
          setError(errorCarga instanceof TypeError ? "sinConexion" : "error");
        }
      } finally {
        if (vigente) setCargando(false);
      }
    }

    cargarGeneros();
    // Al limpiar, marca la carga como obsoleta para ignorar su respuesta.
    return () => {
      vigente = false;
    };
  }, [intento, limite]);

  return {
    textos: textosSeccion,
    generos,
    totalGeneros,
    cargando,
    error,
    recargar,
  };
}