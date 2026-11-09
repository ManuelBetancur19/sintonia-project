// RESPONSABILIDAD: Dibuja la portada de un álbum con sus colores disponibles.
import { useId } from "react";

// Colores de respaldo con tokens del diseño, para cuando la portada no trae un color válido.
const COLOR_FONDO_PREDETERMINADO = "var(--fondo-sutil)";
const COLOR_FIGURA_PREDETERMINADO = "var(--marca-secundario)";
const COLOR_DETALLE_PREDETERMINADO = "var(--marca-primario)";

// [LOCAL] Rechaza colores ajenos al formato hexadecimal y usa el token de respaldo.
function colorValido(color, predeterminado) {
  return typeof color === "string" && /^#[\da-f]{6}$/i.test(color)
    ? color
    : predeterminado;
}

// Círculo grande que asoma desde abajo, con un círculo pequeño de detalle arriba a la derecha.
function FiguraColina({ figura, detalle }) {
  return (
    <>
      <circle cx="50" cy="86" r="34" fill={figura} />
      <circle cx="77" cy="23" r="11" fill={detalle} />
    </>
  );
}

// Cuadrícula de 3×3 puntos; las dos diagonales usan el color de detalle.
function FiguraPuntos({ figura, detalle }) {
  const posiciones = [23, 50, 77];

  return posiciones.flatMap((y, fila) =>
    posiciones.map((x, columna) => {
      // Una posición está en una diagonal si fila y columna coinciden o suman 2.
      const esDetalle = fila === columna || fila + columna === 2;
      return (
        <circle
          key={`${fila}-${columna}`}
          cx={x}
          cy={y}
          r="9"
          fill={esDetalle ? detalle : figura}
        />
      );
    }),
  );
}

// Rayas diagonales hechas con un patrón SVG rotado 45° que rellena toda la portada.
function FiguraRayas({ figura, idPatron }) {
  return (
    <>
      <defs>
        <pattern
          id={idPatron}
          width="20"
          height="20"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <rect width="9" height="20" fill={figura} />
        </pattern>
      </defs>
      <rect width="100" height="100" fill={`url(#${idPatron})`} />
    </>
  );
}

// Tres círculos concéntricos; el del medio usa el color de fondo para dibujar el anillo.
function FiguraAnillos({ figura, fondo }) {
  return (
    <>
      <circle cx="100" cy="100" r="85" fill={figura} />
      <circle cx="100" cy="100" r="63" fill={fondo} />
      <circle cx="100" cy="100" r="40" fill={figura} />
    </>
  );
}

// [STATIC] Asocia los nombres de figura de la API con su dibujo SVG.
const FIGURA_POR_NOMBRE = {
  colina: FiguraColina,
  puntos: FiguraPuntos,
  rayas: FiguraRayas,
  anillos: FiguraAnillos,
};

export default function PortadaAlbum({ portada }) {
  // Id único para el patrón de rayas; se quitan los ":" de useId porque rompen la referencia url(#id) de SVG.
  const idPatron = `portada-album-rayas-${useId().replaceAll(":", "")}`;

  // Cada color cae al token de respaldo si falta o no es un hexadecimal válido.
  const fondo = colorValido(portada?.fondo, COLOR_FONDO_PREDETERMINADO);
  const figura = colorValido(portada?.figura, COLOR_FIGURA_PREDETERMINADO);
  const detalle = colorValido(portada?.detalle, COLOR_DETALLE_PREDETERMINADO);

  // Object.hasOwn evita que nombres como "constructor" se tomen por una figura.
  const nombreConFigura = Object.hasOwn(FIGURA_POR_NOMBRE, portada?.nombre);
  const Figura = nombreConFigura ? FIGURA_POR_NOMBRE[portada.nombre] : null;

  // [ACCESIBILIDAD] Marca la portada como decorativa para lectores de pantalla y teclado.
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="100" height="100" fill={fondo} />
      {/* Sin figura reconocida, la portada queda solo con el color de fondo.
          Todas las figuras reciben las mismas props y toman solo las que usan. */}
      {Figura ? (
        <Figura
          figura={figura}
          detalle={detalle}
          fondo={fondo}
          idPatron={idPatron}
        />
      ) : null}
    </svg>
  );
}