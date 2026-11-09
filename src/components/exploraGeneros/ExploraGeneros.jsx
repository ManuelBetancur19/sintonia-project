// RESPONSABILIDAD: Presenta los géneros disponibles y el enlace al catálogo.
import { Link } from "react-router";
import TarjetaGenero from "../generos/TarjetaGenero.jsx";
import { RUTAS } from "../../rutas.js";
import "./ExploraGeneros.css";

export default function ExploraGeneros({ textos, generos, cargando, error, recargar }) {
  // No renderiza la sección hasta que los textos estén disponibles.
  if (!textos) return null;

  // Renombra los textos de géneros para no chocar con la prop `generos` (la lista).
  const { generos: textosGenero, estados } = textos;

  // Distingue la falta de conexión de cualquier otro error para mostrar el mensaje adecuado.
  const estadoError = error === "sinConexion" ? estados.sinConexion : estados.error;

  return (
    // [ACCESIBILIDAD] El título nombra la sección para lectores de pantalla.
    <section className="explora-generos" aria-labelledby="explora-generos-titulo">
      <header className="explora-generos-cabecera">
        <h2 id="explora-generos-titulo">{textosGenero.titulo}</h2>
        <Link className="explora-generos-catalogo" to={RUTAS.catalogo}>
          {textosGenero.enlaces.verCatalogo}
          {/* [ACCESIBILIDAD] Oculta la flecha decorativa; el texto del enlace ya basta. */}
          <span aria-hidden="true">→</span>
        </Link>
      </header>

      {/* Los estados son excluyentes: carga, error, vacío o lista de géneros. */}
      {cargando && (
        // [ACCESIBILIDAD] role="status" anuncia la carga; el indicador giratorio se oculta por ser decorativo.
        <div className="explora-generos-estado" role="status" aria-label={estados.cargando.aria}>
          <span className="explora-generos-indicador" aria-hidden="true" />
          <span>{estados.cargando.titulo}</span>
        </div>
      )}

      {!cargando && error && (
        // [ACCESIBILIDAD] role="alert" anuncia el error de inmediato a los lectores de pantalla.
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

      {/* Sin géneros y sin error, muestra el mensaje genérico de vacío. */}
      {!cargando && !error && generos.length === 0 && (
        <p className="explora-generos-estado">{estados.vacio.generico}</p>
      )}

      {!cargando && !error && generos.length > 0 && (
        <ul className="explora-generos-lista">
          {/* [API] Presenta la lista de géneros recibida por el hook. */}
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