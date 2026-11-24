// RESPONSABILIDAD: Gestiona envío, errores, espera por límite de intentos y sesión temporal.
import { useCallback, useEffect, useRef, useState } from "react";
import { iniciarSesion as solicitarSesion } from "../services/sesion.js";

const CLAVE_SESION = "sintonia.sesion";

function obtenerFechaReintento(valor) {
  if (typeof valor !== "string" || !valor.trim()) return null;

  const segundos = Number(valor);
  if (Number.isFinite(segundos) && segundos >= 0) {
    return Date.now() + segundos * 1000;
  }

  const fecha = Date.parse(valor);
  return Number.isFinite(fecha) ? fecha : null;
}

function normalizarCampo(campo) {
  if (["correo", "email"].includes(campo)) return "correo";
  if (["clave", "password"].includes(campo)) return "clave";
  return null;
}

function obtenerErroresCampos(datos) {
  const errores = {};
  const agregar = (campo, mensaje) => {
    const campoNormalizado = normalizarCampo(campo);
    if (campoNormalizado && typeof mensaje === "string" && mensaje.trim()) {
      errores[campoNormalizado] = mensaje;
    }
  };

  if (Array.isArray(datos?.detail)) {
    datos.detail.forEach((detalle) => {
      const ubicacion = Array.isArray(detalle?.loc) ? detalle.loc.at(-1) : detalle?.campo;
      agregar(ubicacion, detalle?.msg ?? detalle?.mensaje);
    });
    return errores;
  }

  const detalle = datos?.errores ?? datos?.errors;
  if (detalle && typeof detalle === "object" && !Array.isArray(detalle)) {
    Object.entries(detalle).forEach(([campo, mensaje]) => {
      agregar(campo, typeof mensaje === "string" ? mensaje : mensaje?.mensaje ?? mensaje?.msg);
    });
  } else if (Array.isArray(detalle)) {
    detalle.forEach((item) => agregar(item?.campo ?? item?.field, item?.mensaje ?? item?.message));
  }

  return errores;
}

export function useSesion() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [erroresCampos, setErroresCampos] = useState({});
  const [reintentarEn, setReintentarEn] = useState(null);
  const [ahora, setAhora] = useState(Date.now());
  const [usuario, setUsuario] = useState(null);
  const [iniciada, setIniciada] = useState(false);
  const [recordarSesion, setRecordarSesion] = useState(false);
  const enCurso = useRef(false);
  const controlador = useRef(null);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      controlador.current?.abort();
    };
  }, []);

  useEffect(() => {
    try {
      const permanente = window.localStorage.getItem(CLAVE_SESION);
      const temporal = window.sessionStorage.getItem(CLAVE_SESION);
      const guardada = permanente ?? temporal;
      if (!guardada) return;
      const sesion = JSON.parse(guardada);
      if (sesion?.usuario && typeof sesion.token === "string") {
        setUsuario(sesion.usuario);
        setIniciada(true);
        setRecordarSesion(Boolean(permanente));
      }
    } catch {
      // Si el almacenamiento de sesión no está disponible, se mantiene el formulario utilizable.
    }
  }, []);

  useEffect(() => {
    if (!reintentarEn) return undefined;
    const actualizarEspera = () => {
      const momento = Date.now();
      setAhora(momento);
      if (momento >= reintentarEn) setReintentarEn(null);
    };
    const intervalo = window.setInterval(actualizarEspera, 1000);
    return () => window.clearInterval(intervalo);
  }, [reintentarEn]);

  const segundosBloqueo = reintentarEn
    ? Math.max(0, Math.ceil((reintentarEn - ahora) / 1000))
    : 0;

  const limpiarError = useCallback(() => {
    setError(null);
    setErroresCampos({});
  }, []);

  const limpiarErrorCampo = useCallback((campo) => {
    const restantes = { ...erroresCampos };
    delete restantes[campo];
    setErroresCampos(restantes);

    if (error === "validacion" && Object.keys(restantes).length === 0) {
      setError(null);
    } else if (["credenciales", "general"].includes(error)) {
      setError(null);
    }
  }, [error, erroresCampos]);

  const iniciar = useCallback(async (correo, clave, recordar = false) => {
    if (enCurso.current || segundosBloqueo > 0) return false;

    enCurso.current = true;
    controlador.current = new AbortController();
    setCargando(true);
    setError(null);
    setErroresCampos({});

    try {
      const datos = await solicitarSesion(correo, clave, { signal: controlador.current.signal });
      const sesion = { usuario: datos.usuario, token: datos.token };
      const almacenamientoElegido = recordar ? window.localStorage : window.sessionStorage;
      const almacenamientoAlternativo = recordar ? window.sessionStorage : window.localStorage;
      almacenamientoElegido.setItem(CLAVE_SESION, JSON.stringify(sesion));
      almacenamientoAlternativo.removeItem(CLAVE_SESION);
      if (montado.current) {
        setUsuario(datos.usuario);
        setIniciada(true);
        setRecordarSesion(Boolean(recordar));
        setReintentarEn(null);
      }
      return true;
    } catch (errorSolicitud) {
      if (errorSolicitud?.name === "AbortError") return false;
      if (!montado.current) return false;

      if (errorSolicitud?.status === 401) {
        setError("credenciales");
      } else if (errorSolicitud?.status === 422) {
        setErroresCampos(obtenerErroresCampos(errorSolicitud.datos));
        setError("validacion");
      } else if (errorSolicitud?.status === 429) {
        setError("limite");
        const fecha = obtenerFechaReintento(errorSolicitud.retryAfter);
        setReintentarEn(fecha);
        if (fecha) setAhora(Date.now());
      } else if (errorSolicitud?.code === "ERROR_CONEXION") {
        setError("conexion");
      } else {
        setError("general");
      }
      return false;
    } finally {
      enCurso.current = false;
      controlador.current = null;
      if (montado.current) setCargando(false);
    }
  }, [segundosBloqueo]);

  return {
    cargando,
    error,
    erroresCampos,
    segundosBloqueo,
    usuario,
    iniciada,
    recordarSesion,
    setRecordarSesion,
    iniciar,
    limpiarError,
    limpiarErrorCampo,
  };
}
