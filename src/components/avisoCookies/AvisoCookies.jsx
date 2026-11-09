// RESPONSABILIDAD: Presenta el aviso de cookies y sus acciones de decisión.
import { useId } from "react";
import "./AvisoCookies.css";

// `referencia` es el ref del contenedor del aviso, para que el componente padre pueda acceder a él.
// `aceptar` y `rechazar` registran la decisión; `decidido` indica que ya se tomó una.
export default function AvisoCookies({
  textos,
  decidido,
  aceptar,
  rechazar,
  referencia,
}) {
  // [ACCESIBILIDAD] Genera ids únicos para enlazar el título y el texto con la sección.
  const id = useId();

  // No renderiza el aviso sin textos o cuando el usuario ya tomó una decisión.
  if (!textos || decidido) return null;

  return (
    // [ACCESIBILIDAD] La región se nombra con el título y se describe con el texto del aviso.
    <section
      ref={referencia}
      className="aviso-cookies"
      role="region"
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-texto`}
    >
      <div className="aviso-cookies-copia">
        <h2 className="titular-h4" id={`${id}-titulo`}>
          {textos.titulo}
        </h2>
        <p className="cuerpo-p" id={`${id}-texto`}>
          {textos.texto}
        </p>
      </div>

      {/* Rechazar va antes que aceptar; el estilo destaca la acción de aceptar. */}
      <div className="aviso-cookies-acciones">
        <button
          className="aviso-cookies-boton-secundario"
          type="button"
          onClick={rechazar}
        >
          {textos.botones.rechazar}
        </button>
        <button
          className="aviso-cookies-boton-primario"
          type="button"
          onClick={aceptar}
        >
          {textos.botones.aceptar}
        </button>
      </div>
    </section>
  );
}