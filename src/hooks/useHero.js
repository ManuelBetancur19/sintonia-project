import { useEffect, useState } from "react";
import { API_URL } from "../config.js";

const API = `${API_URL}/textos`;
const LIMITE_CARGA_MS = 12000;

const FRASES_TARJETA = {
  es: "Sube la niebla por la montaña y el camino canta",
  en: "The mist climbs the mountain, and the road sings",
};

function validarTextos(datos) {
  const textos = datos?.textos;
  const pagina = textos?.paginas?.inicioPublico;
  const hero = pagina?.hero;
  const cifras = pagina?.cifras;
  const accesibilidad = textos?.accesibilidad;
  const avisoCookies = textos?.cookies?.banner;

  const textosObligatorios = [
    hero?.etiquetas?.temporada,
    hero?.titulo,
    hero?.subtitulo,
    hero?.botones?.crearCuentaGratis,
    hero?.botones?.explorarCatalogo,
    cifras?.canciones?.etiqueta,
    cifras?.generos?.etiqueta,
    cifras?.cortes?.etiqueta,
    accesibilidad?.titulo,
    accesibilidad?.tamanoTexto?.etiqueta,
    accesibilidad?.tamanoTexto?.reducir,
    accesibilidad?.tamanoTexto?.aumentar,
    accesibilidad?.tamanoTexto?.valor,
    accesibilidad?.altoContraste?.etiqueta,
    accesibilidad?.altoContraste?.ayuda,
    accesibilidad?.reducirMovimiento?.etiqueta,
    accesibilidad?.reducirMovimiento?.ayuda,
    accesibilidad?.subrayarEnlaces?.etiqueta,
    accesibilidad?.subrayarEnlaces?.ayuda,
    accesibilidad?.espaciado?.etiqueta,
    accesibilidad?.espaciado?.ayuda,
    accesibilidad?.enlaces?.declaracion,
    accesibilidad?.botones?.restablecer,
    accesibilidad?.mensajes?.nota,
    accesibilidad?.aria?.cerrar,
    textos?.navbar?.aria?.accesibilidad,
    textos?.menuMovil?.secciones?.accesibilidad,
    avisoCookies?.titulo,
    avisoCookies?.texto,
    avisoCookies?.botones?.rechazar,
    avisoCookies?.botones?.aceptar,
  ];

  if (
    !textosObligatorios.every(
      (valor) => typeof valor === "string" && valor.trim().length > 0,
    )
  ) {
    throw new Error("La respuesta no contiene todos los textos obligatorios del hero.");
  }

  const valoresObligatorios = [cifras?.canciones?.valor, cifras?.cortes?.valor];
  if (
    !valoresObligatorios.every(
      (valor) =>
        (typeof valor === "string" && valor.trim().length > 0) ||
        (typeof valor === "number" && Number.isFinite(valor)),
    )
  ) {
    throw new Error("La respuesta no contiene los valores de las cifras del hero.");
  }

  return {
    // Se conserva la respuesta del navbar para reutilizar esta petición,
    // pero el Hero no valida los campos de navegación.
    navbar: {
      navbar: textos?.navbar,
      menuMovil: textos?.menuMovil,
      idioma: textos?.idioma ? { codigos: textos.idioma.codigos } : undefined,
      accesibilidad,
    },
    hero: pagina,
    completo: textos,
  };
}

export function useHero(idioma) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    const limite = setTimeout(
      () => controlador.abort(),
      LIMITE_CARGA_MS,
    );
    let vigente = true;

    setCargando(true);
    setError(false);
    setDatos(null);

    async function cargarTextosHero() {
      try {
        const respuesta = await fetch(`${API}?idioma=${idioma}`, {
          signal: controlador.signal,
          headers: { Accept: "application/json" },
        });

        if (!respuesta.ok) {
          throw new Error(`HTTP ${respuesta.status}`);
        }

        const respuestaJson = await respuesta.json();
        const nuevosDatos = validarTextos(respuestaJson);
        if (vigente) setDatos(nuevosDatos);
      } catch (errorCarga) {
        if (vigente) {
          console.error("Error al cargar los textos del hero:", errorCarga);
          setError(true);
        }
      } finally {
        clearTimeout(limite);
        if (vigente) setCargando(false);
      }
    }

    cargarTextosHero();

    return () => {
      vigente = false;
      clearTimeout(limite);
      controlador.abort();
    };
  }, [idioma, intento]);

  return {
    textosNavbar: datos?.navbar ?? null,
    textosHero: datos?.hero ?? null,
    textosCompletos: datos?.completo ?? null,
    textoTarjeta: FRASES_TARJETA[idioma] ?? FRASES_TARJETA.es,
    cargando,
    error,
    recargar: () => setIntento((valor) => valor + 1),
  };
}
