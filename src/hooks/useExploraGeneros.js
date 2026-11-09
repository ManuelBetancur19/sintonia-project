import { useCallback, useEffect, useState } from "react";
import { obtenerGeneros } from "../services/generos.js";

const LIMITE_GENEROS = 8;

function textosValidos(textos) {
  const generos = textos?.paginas?.inicioPublico?.generos;
  const estados = textos?.estados;
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
  const textosSeccion = textosValidos(textos);
  const [generos, setGeneros] = useState([]);
  const [totalGeneros, setTotalGeneros] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);
  const recargar = useCallback(() => setIntento((valor) => valor + 1), []);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    setGeneros([]);
    setTotalGeneros(null);

    async function cargarGeneros() {
      try {
        const respuesta = await obtenerGeneros();
        const lista = Array.isArray(respuesta?.datos) ? respuesta.datos : [];
        if (vigente) {
          setTotalGeneros(lista.length);
          setGeneros(lista.slice(0, limite));
        }
      } catch (errorCarga) {
        if (vigente) {
          console.error("Error al cargar los géneros para explorar:", errorCarga);
          setError(errorCarga instanceof TypeError ? "sinConexion" : "error");
        }
      } finally {
        if (vigente) setCargando(false);
      }
    }

    cargarGeneros();
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
