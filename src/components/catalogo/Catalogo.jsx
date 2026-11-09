// RESPONSABILIDAD: Presenta el catálogo, sus géneros y el detalle seleccionado.
import { useId } from "react";
import Destacados from "../destacados/Destacados.jsx";
import PortadaAlbum from "../destacados/PortadaAlbum.jsx";
import TarjetaAlbum from "../albumes/TarjetaAlbum.jsx";
import TarjetaGenero from "../generos/TarjetaGenero.jsx";
import "./Catalogo.css";

// Muestra el estado de carga o de error de una sección; no renderiza nada si no hay ninguno.
function PanelEstado({ textos, cargando, error, reintentar }) {
  if (cargando) {
    return (
      // [ACCESIBILIDAD] role="status" anuncia la carga; el indicador giratorio se oculta por ser decorativo.
      <div className="catalogo-estado" role="status" aria-label={textos.cargando.aria}>
        <span className="catalogo-indicador" aria-hidden="true" />
        <span>{textos.cargando.titulo}</span>
      </div>
    );
  }

  if (!error) return null;

  // Distingue la falta de conexión de cualquier otro error para mostrar el mensaje adecuado.
  const mensaje = error === "sinConexion" ? textos.sinConexion : textos.error;
  return (
    // [ACCESIBILIDAD] role="alert" anuncia el error de inmediato a los lectores de pantalla.
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

// Indica si la portada trae sus tres colores como hexadecimal de 6 dígitos (#rrggbb).
function tieneColoresHex(portada) {
  return [portada?.fondo, portada?.figura, portada?.detalle].every(
    (color) => typeof color === "string" && /^#[\da-f]{6}$/i.test(color),
  );
}

// Convierte segundos a "m:ss"; devuelve texto vacío si el valor no es válido.
function formatearDuracion(segundos) {
  if (!Number.isFinite(segundos) || segundos < 0) return "";
  const minutos = Math.floor(segundos / 60);
  const resto = String(Math.floor(segundos % 60)).padStart(2, "0");
  return `${minutos}:${resto}`;
}

// Detalle del género seleccionado: artistas, álbumes y canciones, o su estado de carga, error o no encontrado.
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
  // [ACCESIBILIDAD] Ids únicos para enlazar cada sección con su título.
  const idSeccion = useId();
  const generos = textos.catalogo.genero;
  const estados = textos.estados;

  return (
    <div className="catalogo-detalle-genero">
      {/* Los estados son excluyentes: no encontrado, cargando o error. El detalle solo se muestra sin ninguno de ellos. */}
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
          {/* [API] Artistas del género; la sección se omite si no hay ninguno. */}
          {detalle.artistas.length > 0 ? (
            <section className="catalogo-seccion" aria-labelledby={`${idSeccion}-artistas`}>
              <h2 id={`${idSeccion}-artistas`}>{generos.artistas.titulo}</h2>
              <ul className="catalogo-artistas-lista">
                {detalle.artistas.map((artista) => (
                  // Sin colores válidos, la tarjeta no reserva espacio para la portada.
                  <li
                    className={`catalogo-artista${
                      tieneColoresHex(artista.portada)
                        ? ""
                        : " catalogo-artista-sin-portada"
                    }`}
                    key={artista.id}
                  >
                    {/* [ACCESIBILIDAD] Oculta la portada decorativa; el nombre del artista ya identifica la tarjeta. */}
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

          {/* [API] Álbumes del género; si no hay ninguno, muestra un mensaje de vacío. */}
          <section className="catalogo-seccion" aria-labelledby={`${idSeccion}-albumes`}>
            {/* Inserta el nombre del género en el marcador {genero} del título. */}
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

          {/* [API] Canciones del género; la sección se omite si no hay ninguna. */}
          {detalle.pistas.length > 0 ? (
            <section className="catalogo-seccion" aria-labelledby={`${idSeccion}-canciones`}>
              <h2 id={`${idSeccion}-canciones`}>{generos.canciones.titulo}</h2>
              <ol className="catalogo-canciones-lista">
                {detalle.pistas.map((pista, indice) => (
                  <li key={pista.id}>
                    {/* [ACCESIBILIDAD] Oculta el número visual; la lista ordenada ya anuncia la posición. */}
                    <span className="catalogo-cancion-numero" aria-hidden="true">
                      {indice + 1}
                    </span>
                    <span className="catalogo-cancion-titulo">{pista.titulo}</span>
                    {/* No muestra texto si la canción no trae artista. */}
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

// No renderiza el catálogo hasta que los textos estén disponibles.
// Así CatalogoContenido puede usar los textos sin comprobar si existen.
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
  // [ACCESIBILIDAD] Id único para enlazar las secciones con sus títulos.
  const id = useId();
  const { catalogo, estados } = textos;
  // Reagrupa los textos con la forma que espera el componente Destacados.
  const titulosDestacados = {
    destacados: catalogo.destacados,
    estados,
  };

  return (
    <section className="catalogo" aria-labelledby={`${id}-titulo`}>
      <div className="catalogo-panel">
        <header className="catalogo-encabezado">
          {/* [ACCESIBILIDAD] Da a la región del catálogo el nombre de este encabezado. */}
          <h1 id={`${id}-titulo`}>{catalogo.encabezado.titulo}</h1>
          <p>{catalogo.encabezado.subtitulo}</p>
        </header>

        {/* [API] Lista de géneros: muestra carga o error, la lista, o un mensaje si no hay géneros. */}
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
                  {/* Marca como seleccionado el género activo y pasa el texto que lo anuncia. */}
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

        {/* Con un género seleccionado muestra su detalle; si no, los destacados. */}
        {generoSeleccionado.idGenero ? (
          <SeccionGenero
            textos={textos}
            detalle={generoSeleccionado.genero}
            // Usa el nombre del detalle y, mientras este carga, el de la lista de géneros.
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