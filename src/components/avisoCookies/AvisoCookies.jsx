import { useId } from "react";
import "./AvisoCookies.css";

export default function AvisoCookies({
  textos,
  decidido,
  aceptar,
  rechazar,
  referencia,
}) {
  const id = useId();

  if (!textos || decidido) return null;

  return (
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
