// RESPONSABILIDAD: Presenta los datos, pistas y álbumes relacionados.
import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { useAlbumDetalle } from "../../hooks/useAlbumDetalle.js";
import { RUTAS } from "../../rutas.js";
import PortadaAlbum from "../destacados/PortadaAlbum.jsx";
import "./AlbumDetalle.css";

function formatearDuracion(segundos) {
  if (!Number.isFinite(segundos) || segundos < 0) return null;
  return `${Math.floor(segundos / 60)}:${String(Math.floor(segundos % 60)).padStart(2, "0")}`;
}

function formatearFecha(fecha, idioma) {
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
  const fechaLocal = new Date(`${fecha}T12:00:00Z`);
  return new Intl.DateTimeFormat(idioma, {
    dateStyle: "long",
    timeZone: "America/Bogota",
  }).format(fechaLocal);
}

function PanelEstado({ estados, textosAlbum, cargando, error, noEncontrado, sinDatos, recargar }) {
  if (noEncontrado) {
    const mensaje = textosAlbum.noEncontrado;
    return (
      <section className="album-detalle-estado" role="status" aria-labelledby="album-estado-titulo">
        <h1 id="album-estado-titulo">{mensaje.titulo}</h1>
        <p>{mensaje.texto}</p>
        <Link to={RUTAS.catalogo}>{mensaje.botones.volver}</Link>
      </section>
    );
  }

  if (cargando) {
    return (
      <div className="album-detalle-estado" role="status" aria-label={estados.cargando.aria}>
        <span className="album-detalle-indicador" aria-hidden="true" />
        <span>{estados.cargando.titulo}</span>
      </div>
    );
  }

  if (sinDatos && !error) {
    return <p className="album-detalle-estado" role="status">{estados.vacio.generico}</p>;
  }

  if (!error) return null;
  const mensaje = error === "sinConexion" ? estados.sinConexion : estados.error;
  return (
    <div className="album-detalle-estado album-detalle-error" role="alert">
      <div>
        <h1>{mensaje.titulo}</h1>
        <p>{mensaje.descripcion}</p>
      </div>
      <button type="button" onClick={recargar}>{mensaje.botones.reintentar}</button>
    </div>
  );
}

function AlbumRelacionado({ album, textosAlbum }) {
  const tipo = textosAlbum.encabezado.etiquetas.tipo[album.tipo] ?? album.tipo;
  const anio = album.fechaPublicacion?.slice(0, 4) ?? "";
  const metadatos = textosAlbum.masDelArtista.etiquetas.anioYTipo
    .replace("{anio}", anio)
    .replace("{tipo}", tipo);

  return (
    <Link className="album-detalle-relacionado" to={`/albumes/${encodeURIComponent(album.id)}`}>
      <span className="album-detalle-relacionado-portada" aria-hidden="true">
        <PortadaAlbum portada={album.portada} />
      </span>
      <span className="album-detalle-relacionado-titulo">{album.titulo}</span>
      <span className="album-detalle-relacionado-meta">{metadatos}</span>
    </Link>
  );
}

export default function AlbumDetalle({ textos, idioma }) {
  const { id } = useParams();
  const { album, cargando, error, noEncontrado, recargar } = useAlbumDetalle(id);
  const estados = textos?.estados;
  const textosAlbum = textos?.paginas?.album;

  useEffect(() => {
    if (!album?.titulo || !textosAlbum?.seo) return undefined;
    const tituloAnterior = document.title;
    let metaDescripcion = document.querySelector('meta[name="description"]');
    const descripcionExistia = Boolean(metaDescripcion);
    if (!metaDescripcion) {
      metaDescripcion = document.createElement("meta");
      metaDescripcion.name = "description";
      document.head.append(metaDescripcion);
    }
    const descripcionAnterior = metaDescripcion.content;
    document.title = textosAlbum.seo.titulo.replace("{titulo}", album.titulo);
    metaDescripcion.content = textosAlbum.seo.descripcion;
    return () => {
      document.title = tituloAnterior;
      if (descripcionExistia) metaDescripcion.content = descripcionAnterior;
      else metaDescripcion.remove();
    };
  }, [album, textosAlbum]);

  if (!estados || !textosAlbum) return null;

  const tipoEtiqueta = textosAlbum.encabezado.etiquetas.tipo[album?.tipo];
  const totalCanciones = album?.totalPistas;
  const cantidadCanciones = totalCanciones === 1
    ? textosAlbum.encabezado.canciones.uno
    : textosAlbum.encabezado.canciones.otro;
  const etiquetaCanciones = cantidadCanciones?.replace("{cantidad}", String(totalCanciones));
  const anio = album?.fechaPublicacion?.slice(0, 4) ?? "";
  const minutos = Math.floor((album?.duracionSeg ?? 0) / 60);
  const etiquetaDuracion = textosAlbum.encabezado.duracion.replace("{minutos}", String(minutos));
  const resumen = textosAlbum.encabezado.etiquetas.resumen
    .replace("{artista}", album?.artista?.nombre ?? "")
    .replace("{anio}", anio)
    .replace("{canciones}", etiquetaCanciones ?? "")
    .replace("{duracion}", etiquetaDuracion);
  const albumesArtista = Array.isArray(album?.masDelArtista) ? album.masDelArtista : [];
  const pistas = Array.isArray(album?.pistas) ? album.pistas : [];
  const mostrarEstado = noEncontrado || cargando || error || !album;

  return (
    <section className="album-detalle">
      {mostrarEstado ? (
        <PanelEstado
          estados={estados}
          textosAlbum={textosAlbum}
          cargando={cargando}
          error={error}
          noEncontrado={noEncontrado}
          sinDatos={!album}
          recargar={recargar}
        />
      ) : (
        <div className="album-detalle-panel">
          <header className="album-detalle-cabecera">
            <div className="album-detalle-portada" aria-hidden="true">
              <PortadaAlbum portada={album.portada} />
            </div>
            <div className="album-detalle-identidad">
              {tipoEtiqueta ? <p className="album-detalle-tipo">{tipoEtiqueta}</p> : null}
              <h1 id="album-detalle-titulo">{album.titulo}</h1>
              <p className="album-detalle-resumen">
                <span className="album-detalle-mini-portada" aria-hidden="true">
                  <PortadaAlbum portada={album.portada} />
                </span>
                <span>{resumen}</span>
              </p>
            </div>
          </header>

          <section className="album-detalle-seccion">
            {pistas.length ? (
              <div className="album-detalle-tabla-contenedor">
                <table className="album-detalle-tabla">
                  <thead>
                    <tr>
                      <th scope="col">{textosAlbum.tabla.etiquetas.numero}</th>
                      <th scope="col">{textosAlbum.tabla.etiquetas.titulo}</th>
                      <th scope="col">{textosAlbum.tabla.etiquetas.reproducciones}</th>
                      <th scope="col">
                        <span className="album-detalle-solo-lectores">{textosAlbum.tabla.etiquetas.duracion}</span>
                        <span className="album-detalle-reloj" aria-hidden="true" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pistas.map((pista, indice) => (
                      <tr key={pista.id}>
                        <td className="album-detalle-numero">{pista.numero ?? indice + 1}</td>
                        <th scope="row" className="album-detalle-pista-titulo">
                          <span className="album-detalle-pista-portada" aria-hidden="true">
                            <PortadaAlbum portada={pista.portada} />
                          </span>
                          <span className="album-detalle-pista-texto">
                            <span>{pista.titulo}</span>
                            {pista.artista?.nombre ? <span>{pista.artista.nombre}</span> : null}
                          </span>
                        </th>
                        <td>{Number.isFinite(pista.reproducciones)
                          ? new Intl.NumberFormat(idioma).format(pista.reproducciones)
                          : null}</td>
                        <td>
                          {formatearDuracion(pista.duracionSeg) ? (
                            <time className="album-detalle-duracion" dateTime={`PT${pista.duracionSeg}S`}>
                              {formatearDuracion(pista.duracionSeg)}
                            </time>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="album-detalle-vacio">{estados.vacio.generico}</p>}
            {formatearFecha(album.fechaPublicacion, idioma) ? (
              <p className="album-detalle-fecha">
                <time dateTime={album.fechaPublicacion}>{formatearFecha(album.fechaPublicacion, idioma)}</time>
              </p>
            ) : null}
          </section>

          {albumesArtista.length ? (
            <section className="album-detalle-seccion" aria-labelledby="album-detalle-mas-artista">
              <header className="album-detalle-relacionados-cabecera">
                <h2 id="album-detalle-mas-artista">
                {textosAlbum.masDelArtista.titulo.replace("{artista}", album.artista?.nombre ?? "")}
                </h2>
              </header>
              <ul className="album-detalle-relacionados">
                {albumesArtista.map((albumRelacionado) => (
                  <li key={albumRelacionado.id}>
                    <AlbumRelacionado album={albumRelacionado} textosAlbum={textosAlbum} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </section>
  );
}
