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

export const TAMANO_TEXTO_BASE = 100;
export const PASO_TAMANO_TEXTO = 10;
export const TAMANO_TEXTO_MINIMO = 80;
export const TAMANO_TEXTO_MAXIMO = 150;

const NOMBRE_COOKIE = "accesibilidad";
const DURACION_COOKIE_SEGUNDOS = 60 * 60 * 24 * 365;

function leerPreferenciasSistema() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return { altoContraste: false, reducirMovimiento: false };
  }

  return {
    altoContraste: window.matchMedia("(prefers-contrast: more)").matches,
    reducirMovimiento: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
  };
}

function leerCookieAccesibilidad(puedeLeer) {
  if (!puedeLeer || typeof document === "undefined") return null;

  const prefijo = `${NOMBRE_COOKIE}=`;
  const cookie = document.cookie
    .split("; ")
    .find((parte) => parte.startsWith(prefijo));
  if (!cookie) return null;

  try {
    const preferencias = JSON.parse(
      decodeURIComponent(cookie.slice(prefijo.length)),
    );
    if (!preferencias || typeof preferencias !== "object" || Array.isArray(preferencias)) {
      return null;
    }

    const guardadas = {};
    const tamanoTexto = preferencias.tamanoTexto;

    if (
      Number.isInteger(tamanoTexto) &&
      tamanoTexto >= TAMANO_TEXTO_MINIMO &&
      tamanoTexto <= TAMANO_TEXTO_MAXIMO
    ) {
      guardadas.tamanoTexto = tamanoTexto;
    }

    ["altoContraste", "reducirMovimiento", "subrayarEnlaces", "espaciadoLectura"].forEach(
      (preferencia) => {
        if (typeof preferencias[preferencia] === "boolean") {
          guardadas[preferencia] = preferencias[preferencia];
        }
      },
    );

    return Object.keys(guardadas).length > 0 ? guardadas : null;
  } catch {
    return null;
  }
}

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

function cookieAccesibilidadExiste() {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((parte) => parte.startsWith(`${NOMBRE_COOKIE}=`));
}

function borrarCookieAccesibilidad() {
  document.cookie = `${NOMBRE_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0${obtenerAtributoSecureCookie()}`;
}

function guardarPreferenciasAccesibilidad(preferencias) {
  document.cookie = `${NOMBRE_COOKIE}=${encodeURIComponent(
    JSON.stringify(preferencias),
  )}; Path=/; SameSite=Lax; Max-Age=${DURACION_COOKIE_SEGUNDOS}${obtenerAtributoSecureCookie()}`;
}

export function useAccesibilidad() {
  const consentimientoCrudo = useSyncExternalStore(
    suscribirseAConsentimiento,
    obtenerConsentimientoCrudo,
    () => null,
  );
  const consentimiento = useMemo(
    () => leerConsentimiento(consentimientoCrudo),
    [consentimientoCrudo],
  );
  const iniciales = useMemo(
    () => obtenerPreferenciasIniciales(consentimiento?.categorias.preferencias === true),
    [consentimiento],
  );
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
  const omitirGuardadoSiguienteEfecto = useRef(false);

  const ajustarTamanoTexto = useCallback((cambio) => {
    setTamanoTexto((actual) =>
      Math.min(
        TAMANO_TEXTO_MAXIMO,
        Math.max(TAMANO_TEXTO_MINIMO, actual + cambio),
      ),
    );
  }, []);

  const restablecer = useCallback(() => {
    omitirGuardadoSiguienteEfecto.current = true;
    if (puedeGuardar("preferencias")) borrarCookieAccesibilidad();

    const sistema = leerPreferenciasSistema();
    setTamanoTexto(TAMANO_TEXTO_BASE);
    setAltoContraste(sistema.altoContraste);
    setReducirMovimiento(sistema.reducirMovimiento);
    setSubrayarEnlaces(false);
    setEspaciadoLectura(false);
  }, []);

  useLayoutEffect(() => {
    const raiz = document.documentElement;
    raiz.dataset.tamanoTexto = String(tamanoTexto);
    raiz.style.fontSize = `${tamanoTexto}%`;
    raiz.dataset.altoContraste = String(altoContraste);
    raiz.dataset.reducirMovimiento = String(reducirMovimiento);
    raiz.dataset.subrayarEnlaces = String(subrayarEnlaces);
    raiz.dataset.espaciadoLectura = String(espaciadoLectura);

    if (!puedeGuardar("preferencias")) {
      omitirGuardadoSiguienteEfecto.current = false;
      if (cookieAccesibilidadExiste()) borrarCookieAccesibilidad();
      return;
    }

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
    puedeGuardar: () => puedeGuardar("preferencias"),
  };
}
