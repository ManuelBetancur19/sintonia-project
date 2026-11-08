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
import "./ExploraGeneros.css";

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

export default function ExploraGeneros({ textos, generos, cargando, error, recargar }) {
  if (!textos) return null;

  const { generos: textosGenero, estados } = textos;
  const estadoError = error === "sinConexion" ? estados.sinConexion : estados.error;

  return (
    <section className="explora-generos" aria-labelledby="explora-generos-titulo">
      <header className="explora-generos-cabecera">
        <h2 id="explora-generos-titulo">{textosGenero.titulo}</h2>
        <a className="explora-generos-catalogo" href="/catalogo">
          {textosGenero.enlaces.verCatalogo}
          <span aria-hidden="true">→</span>
        </a>
      </header>

      {cargando && (
        <div className="explora-generos-estado" role="status" aria-label={estados.cargando.aria}>
          <span className="explora-generos-indicador" aria-hidden="true" />
          <span>{estados.cargando.titulo}</span>
        </div>
      )}

      {!cargando && error && (
        <div className="explora-generos-estado explora-generos-error" role="alert">
          <div>
            <h3>{estadoError.titulo}</h3>
            <p>{estadoError.descripcion}</p>
          </div>
          <button type="button" onClick={recargar}>
            {estadoError.botones.reintentar}
          </button>
        </div>
      )}

      {!cargando && !error && generos.length === 0 && (
        <p className="explora-generos-estado">{estados.vacio.generico}</p>
      )}

      {!cargando && !error && generos.length > 0 && (
        <ul className="explora-generos-lista">
          {generos.map((genero) => (
            <li key={genero.id}>
              <a
                className="explora-generos-tarjeta"
                href={`/catalogo?genero=${encodeURIComponent(genero.id)}`}
              >
                <img
                  className="explora-generos-imagen"
                  src={IMAGEN_POR_GENERO[genero.id]}
                  alt=""
                  width="263"
                  height="132"
                  aria-hidden="true"
                  loading="lazy"
                />
                <span className="explora-generos-solo-lectores">{genero.nombre}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
