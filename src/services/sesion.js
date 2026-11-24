// RESPONSABILIDAD: Inicia una sesión y devuelve el contrato de autenticación de la API.
import { API_URL } from "../config.js";

const TIEMPO_MAXIMO_SESION_MS = 15000;

export async function iniciarSesion(correo, clave, { signal } = {}) {
  const apiBase = API_URL.replace(/\/+$/, "");
  const controlador = new AbortController();
  let vencioTiempo = false;
  const cancelarPorFuera = () => controlador.abort();
  if (signal?.aborted) controlador.abort();
  else signal?.addEventListener("abort", cancelarPorFuera, { once: true });
  const limite = setTimeout(() => {
    vencioTiempo = true;
    controlador.abort();
  }, TIEMPO_MAXIMO_SESION_MS);

  try {
    const respuesta = await fetch(`${apiBase}/sesion`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, clave }),
      signal: controlador.signal,
    });

    let datos = null;
    try {
      datos = await respuesta.json();
    } catch (errorJson) {
      if (controlador.signal.aborted) throw errorJson;
      // Algunas respuestas pueden no incluir un cuerpo JSON válido.
    }

    if (!respuesta.ok) {
      const error = new Error(`HTTP ${respuesta.status}`);
      error.status = respuesta.status;
      error.datos = datos;
      error.retryAfter = respuesta.headers.get("Retry-After");
      throw error;
    }

    if (!datos || typeof datos !== "object" || !datos.usuario || typeof datos.token !== "string") {
      const error = new Error("Respuesta de sesión incompleta.");
      error.status = 502;
      throw error;
    }

    return datos;
  } catch (error) {
    if (signal?.aborted || error?.name === "AbortError" && !vencioTiempo) throw error;
    if (vencioTiempo || error instanceof TypeError) {
      const errorConexion = new Error(vencioTiempo ? "Tiempo de espera agotado al iniciar sesión." : "No se recibió respuesta de la API.");
      errorConexion.code = "ERROR_CONEXION";
      errorConexion.cause = error;
      throw errorConexion;
    }
    throw error;
  } finally {
    clearTimeout(limite);
    signal?.removeEventListener("abort", cancelarPorFuera);
  }
}

async function solicitarRecuperacion(ruta, cuerpo, signal) {
  const apiBase = API_URL.replace(/\/+$/, "");
  const respuesta = await fetch(`${apiBase}${ruta}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cuerpo),
    signal,
  });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    // Los errores HTTP también pueden llegar sin cuerpo JSON.
  }

  if (!respuesta.ok) {
    const error = new Error(`HTTP ${respuesta.status}`);
    error.status = respuesta.status;
    error.datos = datos;
    throw error;
  }

  return datos;
}

export async function solicitarCodigoRecuperacion(correo, { signal } = {}) {
  const datos = await solicitarRecuperacion("/recuperacion", { correo }, signal);
  if (!datos || typeof datos.enviadaA !== "string" || typeof datos.codigoDePrueba !== "string") {
    const error = new Error("Respuesta de recuperación incompleta.");
    error.status = 502;
    throw error;
  }
  return datos;
}

export async function cambiarClaveRecuperacion(correo, codigo, clave, { signal } = {}) {
  const datos = await solicitarRecuperacion(
    "/recuperacion/nueva-clave",
    { correo, codigo, clave },
    signal,
  );
  if (datos?.claveActualizada !== true) {
    const error = new Error("La API no confirmó el cambio de contraseña.");
    error.status = 502;
    throw error;
  }
  return datos;
}
