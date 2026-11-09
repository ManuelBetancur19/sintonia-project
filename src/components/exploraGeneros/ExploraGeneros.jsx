import { Link } from "react-router";
import TarjetaGenero from "../generos/TarjetaGenero.jsx";
import { RUTAS } from "../../rutas.js";
import "./ExploraGeneros.css";

export default function ExploraGeneros({ textos, generos, cargando, error, recargar }) {
  if (!textos) return null;

  const { generos: textosGenero, estados } = textos;
  const estadoError = error === "sinConexion" ? estados.sinConexion : estados.error;

  return (
    <section className="explora-generos" aria-labelledby="explora-generos-titulo">
      <header className="explora-generos-cabecera">
        <h2 id="explora-generos-titulo">{textosGenero.titulo}</h2>
        <Link className="explora-generos-catalogo" to={RUTAS.catalogo}>
          {textosGenero.enlaces.verCatalogo}
          <span aria-hidden="true">→</span>
        </Link>
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
              <TarjetaGenero genero={genero} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
