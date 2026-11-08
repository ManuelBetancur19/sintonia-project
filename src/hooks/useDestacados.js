import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../config.js";
import { obtenerGeneros } from "../services/generos.js";

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
  const [totalGeneros, setTotalGeneros] = useState(null);
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
    setTotalGeneros(null);

    async function cargarAlbumes() {
      try {
        const { datos: generos = [] } = await obtenerGeneros();
        if (vigente) setTotalGeneros(generos.length);

        const primerosGeneros = generos.slice(0, 6);
        const detalles = await Promise.all(
          primerosGeneros.map(async (genero) => {
            const respuestaGenero = await fetch(
              `${API_URL}/generos/${encodeURIComponent(genero.id)}`,
              { signal: controlador.signal },
            );
            if (!respuestaGenero.ok) {
              throw new Error(`HTTP ${respuestaGenero.status}`);
            }
            const respuestaDetalle = await respuestaGenero.json();
            return {
              idGenero: genero.id,
              ...(respuestaDetalle.datos ?? respuestaDetalle),
            };
          }),
        );

        const idsIncluidos = new Set();
        const seleccionados = [];
        for (const detalle of detalles) {
          const album = detalle.albumes?.[0];
          if (!album?.id || idsIncluidos.has(album.id)) continue;
          idsIncluidos.add(album.id);
          seleccionados.push({ ...album, idGenero: detalle.idGenero });
        }
        if (vigente) setAlbumes(seleccionados);
      } catch (errorCarga) {
        if (vigente) {
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
    totalGeneros,
    cargando,
    error,
    recargar,
  };
}
