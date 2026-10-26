// Hook que carga desde la API los textos del navbar según el
// idioma, validando la respuesta y manejando carga, error y reintento.
// ============================================================

import { useEffect, useState } from "react";
import { API_URL } from "../config";

// Endpoint
const API = `${API_URL}/textos`;

// ------------------------------------------------------------
// VALIDACIÓN
// ------------------------------------------------------------

// Verifica que la respuesta de la API traiga todos los textos que
// necesitan el navbar y el menú móvil. Devuelve solo las secciones
// del navbar (navbar, menuMovil e idioma.codigos), o lanza un error
// si falta alguno o está vacío.
function validarTextos(datos) {
  const textos = datos?.textos;
  const nav = textos?.navbar;
  const menu = textos?.menuMovil;

  // Lista de todos los textos obligatorios
  const etiquetas = [
    nav?.logo?.texto,
    nav?.logo?.aria,
    nav?.aria?.navegacion,
    nav?.aria?.idioma,
    /* nav?.aria?.accesibilidad, */ // ACCESIBILIDAD
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

  // Cada valor debe ser un string que no esté vacío
  if (!etiquetas.every((valor) => typeof valor === "string" && valor.trim())) {
    throw new Error("La respuesta no contiene los textos del navbar.");
  }

  return {
    navbar: textos.navbar,
    menuMovil: textos.menuMovil,
    idioma: { codigos: textos.idioma.codigos },
  };
}

// ------------------------------------------------------------
// HOOK PRINCIPAL
// ------------------------------------------------------------

// Devuelve: { textos, cargando, error, recargar }
//   - textos:   textos validados, o null si aún no hay
//   - cargando: true mientras se hace la petición
//   - error:    true si la petición o la validación fallaron
//   - recargar: función para volver a intentar la petición
export function useTextosNavbar(idioma) {
  // --- Estados ---
  const [textos, setTextos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0); // Cambiarlo dispara una nueva petición

  // --- Efecto: pide los textos cuando cambia el idioma o el intento ---
  useEffect(() => {
    // Permite cancelar el fetch (por cambio de idioma, desmontaje o timeout)
    const controlador = new AbortController();

    // Si la API tarda más de 12 segundos, se cancela la petición
    const limite = setTimeout(() => controlador.abort(), 12000);

    // Evita actualizar el estado con respuestas viejas o tras desmontar
    let vigente = true;

    // Reinicia el estado antes de cada petición
    setCargando(true);
    setError(false);
    setTextos(null);

    // Hace la petición, valida la respuesta y actualiza el estado
    async function cargarTextosNavbar() {
      try {
        const respuesta = await fetch(`${API}?idioma=${idioma}`, {
          signal: controlador.signal,
        });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        //Si si respondio los datos correctamente
        const datos = await respuesta.json();
        const nuevosTextos = validarTextos(datos);
        if (vigente) setTextos(nuevosTextos);
      } catch (error) {
        // Solo se reporta el error si esta petición sigue siendo la vigente
        if (vigente) {
          console.error("Error al cargar los textos:", error);
          setError(true);
        }
      } finally {
        // Se limpia el timeout y se apaga el estado de carga
        clearTimeout(limite);
        if (vigente) setCargando(false);
      }
    }

    cargarTextosNavbar();

    // --- Limpieza: se ejecuta al cambiar idioma/intento o al desmontar ---
    return () => {
      vigente = false;
      clearTimeout(limite);
      controlador.abort();
    };
  }, [idioma, intento]);

  // --- Valor devuelto por el hook ---
  return {
    textos,
    cargando,
    error,
    // Incrementa `intento` para volver a lanzar el efecto
    recargar: () => setIntento((valor) => valor + 1),
  };
}