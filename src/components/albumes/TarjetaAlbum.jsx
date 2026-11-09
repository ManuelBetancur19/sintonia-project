// RESPONSABILIDAD: Enlaza un álbum con su detalle y muestra su portada e información.
import { Link } from "react-router";
import PortadaAlbum from "../destacados/PortadaAlbum.jsx";

export default function TarjetaAlbum({ album }) {
  return (
    // Toda la tarjeta es un enlace al detalle; el id se codifica para que sea seguro en la URL.
    <Link
      className="destacados-tarjeta"
      to={`/albumes/${encodeURIComponent(album.id)}`}
    >
      {/* [ACCESIBILIDAD] Oculta la portada decorativa para evitar que se anuncie como contenido. */}
      <span className="destacados-portada" aria-hidden="true">
        <PortadaAlbum portada={album.portada} />
      </span>
      <span className="destacados-album-titulo">{album.titulo}</span>
      {/* No muestra texto si el álbum no trae artista. */}
      <span className="destacados-artista">{album.artista?.nombre}</span>
    </Link>
  );
}