// RESPONSABILIDAD: Carga y valida los textos del navbar por idioma.
import { useEffect, useState } from "react";
import { API_URL } from "../config";

// [STATIC] Endpoint de textos construido a partir de la URL base de configuración.
const API = `${API_URL}/textos`;

// Verifica que la respuesta traiga todos los textos obligatorios y devuelve solo los que usa el navbar.
function validarTextos(datos) {
  // Separa las secciones de la respuesta para acceder a ellas con optional chaining.
  const textos = datos?.textos;
  const nav = textos?.navbar;
  const menu = textos?.menuMovil;

  // Etiquetas obligatorias del navbar de escritorio, el idioma y el menú móvil.
  const etiquetas = [
    nav?.logo?.texto,
    nav?.logo?.aria,
    nav?.aria?.navegacion,
    nav?.aria?.idioma,
    nav?.enlaces?.catalogo,
    nav?.enlaces?.inicio,
    nav?.botones?.invitado?.ingresar,
    nav?.botones?.invitado?.crearCuenta,
    textos?.idioma?.codigos?.es,
    textos?.idioma?.codigos?.en,
    menu?.abrir,
    menu?.cerrar,
    menu?.aria,
    menu?.secciones?.idioma,
    menu?.botones?.invitado?.ingresar,
    menu?.botones?.invitado?.crearCuenta,
  ];

  // Rechaza la respuesta si alguna etiqueta falta, no es texto o está vacía.
  if (!etiquetas.every((valor) => typeof valor === "string" && valor.trim())) {
    throw new Error("La respuesta no contiene los textos del navbar.");
  }

  // Devuelve únicamente las secciones que consume el navbar.
  return {
    navbar: textos.navbar,
    menuMovil: textos.menuMovil,
    idioma: { codigos: textos.idioma.codigos },
  };
}

export function useTextosNavbar(idioma) {
  // [LOCAL] Estado de la carga: textos, indicador de carga, error y contador para reintentar.
  const [textos, setTextos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  // Vuelve a cargar los textos cuando cambia el idioma o se pide un reintento.
  useEffect(() => {
    // [LOCAL] Cancela la solicitud si cambia el idioma, se desmonta el hook o vence el plazo.
    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 12000);
    // Evita actualizar el estado con la respuesta de una solicitud que ya no corresponde.
    let vigente = true;

    // Reinicia el estado antes de cada carga para no mostrar textos o errores anteriores.
    setCargando(true);
    setError(false);
    setTextos(null);

    async function cargarTextosNavbar() {
      try {
        // [API] Obtiene los textos del idioma actual y valida las etiquetas obligatorias.
        const respuesta = await fetch(`${API}?idioma=${idioma}`, {
          signal: controlador.signal,
        });
        // Trata cualquier respuesta HTTP no exitosa como un fallo de carga.
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const datos = await respuesta.json();
        const nuevosTextos = validarTextos(datos);
        // Guarda los textos solo si la solicitud sigue vigente.
        if (vigente) setTextos(nuevosTextos);
      } catch (errorCarga) {
        // Registra el fallo y activa el estado de error solo si la solicitud sigue vigente.
        if (vigente) {
          console.error("Error al cargar los textos:", errorCarga);
          setError(true);
        }
      } finally {
        // Libera el plazo y apaga el indicador de carga, salvo que la solicitud ya sea obsoleta.
        clearTimeout(limite);
        if (vigente) setCargando(false);
      }
    }

    cargarTextosNavbar();

    // Al limpiar el efecto, invalida la solicitud en curso y cancela el plazo y el fetch.
    return () => {
      vigente = false;
      clearTimeout(limite);
      controlador.abort();
    };
  }, [idioma, intento]);

  // [LOCAL] recargar incrementa el contador de intentos para volver a ejecutar el efecto.
  return {
    textos,
    cargando,
    error,
    recargar: () => setIntento((valor) => valor + 1),
  };
}