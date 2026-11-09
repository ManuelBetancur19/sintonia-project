import { useEffect, useId, useRef, useState } from "react";
import Icono from "../Icono/Icono.jsx";
import {
  PASO_TAMANO_TEXTO,
  TAMANO_TEXTO_MAXIMO,
  TAMANO_TEXTO_MINIMO,
} from "../../hooks/useAccesibilidad.js";
import "./PanelAccesibilidad.css";

function Interruptor({ id, etiqueta, ayuda, valor, alCambiar }) {
  const idAyuda = `${id}-ayuda`;

  return (
    <div className="navbar-accesibilidad-opcion">
      <div className="navbar-accesibilidad-copia">
        <label className="cuerpo-p-fuerte" htmlFor={id}>
          {etiqueta}
        </label>
        <p className="detalle-nota" id={idAyuda}>
          {ayuda}
        </p>
      </div>
      <span className="navbar-accesibilidad-switch">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={valor}
          aria-describedby={idAyuda}
          onChange={(evento) => alCambiar(evento.target.checked)}
        />
        <span className="navbar-accesibilidad-switch-pista" aria-hidden="true">
          <span />
        </span>
      </span>
    </div>
  );
}

export default function PanelAccesibilidad({
  textos,
  etiquetaMovil,
  ariaBoton,
  estado,
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);
  const boton = useRef(null);
  const dialogo = useRef(null);
  const estabaAbierto = useRef(false);
  const id = useId();
  const idDialogo = `${id}-dialogo`;
  const idTitulo = `${id}-titulo`;

  useEffect(() => {
    if (abierto) {
      dialogo.current?.focus();
    } else if (estabaAbierto.current) {
      boton.current?.focus();
    }
    estabaAbierto.current = abierto;
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return undefined;

    function cerrarAlPresionarAfuera(evento) {
      if (!contenedor.current?.contains(evento.target)) setAbierto(false);
    }

    function cerrarConEscape(evento) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        evento.stopPropagation();
        setAbierto(false);
      }
    }

    document.addEventListener("pointerdown", cerrarAlPresionarAfuera);
    document.addEventListener("keydown", cerrarConEscape, true);
    return () => {
      document.removeEventListener("pointerdown", cerrarAlPresionarAfuera);
      document.removeEventListener("keydown", cerrarConEscape, true);
    };
  }, [abierto]);

  if (!textos) return null;

  const valorTamano = textos.tamanoTexto.valor.replace(
    "{valor}",
    String(estado.tamanoTexto),
  );

  return (
    <div className="navbar-accesibilidad" ref={contenedor}>
      <button
        ref={boton}
        type="button"
        className="navbar-accesibilidad-abrir"
        aria-label={ariaBoton}
        aria-expanded={abierto}
        aria-controls={idDialogo}
        aria-haspopup="dialog"
        onClick={() => setAbierto((valor) => !valor)}
      >
        <Icono nombre="accesibilidad" />
        <span className="navbar-accesibilidad-etiqueta-movil cuerpo-p-fuerte">
          {etiquetaMovil}
        </span>
      </button>

      <section
        id={idDialogo}
        ref={dialogo}
        className="navbar-accesibilidad-dialogo"
        role="dialog"
        aria-labelledby={idTitulo}
        tabIndex="-1"
        hidden={!abierto}
      >
        <header className="navbar-accesibilidad-cabecera">
          <h2 className="titular-h4" id={idTitulo}>
            {textos.titulo}
          </h2>
          <button
            type="button"
            className="navbar-accesibilidad-cerrar"
            aria-label={textos.aria.cerrar}
            onClick={() => setAbierto(false)}
          >
            <Icono nombre="cerrar" />
          </button>
        </header>

        <div className="navbar-accesibilidad-tamano">
          <span className="cuerpo-p-fuerte">{textos.tamanoTexto.etiqueta}</span>
          <div className="navbar-accesibilidad-control-tamano">
            <button
              type="button"
              aria-label={textos.tamanoTexto.reducir}
              disabled={estado.tamanoTexto <= TAMANO_TEXTO_MINIMO}
              onClick={() => estado.ajustarTamanoTexto(-PASO_TAMANO_TEXTO)}
            >
              <Icono nombre="menos" />
            </button>
            <span className="cuerpo-p-fuerte" aria-live="polite">
              {valorTamano}
            </span>
            <button
              type="button"
              aria-label={textos.tamanoTexto.aumentar}
              disabled={estado.tamanoTexto >= TAMANO_TEXTO_MAXIMO}
              onClick={() => estado.ajustarTamanoTexto(PASO_TAMANO_TEXTO)}
            >
              <Icono nombre="mas" />
            </button>
          </div>
        </div>

        <div className="navbar-accesibilidad-opciones">
          <Interruptor
            id={`${id}-contraste`}
            etiqueta={textos.altoContraste.etiqueta}
            ayuda={textos.altoContraste.ayuda}
            valor={estado.altoContraste}
            alCambiar={estado.setAltoContraste}
          />
          <Interruptor
            id={`${id}-movimiento`}
            etiqueta={textos.reducirMovimiento.etiqueta}
            ayuda={textos.reducirMovimiento.ayuda}
            valor={estado.reducirMovimiento}
            alCambiar={estado.setReducirMovimiento}
          />
          <Interruptor
            id={`${id}-subrayar`}
            etiqueta={textos.subrayarEnlaces.etiqueta}
            ayuda={textos.subrayarEnlaces.ayuda}
            valor={estado.subrayarEnlaces}
            alCambiar={estado.setSubrayarEnlaces}
          />
          <Interruptor
            id={`${id}-espaciado`}
            etiqueta={textos.espaciado.etiqueta}
            ayuda={textos.espaciado.ayuda}
            valor={estado.espaciadoLectura}
            alCambiar={estado.setEspaciadoLectura}
          />
        </div>

        <div className="navbar-accesibilidad-pie">
          {estado.puedeGuardar() ? (
            <p className="detalle-nota">{textos.mensajes.nota}</p>
          ) : null}
          <div className="navbar-accesibilidad-pie-acciones">
            <span className="navbar-accesibilidad-declaracion detalle-nota">
              {textos.enlaces.declaracion}
            </span>
            <button type="button" onClick={estado.restablecer}>
              {textos.botones.restablecer}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
