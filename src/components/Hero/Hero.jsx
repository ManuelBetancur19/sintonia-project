import { Link } from "react-router";
import ilustracionTurquesa from "../../assets/ilustraciones/Hero (2).svg";
import ilustracionRosa from "../../assets/ilustraciones/Hero (3).svg";
import ilustracionNaranja from "../../assets/ilustraciones/Hero.svg";
import { RUTAS } from "../../rutas.js";
import "./Hero.css";

export default function Hero({ textos, totalGeneros, textoTarjeta }) {
  if (!textos?.hero || !textos?.cifras) return null;

  const { hero, cifras } = textos;

  return (
    <section className="hero" aria-labelledby="hero-titulo">
      <div className="hero-contenido">
        <span className="hero-etiqueta">{hero.etiquetas.temporada}</span>

        <h1 id="hero-titulo">{hero.titulo}</h1>
        <p className="hero-subtitulo">{hero.subtitulo}</p>

        <div className="hero-acciones">
          <Link className="hero-boton hero-boton-primario" to={RUTAS.crearCuenta}>
            {hero.botones.crearCuentaGratis}
          </Link>
          <Link className="hero-boton hero-boton-secundario" to={RUTAS.catalogo}>
            {hero.botones.explorarCatalogo}
          </Link>
        </div>

        <dl className="hero-cifras">
          <div>
            <dt>{cifras.canciones.valor}</dt>
            <dd>{cifras.canciones.etiqueta}</dd>
          </div>
          <div>
            <dt>{totalGeneros ?? "—"}</dt>
            <dd>{cifras.generos.etiqueta}</dd>
          </div>
          <div>
            <dt>{cifras.cortes.valor}</dt>
            <dd>{cifras.cortes.etiqueta}</dd>
          </div>
        </dl>
      </div>

      <div className="hero-collage" role="img" aria-label={textoTarjeta}>
        <img
          className="hero-ilustracion hero-ilustracion-principal"
          src={ilustracionTurquesa}
          alt=""
        />
        <img
          className="hero-ilustracion hero-ilustracion-superior"
          src={ilustracionNaranja}
          alt=""
        />
        <img
          className="hero-ilustracion hero-ilustracion-inferior"
          src={ilustracionRosa}
          alt=""
        />
        <p className="hero-tarjeta">{textoTarjeta}</p>
      </div>
    </section>
  );
}
