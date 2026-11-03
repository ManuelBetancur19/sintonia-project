import electronica from "../../assets/generos/genero-electronica.svg";
import folk from "../../assets/generos/genero-folk.svg";
import indie from "../../assets/generos/genero-indie.svg";
import instrumental from "../../assets/generos/genero-instrumental.svg";
import jazz from "../../assets/generos/genero-jazz.svg";
import loFi from "../../assets/generos/genero-lo-fi.svg";
import musicaAndina from "../../assets/generos/genero-musica-andina.svg";
import pop from "../../assets/generos/genero-pop.svg";
import rock from "../../assets/generos/genero-rock.svg";
import salsa from "../../assets/generos/genero-salsa.svg";
import tropical from "../../assets/generos/genero-tropical.svg";
import urbano from "../../assets/generos/genero-urbano.svg";
import "./Destacados.css";

const PORTADAS_GENERO = {
  gen_pop: { imagen: pop, ancho: 352, alto: 383, x: 16, y: 16, lado: 320 },
  gen_indie: { imagen: indie, ancho: 316, alto: 223, x: 16, y: 16, lado: 160 },
  gen_rock: { imagen: rock, ancho: 313, alto: 223, x: 16, y: 16, lado: 160 },
  gen_electronica: { imagen: electronica, ancho: 363, alto: 223, x: 16, y: 16, lado: 160 },
  gen_salsa: { imagen: salsa, ancho: 318, alto: 223, x: 16, y: 16, lado: 160 },
  gen_tropical: { imagen: tropical, ancho: 336, alto: 223, x: 16, y: 16, lado: 160 },
  gen_andina: { imagen: musicaAndina, ancho: 391, alto: 155, x: 16, y: 16, lado: 92 },
  gen_folk: { imagen: folk, ancho: 307, alto: 223, x: 16, y: 16, lado: 160 },
  gen_urbano: { imagen: urbano, ancho: 333, alto: 223, x: 16, y: 16, lado: 160 },
  gen_lofi: { imagen: loFi, ancho: 310, alto: 155, x: 16, y: 16, lado: 92 },
  gen_jazz: { imagen: jazz, ancho: 310, alto: 155, x: 16, y: 16, lado: 92 },
  gen_instrumental: { imagen: instrumental, ancho: 373, alto: 155, x: 16, y: 16, lado: 92 },
};

const PORTADA_POR_DEFECTO = PORTADAS_GENERO.gen_instrumental;

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
            const portada = PORTADAS_GENERO[album.idGenero] ?? PORTADA_POR_DEFECTO;
            const margenRecorte = portada.lado * 0.03;
            const ladoVisible = portada.lado - margenRecorte * 2;
            return (
              <li key={album.id}>
                <a
                  className="destacados-tarjeta"
                  href={`/albumes/${encodeURIComponent(album.id)}`}
                >
                  <span className="destacados-portada" aria-hidden="true">
                    <img
                      src={portada.imagen}
                      alt=""
                      style={{
                        width: `${(portada.ancho / ladoVisible) * 100}%`,
                        height: `${(portada.alto / ladoVisible) * 100}%`,
                        left: `${(-portada.x - margenRecorte) / ladoVisible * 100}%`,
                        top: `${(-portada.y - margenRecorte) / ladoVisible * 100}%`,
                      }}
                    />
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
