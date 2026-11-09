// RESPONSABILIDAD: Enlaza un género con el catálogo y presenta su ilustración.
import { Link } from "react-router";
import electronica from "../../assets/catalogo/Género · Electrónica.svg";
import folk from "../../assets/catalogo/Género · Folk.svg";
import indie from "../../assets/catalogo/Género · Indie.svg";
import instrumental from "../../assets/catalogo/Género · Instrumental.svg";
import jazz from "../../assets/catalogo/Género · Jazz.svg";
import loFi from "../../assets/catalogo/Género · Lo-fi.svg";
import musicaAndina from "../../assets/catalogo/Género · Música andina.svg";
import pop from "../../assets/catalogo/Género · Pop.svg";
import rock from "../../assets/catalogo/Género · Rock.svg";
import salsa from "../../assets/catalogo/Género · Salsa.svg";
import tropical from "../../assets/catalogo/Género · Tropical.svg";
import urbano from "../../assets/catalogo/Género · Urbano.svg";
import { RUTAS } from "../../rutas.js";
import "./TarjetaGenero.css";

// [STATIC] Asocia cada id de género con su ilustración del catálogo.
const IMAGEN_POR_GENERO = {
  gen_pop: pop,
  gen_indie: indie,
  gen_rock: rock,
  gen_electronica: electronica,
  gen_salsa: salsa,
  gen_tropical: tropical,
  gen_andina: musicaAndina,
  gen_folk: folk,
  gen_urbano: urbano,
  gen_lofi: loFi,
  gen_jazz: jazz,
  gen_instrumental: instrumental,
};

// Props: genero aporta id y nombre; seleccionado marca la tarjeta activa (por defecto false);
// textoSeleccionado es el aviso opcional que se anuncia solo a lectores de pantalla.
export default function TarjetaGenero({
  genero,
  seleccionado = false,
  textoSeleccionado,
}) {
  return (
    // Enlaza al catálogo filtrado por el género y marca visualmente la tarjeta seleccionada.
    // [ACCESIBILIDAD] aria-current anuncia la tarjeta activa y se omite cuando no está seleccionada.
    <Link
      className={`genero-tarjeta${seleccionado ? " is-seleccionado" : ""}`}
      to={`${RUTAS.catalogo}?genero=${encodeURIComponent(genero.id)}`}
      aria-current={seleccionado ? "true" : undefined}
    >
      {/* [ACCESIBILIDAD] La ilustración es decorativa: alt vacío y aria-hidden evitan que se anuncie.
          Las dimensiones fijas y la carga diferida evitan saltos de diseño y retrasos al abrir el catálogo. */}
      <img
        className="genero-tarjeta-imagen"
        src={IMAGEN_POR_GENERO[genero.id]}
        alt=""
        width="263"
        height="132"
        aria-hidden="true"
        loading="lazy"
      />
      {/* [ACCESIBILIDAD] Expone el nombre del género como nombre accesible del enlace. */}
      <span className="genero-tarjeta-solo-lectores">{genero.nombre}</span>
      {/* [ACCESIBILIDAD] Anuncia el estado seleccionado solo si la tarjeta está activa y hay texto; si no, no renderiza nada. */}
      {seleccionado && textoSeleccionado ? (
        <span className="genero-tarjeta-solo-lectores">
          {textoSeleccionado}
        </span>
      ) : null}
    </Link>
  );
}