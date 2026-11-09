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

export default function TarjetaGenero({
  genero,
  seleccionado = false,
  textoSeleccionado,
}) {
  return (
    <Link
      className={`genero-tarjeta${seleccionado ? " is-seleccionado" : ""}`}
      to={`${RUTAS.catalogo}?genero=${encodeURIComponent(genero.id)}`}
      aria-current={seleccionado ? "true" : undefined}
    >
      <img
        className="genero-tarjeta-imagen"
        src={IMAGEN_POR_GENERO[genero.id]}
        alt=""
        width="263"
        height="132"
        aria-hidden="true"
        loading="lazy"
      />
      <span className="genero-tarjeta-solo-lectores">{genero.nombre}</span>
      {seleccionado && textoSeleccionado ? (
        <span className="genero-tarjeta-solo-lectores">
          {textoSeleccionado}
        </span>
      ) : null}
    </Link>
  );
}
