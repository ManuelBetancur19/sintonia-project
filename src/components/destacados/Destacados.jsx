// RESPONSABILIDAD: Presenta los álbumes destacados y los estados de carga.
import { Link } from "react-router";
import TarjetaAlbum from "../albumes/TarjetaAlbum.jsx";
import { RUTAS } from "../../rutas.js";
import "./Destacados.css";

export default function Destacados({ textos, albumes, cargando, error, recargar }) {
  // No renderiza la sección hasta que los textos estén disponibles.
  if (!textos) return null;

  const { destacados, estados } = textos;

  // Distingue la falta de conexión de cualquier otro error para mostrar el mensaje adecuado.
  const estadoError = error === "sinConexion" ? estados.sinConexion : estados.error;

  return (
    // [ACCESIBILIDAD] El título nombra la sección para lectores de pantalla.
    <section className="destacados" aria-labelledby="destacados-titulo">
      <header className="destacados-cabecera">
        <h2 id="destacados-titulo">{destacados.titulo}</h2>
        <Link className="destacados-descubrir" to={RUTAS.catalogo}>
          {destacados.enlaces.descubrirMas}
          {/* [ACCESIBILIDAD] Oculta la flecha decorativa; el texto del enlace ya basta. */}
          <span aria-hidden="true">→</span>
        </Link>
      </header>

      {/* Los estados son excluyentes: carga, error, vacío o lista de álbumes. */}
      {cargando && (
        // [ACCESIBILIDAD] role="status" anuncia la carga; el indicador giratorio se oculta por ser decorativo.
        <div className="destacados-estado" role="status" aria-label={estados.cargando.aria}>
          <span className="destacados-indicador" aria-hidden="true" />
          <span>{estados.cargando.titulo}</span>
        </div>
      )}

      {!cargando && error && (
        // [ACCESIBILIDAD] role="alert" anuncia el error de inmediato a los lectores de pantalla.
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

      {/* Sin álbumes y sin error, muestra el mensaje genérico de vacío. */}
      {!cargando && !error && albumes.length === 0 && (
        <p className="destacados-vacio">{estados.vacio.generico}</p>
      )}

      {!cargando && !error && albumes.length > 0 && (
        <ul className="destacados-lista">
          {/* [API] Presenta los álbumes recibidos por el hook en el orden del servicio. */}
          {albumes.map((album) => {
            return (
              <li key={album.id}>
                <TarjetaAlbum album={album} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}