// RESPONSABILIDAD: Gestiona solicitud de código y cambio de clave sin persistir secretos.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  cambiarClaveRecuperacion,
  solicitarCodigoRecuperacion,
} from "../services/sesion.js";

function erroresDeValidacion(datos) {
  const errores = {};
  const agregar = (campo, mensaje) => {
    const nombre = ({ email: "correo", password: "clave" })[campo] ?? campo;
    if (["correo", "codigo", "clave"].includes(nombre) && typeof mensaje === "string") {
      errores[nombre] = mensaje;
    }
  };

  if (Array.isArray(datos?.detail)) {
    datos.detail.forEach((detalle) => {
      const campo = Array.isArray(detalle?.loc) ? detalle.loc.at(-1) : detalle?.campo;
      agregar(campo, detalle?.msg ?? detalle?.mensaje);
    });
    return errores;
  }

  const detalle = datos?.errores ?? datos?.errors;
  if (detalle && typeof detalle === "object" && !Array.isArray(detalle)) {
    Object.entries(detalle).forEach(([campo, valor]) => {
      agregar(campo, typeof valor === "string" ? valor : valor?.mensaje ?? valor?.msg);
    });
  } else if (Array.isArray(detalle)) {
    detalle.forEach((item) => {
      agregar(item?.campo ?? item?.field, item?.mensaje ?? item?.message);
    });
  }
  return errores;
}

function codigoDeError(datos) {
  return datos?.error ?? datos?.codigo ?? datos?.detail;
}

export function useRecuperacion() {
  const [cargando, setCargando] = useState(false);
  const [paso, setPaso] = useState("correo");
  const [error, setError] = useState(null);
  const [erroresCampos, setErroresCampos] = useState({});
  const [codigoDePrueba, setCodigoDePrueba] = useState(null);
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

  const ejecutar = useCallback(async (solicitud) => {
    if (enCurso.current) return null;
    enCurso.current = true;
    controlador.current = new AbortController();
    setCargando(true);
    setError(null);
    setErroresCampos({});
    try {
      return await solicitud({ signal: controlador.current.signal });
    } catch (errorSolicitud) {
      if (errorSolicitud?.name === "AbortError" || !montado.current) return null;
      if (errorSolicitud instanceof TypeError) {
        setError("conexion");
      } else if (errorSolicitud?.status === 400) {
        const codigoError = codigoDeError(errorSolicitud.datos);
        if (codigoError === "codigo_vencido") setError("codigoVencido");
        else if (codigoError === "codigo_incorrecto") setError("codigoIncorrecto");
        else setError("general");
      } else if (errorSolicitud?.status === 409) {
        setError(codigoDeError(errorSolicitud.datos) === "cuenta_de_prueba" ? "cuentaPrueba" : "general");
      } else if (errorSolicitud?.status === 422) {
        setErroresCampos(erroresDeValidacion(errorSolicitud.datos));
        setError("validacion");
      } else {
        setError("general");
      }
      return null;
    } finally {
      enCurso.current = false;
      controlador.current = null;
      if (montado.current) setCargando(false);
    }
  }, []);

  const solicitarCodigo = useCallback(async (correo) => {
    const resultado = await ejecutar(({ signal }) => solicitarCodigoRecuperacion(correo, { signal }));
    if (!resultado || !montado.current) return false;
    setCodigoDePrueba(resultado.codigoDePrueba);
    setPaso("codigo");
    return true;
  }, [ejecutar]);

  const cambiarClave = useCallback(async (correo, codigo, clave) => {
    const resultado = await ejecutar(({ signal }) => cambiarClaveRecuperacion(correo, codigo, clave, { signal }));
    if (!resultado || !montado.current) return false;
    setPaso("completado");
    setCodigoDePrueba(null);
    return true;
  }, [ejecutar]);

  const solicitarOtroCodigo = useCallback(() => {
    setPaso("correo");
    setError(null);
    setErroresCampos({});
    setCodigoDePrueba(null);
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
    setErroresCampos({});
  }, []);

  return {
    cargando,
    paso,
    error,
    erroresCampos,
    codigoDePrueba,
    solicitarCodigo,
    cambiarClave,
    solicitarOtroCodigo,
    limpiarError,
  };
}
