// RESPONSABILIDAD: Carga y valida los textos de la página pública por idioma.
import { useEffect, useState } from "react";
import { API_URL } from "../config.js";

// [STATIC] Endpoint de textos y tiempo máximo de espera de la carga (12 s).
const API = `${API_URL}/textos`;
const LIMITE_CARGA_MS = 12000;

// [STATIC] Mantiene el texto de la tarjeta en el idioma elegido sin añadirlo al JSON.
const FRASES_TARJETA = {
  es: "Sube la niebla por la montaña y el camino canta",
  en: "The mist climbs the mountain, and the road sings",
};

// [API] Valida los textos obligatorios del inicio, catálogo, accesibilidad y cookies.
function validarTextos(datos) {
  // Separa las secciones de la respuesta para validarlas más abajo.
  const textos = datos?.textos;
  const pagina = textos?.paginas?.inicioPublico;
  const hero = pagina?.hero;
  const cifras = pagina?.cifras;
  const accesibilidad = textos?.accesibilidad;
  const avisoCookies = textos?.cookies?.banner;
  const catalogo = textos?.paginas?.catalogo;
  const estados = textos?.estados;

  // Textos que deben llegar como cadenas no vacías, agrupados por sección.
  const textosObligatorios = [
    // Hero
    hero?.etiquetas?.temporada,
    hero?.titulo,
    hero?.subtitulo,
    hero?.botones?.crearCuentaGratis,
    hero?.botones?.explorarCatalogo,
    // Cifras
    cifras?.canciones?.etiqueta,
    cifras?.generos?.etiqueta,
    cifras?.cortes?.etiqueta,
    // Accesibilidad y navegación
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
    // Aviso de cookies
    avisoCookies?.titulo,
    avisoCookies?.texto,
    avisoCookies?.botones?.rechazar,
    avisoCookies?.botones?.aceptar,
    // Catálogo
    catalogo?.seo?.titulo,
    catalogo?.seo?.descripcion,
    catalogo?.encabezado?.titulo,
    catalogo?.encabezado?.subtitulo,
    catalogo?.generos?.titulo,
    catalogo?.generos?.aria?.seleccionado,
    catalogo?.destacados?.titulo,
    catalogo?.destacados?.enlaces?.descubrirMas,
    catalogo?.genero?.artistas?.titulo,
    catalogo?.genero?.artistas?.etiqueta,
    catalogo?.genero?.albumes?.titulo,
    catalogo?.genero?.canciones?.titulo,
    catalogo?.vacio?.titulo,
    catalogo?.vacio?.texto,
    // Estados comunes
    estados?.cargando?.titulo,
    estados?.cargando?.aria,
    estados?.error?.titulo,
    estados?.error?.descripcion,
    estados?.error?.botones?.reintentar,
    estados?.vacio?.generico,
    estados?.sinConexion?.titulo,
    estados?.sinConexion?.descripcion,
    estados?.sinConexion?.botones?.reintentar,
    estados?.noEncontrado?.titulo,
    estados?.noEncontrado?.descripcion,
    estados?.noEncontrado?.botones?.irAlInicio,
  ];

  // Rechaza la respuesta si algún texto obligatorio falta o está vacío.
  if (
    !textosObligatorios.every(
      (valor) => typeof valor === "string" && valor.trim().length > 0,
    )
  ) {
    throw new Error("La respuesta no contiene todos los textos obligatorios del hero.");
  }

  // Las cifras pueden llegar como texto o como número, así que se validan aparte.
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
      // Del idioma solo se pasan los códigos disponibles.
      idioma: textos?.idioma ? { codigos: textos.idioma.codigos } : undefined,
      accesibilidad,
    },
    hero: pagina,
    completo: textos,
  };
}

export function useHero(idioma) {
  // [API] Textos validados de la página pública para el idioma actual.
  const [datos, setDatos] = useState(null);
  // [LOCAL] Estado de la carga: en curso, error y contador de reintentos.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // [LOCAL] Cancela solicitudes vencidas o reemplazadas por un cambio de idioma.
    const controlador = new AbortController();
    // Si se agota el tiempo, aborta la petición y la carga termina como error.
    const limite = setTimeout(
      () => controlador.abort(),
      LIMITE_CARGA_MS,
    );
    // Evita actualizar el estado con respuestas de una carga que ya no está vigente.
    let vigente = true;

    // Reinicia el estado antes de cada carga, cambio de idioma o reintento.
    setCargando(true);
    setError(false);
    setDatos(null);

    async function cargarTextosHero() {
      try {
        const respuesta = await fetch(`${API}?idioma=${idioma}`, {
          signal: controlador.signal,
          headers: { Accept: "application/json" },
        });

        // Trata cualquier respuesta HTTP no exitosa como error de carga.
        if (!respuesta.ok) {
          throw new Error(`HTTP ${respuesta.status}`);
        }

        // Valida la forma de la respuesta antes de guardarla.
        const respuestaJson = await respuesta.json();
        const nuevosDatos = validarTextos(respuestaJson);
        if (vigente) setDatos(nuevosDatos);
      } catch (errorCarga) {
        // Registra el fallo y marca error solo si la carga sigue vigente.
        if (vigente) {
          console.error("Error al cargar los textos del hero:", errorCarga);
          setError(true);
        }
      } finally {
        // Cancela el temporizador para que no aborte una petición ya terminada.
        clearTimeout(limite);
        if (vigente) setCargando(false);
      }
    }

    cargarTextosHero();

    // Al limpiar, marca la carga como obsoleta, detiene el temporizador y cancela la petición.
    return () => {
      vigente = false;
      clearTimeout(limite);
      controlador.abort();
    };
  }, [idioma, intento]);

  return {
    // Muestran null mientras los textos no estén cargados o la carga falle.
    textosNavbar: datos?.navbar ?? null,
    textosHero: datos?.hero ?? null,
    textosCompletos: datos?.completo ?? null,
    // Usa la frase en español si no existe la del idioma pedido.
    textoTarjeta: FRASES_TARJETA[idioma] ?? FRASES_TARJETA.es,
    cargando,
    error,
    // Incrementa el contador de intentos para repetir la carga.
    recargar: () => setIntento((valor) => valor + 1),
  };
}