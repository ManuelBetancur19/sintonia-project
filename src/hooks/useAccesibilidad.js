// RESPONSABILIDAD: Gestiona las preferencias de accesibilidad durante la visita.
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  leerConsentimiento,
  obtenerAtributoSecureCookie,
  obtenerConsentimientoCrudo,
  puedeGuardar,
  suscribirseAConsentimiento,
} from "../utils/consentimiento.js";

// [STATIC] Límites y paso del tamaño de texto, expresados como porcentaje del tamaño base.
export const TAMANO_TEXTO_BASE = 100;
export const PASO_TAMANO_TEXTO = 10;
export const TAMANO_TEXTO_MINIMO = 80;
export const TAMANO_TEXTO_MAXIMO = 150;

// [STATIC] Nombre de la cookie de preferencias y su duración (un año, en segundos).
const NOMBRE_COOKIE = "accesibilidad";
const DURACION_COOKIE_SEGUNDOS = 60 * 60 * 24 * 365;

// [LOCAL] Lee las preferencias del sistema operativo para contraste y movimiento.
function leerPreferenciasSistema() {
  // Devuelve valores desactivados cuando no hay navegador o falta matchMedia (por ejemplo, en servidor).
  if (typeof window === "undefined" || !window.matchMedia) {
    return { altoContraste: false, reducirMovimiento: false };
  }

  return {
    altoContraste: window.matchMedia("(prefers-contrast: more)").matches,
    reducirMovimiento: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
  };
}

// Lee y valida las preferencias guardadas en la cookie; devuelve null si no hay datos utilizables.
function leerCookieAccesibilidad(puedeLeer) {
  // No lee la cookie sin consentimiento o fuera del navegador.
  if (!puedeLeer || typeof document === "undefined") return null;

  // Busca la cookie de accesibilidad entre todas las cookies del documento.
  const prefijo = `${NOMBRE_COOKIE}=`;
  const cookie = document.cookie
    .split("; ")
    .find((parte) => parte.startsWith(prefijo));
  if (!cookie) return null;

  try {
    const preferencias = JSON.parse(
      decodeURIComponent(cookie.slice(prefijo.length)),
    );
    // Descarta contenido que no sea un objeto simple.
    if (!preferencias || typeof preferencias !== "object" || Array.isArray(preferencias)) {
      return null;
    }

    const guardadas = {};
    const tamanoTexto = preferencias.tamanoTexto;

    // Acepta el tamaño solo si es un entero dentro de los límites permitidos.
    if (
      Number.isInteger(tamanoTexto) &&
      tamanoTexto >= TAMANO_TEXTO_MINIMO &&
      tamanoTexto <= TAMANO_TEXTO_MAXIMO
    ) {
      guardadas.tamanoTexto = tamanoTexto;
    }

    // Acepta cada interruptor solo si su valor guardado es booleano.
    ["altoContraste", "reducirMovimiento", "subrayarEnlaces", "espaciadoLectura"].forEach(
      (preferencia) => {
        if (typeof preferencias[preferencia] === "boolean") {
          guardadas[preferencia] = preferencias[preferencia];
        }
      },
    );

    return Object.keys(guardadas).length > 0 ? guardadas : null;
  } catch {
    // Una cookie corrupta o con JSON inválido se ignora.
    return null;
  }
}

// Combina cookie y sistema: la preferencia guardada manda y el sistema o un valor fijo cubren lo que falte.
function obtenerPreferenciasIniciales(puedeLeer) {
  const sistema = leerPreferenciasSistema();
  const guardadas = leerCookieAccesibilidad(puedeLeer);

  return {
    tamanoTexto: guardadas?.tamanoTexto ?? TAMANO_TEXTO_BASE,
    altoContraste: guardadas?.altoContraste ?? sistema.altoContraste,
    reducirMovimiento:
      guardadas?.reducirMovimiento ?? sistema.reducirMovimiento,
    subrayarEnlaces: guardadas?.subrayarEnlaces ?? false,
    espaciadoLectura: guardadas?.espaciadoLectura ?? false,
  };
}

// Indica si ya existe la cookie de accesibilidad.
function cookieAccesibilidadExiste() {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((parte) => parte.startsWith(`${NOMBRE_COOKIE}=`));
}

// Borra la cookie caducándola de inmediato (Max-Age=0).
function borrarCookieAccesibilidad() {
  document.cookie = `${NOMBRE_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0${obtenerAtributoSecureCookie()}`;
}

// Guarda las preferencias como JSON codificado en la cookie.
function guardarPreferenciasAccesibilidad(preferencias) {
  document.cookie = `${NOMBRE_COOKIE}=${encodeURIComponent(
    JSON.stringify(preferencias),
  )}; Path=/; SameSite=Lax; Max-Age=${DURACION_COOKIE_SEGUNDOS}${obtenerAtributoSecureCookie()}`;
}

export function useAccesibilidad() {
  // [LOCAL] Usa el valor crudo de consentimiento como snapshot estable para React.
  const consentimientoCrudo = useSyncExternalStore(
    suscribirseAConsentimiento,
    obtenerConsentimientoCrudo,
    // Snapshot del servidor: sin consentimiento.
    () => null,
  );
  // Interpreta el consentimiento solo cuando cambia su valor crudo.
  const consentimiento = useMemo(
    () => leerConsentimiento(consentimientoCrudo),
    [consentimientoCrudo],
  );
  // Calcula las preferencias de partida; solo lee la cookie si la categoría "preferencias" fue consentida.
  const iniciales = useMemo(
    () => obtenerPreferenciasIniciales(consentimiento?.categorias.preferencias === true),
    [consentimiento],
  );

  // [LOCAL] Estado de cada preferencia, inicializado con los valores calculados arriba.
  const [tamanoTexto, setTamanoTexto] = useState(iniciales.tamanoTexto);
  const [altoContraste, setAltoContraste] = useState(iniciales.altoContraste);
  const [reducirMovimiento, setReducirMovimiento] = useState(
    iniciales.reducirMovimiento,
  );
  const [subrayarEnlaces, setSubrayarEnlaces] = useState(
    iniciales.subrayarEnlaces,
  );
  const [espaciadoLectura, setEspaciadoLectura] = useState(
    iniciales.espaciadoLectura,
  );
  // Marca que, tras restablecer, el siguiente efecto debe borrar la cookie en lugar de guardar los valores.
  const omitirGuardadoSiguienteEfecto = useRef(false);

  // Suma o resta el cambio al tamaño y lo mantiene dentro de los límites.
  const ajustarTamanoTexto = useCallback((cambio) => {
    setTamanoTexto((actual) =>
      Math.min(
        TAMANO_TEXTO_MAXIMO,
        Math.max(TAMANO_TEXTO_MINIMO, actual + cambio),
      ),
    );
  }, []);

  // Devuelve las preferencias a sus valores por defecto y elimina la cookie guardada.
  const restablecer = useCallback(() => {
    omitirGuardadoSiguienteEfecto.current = true;
    if (puedeGuardar("preferencias")) borrarCookieAccesibilidad();

    // Contraste y movimiento vuelven a lo que pide el sistema; el resto, a su valor base.
    const sistema = leerPreferenciasSistema();
    setTamanoTexto(TAMANO_TEXTO_BASE);
    setAltoContraste(sistema.altoContraste);
    setReducirMovimiento(sistema.reducirMovimiento);
    setSubrayarEnlaces(false);
    setEspaciadoLectura(false);
  }, []);

  useLayoutEffect(() => {
    // [LOCAL] Aplica las preferencias al elemento raíz para que el CSS las use mediante atributos data-* y el tamaño de fuente.
    const raiz = document.documentElement;
    raiz.dataset.tamanoTexto = String(tamanoTexto);
    raiz.style.fontSize = `${tamanoTexto}%`;
    raiz.dataset.altoContraste = String(altoContraste);
    raiz.dataset.reducirMovimiento = String(reducirMovimiento);
    raiz.dataset.subrayarEnlaces = String(subrayarEnlaces);
    raiz.dataset.espaciadoLectura = String(espaciadoLectura);

    // [LOCAL] Solo persiste ajustes cuando las preferencias fueron consentidas.
    if (!puedeGuardar("preferencias")) {
      // Sin consentimiento: limpia la marca y elimina cualquier cookie previa.
      omitirGuardadoSiguienteEfecto.current = false;
      if (cookieAccesibilidadExiste()) borrarCookieAccesibilidad();
      return;
    }

    // Tras restablecer: no guarda los valores por defecto, deja la cookie borrada.
    if (omitirGuardadoSiguienteEfecto.current) {
      omitirGuardadoSiguienteEfecto.current = false;
      borrarCookieAccesibilidad();
      return;
    }

    guardarPreferenciasAccesibilidad({
      tamanoTexto,
      altoContraste,
      reducirMovimiento,
      subrayarEnlaces,
      espaciadoLectura,
    });
  }, [
    consentimientoCrudo,
    tamanoTexto,
    altoContraste,
    reducirMovimiento,
    subrayarEnlaces,
    espaciadoLectura,
  ]);

  return {
    tamanoTexto,
    altoContraste,
    reducirMovimiento,
    subrayarEnlaces,
    espaciadoLectura,
    ajustarTamanoTexto,
    setAltoContraste,
    setReducirMovimiento,
    setSubrayarEnlaces,
    setEspaciadoLectura,
    restablecer,
    // Consulta en el momento de la llamada si hay consentimiento para guardar preferencias.
    puedeGuardar: () => puedeGuardar("preferencias"),
  };
}