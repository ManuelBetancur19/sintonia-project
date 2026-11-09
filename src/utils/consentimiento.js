const NOMBRE_COOKIE_CONSENTIMIENTO = "consentimiento";
const VERSION_CONSENTIMIENTO = 1;
const DURACION_COOKIE_SEGUNDOS = 60 * 60 * 24 * 365;
const CATEGORIAS_REQUERIDAS = [
  "necesarias",
  "preferencias",
  "analiticas",
  "marketing",
];

const suscriptores = new Set();

function obtenerAtributoSecure() {
  return typeof location !== "undefined" && location.protocol === "https:"
    ? "; Secure"
    : "";
}

export function obtenerConsentimientoCrudo() {
  if (typeof document === "undefined") return null;

  const prefijo = `${NOMBRE_COOKIE_CONSENTIMIENTO}=`;
  const cookie = document.cookie
    .split("; ")
    .find((parte) => parte.startsWith(prefijo));

  return cookie ? cookie.slice(prefijo.length) : null;
}

export function leerConsentimiento(valorCrudo = obtenerConsentimientoCrudo()) {
  if (typeof valorCrudo !== "string") return null;

  try {
    const consentimiento = JSON.parse(decodeURIComponent(valorCrudo));
    const fechaParseada =
      typeof consentimiento.fecha === "string"
        ? new Date(consentimiento.fecha)
        : null;
    const fechaValida =
      fechaParseada !== null &&
      Number.isFinite(fechaParseada.getTime()) &&
      fechaParseada.toISOString() === consentimiento.fecha;
    const categoriasValidas = CATEGORIAS_REQUERIDAS.every(
      (categoria) => typeof consentimiento.categorias?.[categoria] === "boolean",
    );

    if (
      consentimiento.version !== VERSION_CONSENTIMIENTO ||
      !fechaValida ||
      !categoriasValidas ||
      consentimiento.categorias.necesarias !== true
    ) {
      return null;
    }

    return {
      version: VERSION_CONSENTIMIENTO,
      fecha: consentimiento.fecha,
      categorias: Object.fromEntries(
        CATEGORIAS_REQUERIDAS.map((categoria) => [
          categoria,
          consentimiento.categorias[categoria],
        ]),
      ),
    };
  } catch {
    return null;
  }
}

export function notificarCambioConsentimiento() {
  suscriptores.forEach((suscriptor) => suscriptor());
}

export function suscribirseAConsentimiento(suscriptor) {
  suscriptores.add(suscriptor);
  return () => suscriptores.delete(suscriptor);
}

export function guardarConsentimiento(categorias = {}) {
  if (typeof document === "undefined") return;

  const preferencias =
    categorias && typeof categorias === "object" ? categorias : {};

  const consentimiento = {
    version: VERSION_CONSENTIMIENTO,
    fecha: new Date().toISOString(),
    categorias: Object.fromEntries(
      CATEGORIAS_REQUERIDAS.map((categoria) => [
        categoria,
        categoria === "necesarias" ? true : preferencias[categoria] === true,
      ]),
    ),
  };

  document.cookie = `${NOMBRE_COOKIE_CONSENTIMIENTO}=${encodeURIComponent(
    JSON.stringify(consentimiento),
  )}; Path=/; SameSite=Lax; Max-Age=${DURACION_COOKIE_SEGUNDOS}${obtenerAtributoSecure()}`;
  notificarCambioConsentimiento();
}

export function borrarConsentimiento() {
  if (typeof document === "undefined") return;

  document.cookie = `${NOMBRE_COOKIE_CONSENTIMIENTO}=; Path=/; SameSite=Lax; Max-Age=0${obtenerAtributoSecure()}`;
  notificarCambioConsentimiento();
}

export function aceptarConsentimiento() {
  guardarConsentimiento({
    preferencias: true,
    analiticas: true,
    marketing: true,
  });
}

export function rechazarConsentimiento() {
  guardarConsentimiento({
    preferencias: false,
    analiticas: false,
    marketing: false,
  });
}

export function puedeGuardar(categoria) {
  return leerConsentimiento()?.categorias?.[categoria] === true;
}

export function obtenerAtributoSecureCookie() {
  return obtenerAtributoSecure();
}
