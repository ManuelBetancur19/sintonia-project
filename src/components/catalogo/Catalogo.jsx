import { useId } from "react";
import Destacados from "../destacados/Destacados.jsx";
import PortadaAlbum from "../destacados/PortadaAlbum.jsx";
import TarjetaAlbum from "../albumes/TarjetaAlbum.jsx";
import TarjetaGenero from "../generos/TarjetaGenero.jsx";
import "./Catalogo.css";

function PanelEstado({ textos, cargando, error, reintentar }) {
  if (cargando) {
    return (
      <div className="catalogo-estado" role="status" aria-label={textos.cargando.aria}>
        <span className="catalogo-indicador" aria-hidden="true" />
        <span>{textos.cargando.titulo}</span>
      </div>
    );
  }

  if (!error) return null;

  const mensaje = error === "sinConexion" ? textos.sinConexion : textos.error;
  return (
    <div className="catalogo-estado catalogo-estado-error" role="alert">
      <div>
        <h3>{mensaje.titulo}</h3>
        <p>{mensaje.descripcion}</p>
      </div>
      <button type="button" onClick={reintentar}>
        {mensaje.botones.reintentar}
      </button>
    </div>
  );
}

function tieneColoresHex(portada) {
  return [portada?.fondo, portada?.figura, portada?.detalle].every(
    (color) => typeof color === "string" && /^#[\da-f]{6}$/i.test(color),
  );
}

function formatearDuracion(segundos) {
  if (!Number.isFinite(segundos) || segundos < 0) return "";
  const minutos = Math.floor(segundos / 60);
  const resto = String(Math.floor(segundos % 60)).padStart(2, "0");
  return `${minutos}:${resto}`;
}

function SeccionGenero({
  textos,
  detalle,
  nombreGenero,
  idGenero,
  cargando,
  error,
  noEncontrado,
  recargar,
}) {
  const idSeccion = useId();
  const generos = textos.catalogo.genero;
  const estados = textos.estados;

  return (
    <div className="catalogo-detalle-genero">
      {noEncontrado ? (
        <div className="catalogo-estado" role="status">
          <h2>{estados.noEncontrado.titulo}</h2>
          <p>{estados.noEncontrado.descripcion}</p>
        </div>
      ) : null}

      {!noEncontrado && cargando ? (
        <PanelEstado textos={estados} cargando reintentar={recargar} />
      ) : null}

      {!noEncontrado && !cargando && error ? (
        <PanelEstado textos={estados} error={error} reintentar={recargar} />
      ) : null}

      {!noEncontrado && !cargando && !error && detalle ? (
        <>
          {detalle.artistas.length > 0 ? (
            <section className="catalogo-seccion" aria-labelledby={`${idSeccion}-artistas`}>
              <h2 id={`${idSeccion}-artistas`}>{generos.artistas.titulo}</h2>
              <ul className="catalogo-artistas-lista">
                {detalle.artistas.map((artista) => (
                  <li
                    className={`catalogo-artista${
                      tieneColoresHex(artista.portada)
                        ? ""
                        : " catalogo-artista-sin-portada"
                    }`}
                    key={artista.id}
                  >
                    {tieneColoresHex(artista.portada) ? (
                      <span className="catalogo-artista-portada" aria-hidden="true">
                        <PortadaAlbum portada={artista.portada} />
                      </span>
                    ) : null}
                    <span className="catalogo-artista-nombre">{artista.nombre}</span>
                    <span className="catalogo-artista-etiqueta">
                      {generos.artistas.etiqueta}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="catalogo-seccion" aria-labelledby={`${idSeccion}-albumes`}>
            <h2 id={`${idSeccion}-albumes`}>
              {generos.albumes.titulo.replace("{genero}", nombreGenero ?? "")}
            </h2>
            {detalle.albumes.length > 0 ? (
              <ul className="catalogo-albumes-lista">
                {detalle.albumes.map((album) => (
                  <li key={album.id}>
                    <TarjetaAlbum
                      album={album}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="catalogo-vacio">
                <h3>{textos.catalogo.vacio.titulo}</h3>
                <p>{textos.catalogo.vacio.texto}</p>
              </div>
            )}
          </section>

          {detalle.pistas.length > 0 ? (
            <section className="catalogo-seccion" aria-labelledby={`${idSeccion}-canciones`}>
              <h2 id={`${idSeccion}-canciones`}>{generos.canciones.titulo}</h2>
              <ol className="catalogo-canciones-lista">
                {detalle.pistas.map((pista, indice) => (
                  <li key={pista.id}>
                    <span className="catalogo-cancion-numero" aria-hidden="true">
                      {indice + 1}
                    </span>
                    <span className="catalogo-cancion-titulo">{pista.titulo}</span>
                    <span className="catalogo-cancion-artista">
                      {pista.artista?.nombre}
                    </span>
                    <span className="catalogo-cancion-duracion">
                      {formatearDuracion(pista.duracionSeg)}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export default function Catalogo(props) {
  if (!props.textos) return null;
  return <CatalogoContenido {...props} />;
}

function CatalogoContenido({
  textos,
  generos,
  cargandoGeneros,
  errorGeneros,
  recargarGeneros,
  destacados,
  generoSeleccionado,
}) {
  const id = useId();
  const { catalogo, estados } = textos;
  const titulosDestacados = {
    destacados: catalogo.destacados,
    estados,
  };

  return (
    <section className="catalogo" aria-labelledby={`${id}-titulo`}>
      <div className="catalogo-panel">
        <header className="catalogo-encabezado">
          <h1 id={`${id}-titulo`}>{catalogo.encabezado.titulo}</h1>
          <p>{catalogo.encabezado.subtitulo}</p>
        </header>

        <section className="catalogo-seccion" aria-labelledby={`${id}-generos`}>
          <h2 id={`${id}-generos`}>{catalogo.generos.titulo}</h2>
          <PanelEstado
            textos={estados}
            cargando={cargandoGeneros}
            error={errorGeneros}
            reintentar={recargarGeneros}
          />
          {!cargandoGeneros && !errorGeneros && generos.length > 0 ? (
            <ul className="catalogo-generos-lista">
              {generos.map((genero) => (
                <li key={genero.id}>
                  <TarjetaGenero
                    genero={genero}
                    seleccionado={genero.id === generoSeleccionado.idGenero}
                    textoSeleccionado={catalogo.generos.aria.seleccionado}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {!cargandoGeneros && !errorGeneros && generos.length === 0 ? (
            <p className="catalogo-vacio">{estados.vacio.generico}</p>
          ) : null}
        </section>

        {generoSeleccionado.idGenero ? (
          <SeccionGenero
            textos={textos}
            detalle={generoSeleccionado.genero}
            nombreGenero={
              generoSeleccionado.genero?.nombre ??
              generos.find((genero) => genero.id === generoSeleccionado.idGenero)?.nombre
            }
            idGenero={generoSeleccionado.idGenero}
            cargando={generoSeleccionado.cargando}
            error={generoSeleccionado.error}
            noEncontrado={generoSeleccionado.noEncontrado}
            recargar={generoSeleccionado.recargar}
          />
        ) : (
          <div className="catalogo-destacados">
            <Destacados
              {...destacados}
              textos={titulosDestacados}
            />
          </div>
        )}
      </div>
    </section>
  );
}
