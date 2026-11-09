// RESPONSABILIDAD: Lee, valida y actualiza el consentimiento almacenado en cookies.

// [STATIC] Configuración fija de la cookie: nombre, versión del formato y duración (un año en segundos).
const NOMBRE_COOKIE_CONSENTIMIENTO = "consentimiento";
const VERSION_CONSENTIMIENTO = 1;
const DURACION_COOKIE_SEGUNDOS = 60 * 60 * 24 * 365;
// [STATIC] Categorías que debe contener un consentimiento válido.
const CATEGORIAS_REQUERIDAS = [
  "necesarias",
  "preferencias",
  "analiticas",
  "marketing",
];

// [LOCAL] Mantiene los componentes informados cuando cambia la cookie de consentimiento.
const suscriptores = new Set();

// Añade Secure solo si la página se sirve por HTTPS; sin location (fuera del navegador) no lo añade.
function obtenerAtributoSecure() {
  return typeof location !== "undefined" && location.protocol === "https:"
    ? "; Secure"
    : "";
}

export function obtenerConsentimientoCrudo() {
  // Devuelve null fuera del navegador, donde no existe document.
  if (typeof document === "undefined") return null;

  // Busca la cookie de consentimiento entre todas las cookies y devuelve su valor sin decodificar.
  const prefijo = `${NOMBRE_COOKIE_CONSENTIMIENTO}=`;
  const cookie = document.cookie
    .split("; ")
    .find((parte) => parte.startsWith(prefijo));

  return cookie ? cookie.slice(prefijo.length) : null;
}

// Por defecto lee la cookie actual; también acepta un valor crudo ya obtenido para validarlo.
export function leerConsentimiento(valorCrudo = obtenerConsentimientoCrudo()) {
  // Devuelve null si no hay un valor de texto que leer.
  if (typeof valorCrudo !== "string") return null;

  try {
    // Decodifica la cookie y convierte su contenido de JSON a objeto.
    const consentimiento = JSON.parse(decodeURIComponent(valorCrudo));

    // Acepta la fecha solo si es un ISO real: se compara con el resultado de toISOString para rechazar otros formatos.
    const fechaParseada =
      typeof consentimiento.fecha === "string"
        ? new Date(consentimiento.fecha)
        : null;
    const fechaValida =
      fechaParseada !== null &&
      Number.isFinite(fechaParseada.getTime()) &&
      fechaParseada.toISOString() === consentimiento.fecha;

    // Comprueba que cada categoría requerida exista y sea booleana.
    const categoriasValidas = CATEGORIAS_REQUERIDAS.every(
      (categoria) => typeof consentimiento.categorias?.[categoria] === "boolean",
    );

    // Invalida el consentimiento si la versión, la fecha o las categorías no son válidas, o si "necesarias" no es true.
    if (
      consentimiento.version !== VERSION_CONSENTIMIENTO ||
      !fechaValida ||
      !categoriasValidas ||
      consentimiento.categorias.necesarias !== true
    ) {
      return null;
    }

    // Devuelve solo los campos conocidos, descartando cualquier dato extra de la cookie.
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
    // [LOCAL] Descarta cookies malformadas y deja que la interfaz use sus valores iniciales.
    return null;
  }
}

// Avisa a todos los suscriptores de que la cookie cambió.
export function notificarCambioConsentimiento() {
  suscriptores.forEach((suscriptor) => suscriptor());
}

// Registra un suscriptor y devuelve la función para darlo de baja.
export function suscribirseAConsentimiento(suscriptor) {
  suscriptores.add(suscriptor);
  return () => suscriptores.delete(suscriptor);
}

// Sin argumentos, todas las categorías opcionales quedan en false.
export function guardarConsentimiento(categorias = {}) {
  // No hace nada fuera del navegador, donde no existe document.
  if (typeof document === "undefined") return;

  // Usa un objeto vacío si las categorías no son un objeto, para que las opcionales queden en false.
  const preferencias =
    categorias && typeof categorias === "object" ? categorias : {};

  // "necesarias" siempre es true; las demás categorías solo se activan si llegan exactamente en true.
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

  // Guarda la cookie codificada por un año, para todo el sitio (Path=/) y con SameSite=Lax; luego avisa del cambio.
  document.cookie = `${NOMBRE_COOKIE_CONSENTIMIENTO}=${encodeURIComponent(
    JSON.stringify(consentimiento),
  )}; Path=/; SameSite=Lax; Max-Age=${DURACION_COOKIE_SEGUNDOS}${obtenerAtributoSecure()}`;
  notificarCambioConsentimiento();
}

export function borrarConsentimiento() {
  // No hace nada fuera del navegador, donde no existe document.
  if (typeof document === "undefined") return;

  // Borra la cookie dejándola vencida con Max-Age=0 y avisa del cambio.
  document.cookie = `${NOMBRE_COOKIE_CONSENTIMIENTO}=; Path=/; SameSite=Lax; Max-Age=0${obtenerAtributoSecure()}`;
  notificarCambioConsentimiento();
}

// Acepta todas las categorías opcionales; "necesarias" se fuerza a true al guardar.
export function aceptarConsentimiento() {
  guardarConsentimiento({
    preferencias: true,
    analiticas: true,
    marketing: true,
  });
}

// Rechaza todas las categorías opcionales; "necesarias" se mantiene en true al guardar.
export function rechazarConsentimiento() {
  guardarConsentimiento({
    preferencias: false,
    analiticas: false,
    marketing: false,
  });
}

// Devuelve true solo si hay un consentimiento válido y la categoría fue aceptada.
export function puedeGuardar(categoria) {
  return leerConsentimiento()?.categorias?.[categoria] === true;
}

// Expone el atributo Secure fuera de este módulo.
export function obtenerAtributoSecureCookie() {
  return obtenerAtributoSecure();
}