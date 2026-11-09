import { Link } from "react-router";
import PortadaAlbum from "../destacados/PortadaAlbum.jsx";

export default function TarjetaAlbum({ album }) {
  return (
    <Link
      className="destacados-tarjeta"
      to={`/albumes/${encodeURIComponent(album.id)}`}
    >
      <span className="destacados-portada" aria-hidden="true">
        <PortadaAlbum portada={album.portada} />
      </span>
      <span className="destacados-album-titulo">{album.titulo}</span>
      <span className="destacados-artista">{album.artista?.nombre}</span>
    </Link>
  );
}
