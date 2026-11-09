import { useId } from "react";

const COLOR_FONDO_PREDETERMINADO = "var(--fondo-sutil)";
const COLOR_FIGURA_PREDETERMINADO = "var(--marca-secundario)";
const COLOR_DETALLE_PREDETERMINADO = "var(--marca-primario)";

function colorValido(color, predeterminado) {
  return typeof color === "string" && /^#[\da-f]{6}$/i.test(color)
    ? color
    : predeterminado;
}

function FiguraColina({ figura, detalle }) {
  return (
    <>
      <circle cx="50" cy="86" r="34" fill={figura} />
      <circle cx="77" cy="23" r="11" fill={detalle} />
    </>
  );
}

function FiguraPuntos({ figura, detalle }) {
  const posiciones = [23, 50, 77];

  return posiciones.flatMap((y, fila) =>
    posiciones.map((x, columna) => {
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

function FiguraAnillos({ figura, fondo }) {
  return (
    <>
      <circle cx="100" cy="100" r="85" fill={figura} />
      <circle cx="100" cy="100" r="63" fill={fondo} />
      <circle cx="100" cy="100" r="40" fill={figura} />
    </>
  );
}

const FIGURA_POR_NOMBRE = {
  colina: FiguraColina,
  puntos: FiguraPuntos,
  rayas: FiguraRayas,
  anillos: FiguraAnillos,
};

export default function PortadaAlbum({ portada }) {
  const idPatron = `portada-album-rayas-${useId().replaceAll(":", "")}`;
  const fondo = colorValido(portada?.fondo, COLOR_FONDO_PREDETERMINADO);
  const figura = colorValido(portada?.figura, COLOR_FIGURA_PREDETERMINADO);
  const detalle = colorValido(portada?.detalle, COLOR_DETALLE_PREDETERMINADO);
  const nombreConFigura = Object.hasOwn(FIGURA_POR_NOMBRE, portada?.nombre);
  const Figura = nombreConFigura ? FIGURA_POR_NOMBRE[portada.nombre] : null;

  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="100" height="100" fill={fondo} />
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

