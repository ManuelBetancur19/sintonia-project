import PortadaAlbum from "./PortadaAlbum.jsx";
import "./Destacados.css";

export default function Destacados({ textos, albumes, cargando, error, recargar }) {
  if (!textos) return null;

  const { destacados, estados } = textos;
  const estadoError = error === "sinConexion" ? estados.sinConexion : estados.error;

  return (
    <section className="destacados" aria-labelledby="destacados-titulo">
      <header className="destacados-cabecera">
        <h2 id="destacados-titulo">{destacados.titulo}</h2>
        <a className="destacados-descubrir" href="/catalogo">
          {destacados.enlaces.descubrirMas}
          <span aria-hidden="true">→</span>
        </a>
      </header>

      {cargando && (
        <div className="destacados-estado" role="status" aria-label={estados.cargando.aria}>
          <span className="destacados-indicador" aria-hidden="true" />
          <span>{estados.cargando.titulo}</span>
        </div>
      )}

      {!cargando && error && (
        <div className="destacados-estado destacados-estado-error" role="alert">
          <div>
            <h3>{estadoError.titulo}</h3>
            <p>{estadoError.descripcion}</p>
          </div>
          <button type="button" onClick={recargar}>
            {estadoError.botones.reintentar}
          </button>
        </div>
      )}

      {!cargando && !error && albumes.length === 0 && (
        <p className="destacados-vacio">{estados.vacio.generico}</p>
      )}

      {!cargando && !error && albumes.length > 0 && (
        <ul className="destacados-lista">
          {albumes.map((album) => {
            return (
              <li key={album.id}>
                <a
                  className="destacados-tarjeta"
                  href={`/albumes/${encodeURIComponent(album.id)}`}
                >
                  <span className="destacados-portada" aria-hidden="true">
                    <PortadaAlbum portada={album.portada} />
                  </span>
                  <span className="destacados-album-titulo">{album.titulo}</span>
                  <span className="destacados-artista">{album.artista?.nombre}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
