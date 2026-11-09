// RESPONSABILIDAD: Dibuja los iconos reutilizables de la interfaz.

// [STATIC] Trazos SVG de cada icono, indexados por nombre y dibujados en una cuadrícula de 24x24.
const TRAZOS = {
  buscar: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  cerrar: <path d="m6 6 12 12M6 18 18 6" />,
  menos: <path d="M5 12h14" />,
  mas: <path d="M12 5v14M5 12h14" />,
  favoritos: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  idioma: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18Z" /></>,
  accesibilidad: <><circle cx="12" cy="4" r="2" /><path d="M4 8h16M12 6v8m0 0-4 7m4-7 4 7" /></>,
};

// Props: nombre elige el icono de TRAZOS; si no existe, el svg se muestra vacío.
export default function Icono({ nombre }) {
  // [ACCESIBILIDAD] Mantiene el icono fuera del nombre anunciado por su control contenedor y evita que reciba foco.
  // Usa currentColor para heredar el color del texto del control que lo contiene.
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{TRAZOS[nombre]}</svg>;
}