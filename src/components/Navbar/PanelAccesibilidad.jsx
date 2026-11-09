// RESPONSABILIDAD: Presenta y controla las preferencias de accesibilidad.
import { useEffect, useId, useRef, useState } from "react";
import Icono from "../Icono/Icono.jsx";
import {
  PASO_TAMANO_TEXTO,
  TAMANO_TEXTO_MAXIMO,
  TAMANO_TEXTO_MINIMO,
} from "../../hooks/useAccesibilidad.js";
import "./PanelAccesibilidad.css";

// Interruptor reutilizable que muestra una opción con su ayuda y avisa el nuevo valor.
function Interruptor({ id, etiqueta, ayuda, valor, alCambiar }) {
  // Id derivado para enlazar el texto de ayuda con el input.
  const idAyuda = `${id}-ayuda`;

  return (
    <div className="navbar-accesibilidad-opcion">
      <div className="navbar-accesibilidad-copia">
        {/* [ACCESIBILIDAD] La etiqueta se asocia al input con htmlFor y también activa el interruptor al pulsarla. */}
        <label className="cuerpo-p-fuerte" htmlFor={id}>
          {etiqueta}
        </label>
        <p className="detalle-nota" id={idAyuda}>
          {ayuda}
        </p>
      </div>
      <span className="navbar-accesibilidad-switch">
        {/* [ACCESIBILIDAD] role="switch" lo anuncia como interruptor; aria-describedby añade la ayuda como descripción. */}
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={valor}
          aria-describedby={idAyuda}
          onChange={(evento) => alCambiar(evento.target.checked)}
        />
        {/* [ACCESIBILIDAD] La pista y la perilla son solo visuales y se ocultan a lectores de pantalla. */}
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
  // [LOCAL] Controla si el panel está abierto.
  const [abierto, setAbierto] = useState(false);
  // Referencias: el contenedor detecta clics fuera; el botón y el diálogo reciben el foco.
  const contenedor = useRef(null);
  const boton = useRef(null);
  const dialogo = useRef(null);
  // Recuerda si el panel estuvo abierto para no mover el foco en el primer render.
  const estabaAbierto = useRef(false);
  // Ids únicos que enlazan el diálogo con su botón y su título.
  const id = useId();
  const idDialogo = `${id}-dialogo`;
  const idTitulo = `${id}-titulo`;

  // [ACCESIBILIDAD] Lleva el foco al diálogo al abrirlo y al disparador al cerrarlo.
  useEffect(() => {
    if (abierto) {
      dialogo.current?.focus();
    } else if (estabaAbierto.current) {
      boton.current?.focus();
    }
    estabaAbierto.current = abierto;
  }, [abierto]);

  useEffect(() => {
    // Solo escucha eventos globales mientras el panel está abierto.
    if (!abierto) return undefined;

    // [ACCESIBILIDAD] Permite cerrar el panel con Escape o al pulsar fuera de él.
    function cerrarAlPresionarAfuera(evento) {
      if (!contenedor.current?.contains(evento.target)) setAbierto(false);
    }

    // Escape cierra el panel sin que el evento llegue a otros manejadores.
    function cerrarConEscape(evento) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        evento.stopPropagation();
        setAbierto(false);
      }
    }

    document.addEventListener("pointerdown", cerrarAlPresionarAfuera);
    document.addEventListener("keydown", cerrarConEscape, true);
    // Quita los listeners al cerrar o desmontar para no dejarlos activos.
    return () => {
      document.removeEventListener("pointerdown", cerrarAlPresionarAfuera);
      document.removeEventListener("keydown", cerrarConEscape, true);
    };
  }, [abierto]);

  // No renderiza el panel hasta que los textos estén disponibles.
  if (!textos) return null;

  // Inserta el tamaño actual en la plantilla de texto, reemplazando "{valor}".
  const valorTamano = textos.tamanoTexto.valor.replace(
    "{valor}",
    String(estado.tamanoTexto),
  );

  return (
    // Contenedor de referencia para detectar clics fuera del panel.
    <div className="navbar-accesibilidad" ref={contenedor}>
      {/* [ACCESIBILIDAD] aria-expanded y aria-controls indican el estado y el panel que abre; aria-label da el nombre accesible. */}
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
        {/* Etiqueta visible solo en móvil; el CSS la oculta en escritorio. */}
        <span className="navbar-accesibilidad-etiqueta-movil cuerpo-p-fuerte">
          {etiquetaMovil}
        </span>
      </button>

      {/* [ACCESIBILIDAD] Diálogo nombrado por su título; tabIndex="-1" permite enfocarlo por código y hidden lo oculta cuando está cerrado. */}
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
          {/* [ACCESIBILIDAD] El id enlaza este título con aria-labelledby del diálogo. */}
          <h2 className="titular-h4" id={idTitulo}>
            {textos.titulo}
          </h2>
          {/* [ACCESIBILIDAD] El botón solo tiene icono, por eso lleva aria-label. */}
          <button
            type="button"
            className="navbar-accesibilidad-cerrar"
            aria-label={textos.aria.cerrar}
            onClick={() => setAbierto(false)}
          >
            <Icono nombre="cerrar" />
          </button>
        </header>

        {/* Control del tamaño del texto: cada botón se deshabilita al llegar a su límite. */}
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
            {/* [ACCESIBILIDAD] aria-live="polite" anuncia el nuevo tamaño sin interrumpir la lectura. */}
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

        {/* [LOCAL] Interruptores de preferencias; cada uno toma su valor y su setter del estado de accesibilidad. */}
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
          {/* Muestra la nota solo cuando las preferencias se pueden guardar. */}
          {estado.puedeGuardar() ? (
            <p className="detalle-nota">{textos.mensajes.nota}</p>
          ) : null}
          <div className="navbar-accesibilidad-pie-acciones">
            <span className="navbar-accesibilidad-declaracion detalle-nota">
              {textos.enlaces.declaracion}
            </span>
            {/* Vuelve las preferencias a su estado inicial. */}
            <button type="button" onClick={estado.restablecer}>
              {textos.botones.restablecer}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}