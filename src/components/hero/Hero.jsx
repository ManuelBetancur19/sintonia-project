// RESPONSABILIDAD: Presenta el mensaje principal, acciones y cifras de inicio.
import { Link } from "react-router";
import ilustracionTurquesa from "../../assets/ilustraciones/Hero (2).svg";
import ilustracionRosa from "../../assets/ilustraciones/Hero (3).svg";
import ilustracionNaranja from "../../assets/ilustraciones/Hero.svg";
import { RUTAS } from "../../rutas.js";
import "./Hero.css";

export default function Hero({ textos, totalGeneros, textoTarjeta }) {
  // No renderiza la portada hasta que los textos del hero y las cifras estén disponibles.
  if (!textos?.hero || !textos?.cifras) return null;

  // Separa los textos del hero de las cifras para usarlos más abajo.
  const { hero, cifras } = textos;

  return (
    // [ACCESIBILIDAD] El título nombra la sección para lectores de pantalla.
    <section className="hero" aria-labelledby="hero-titulo">
      <div className="hero-contenido">
        {/* [STATIC] Etiqueta de temporada tomada de los textos de la portada. */}
        <span className="hero-etiqueta">{hero.etiquetas.temporada}</span>

        {/* [ACCESIBILIDAD] El id enlaza este h1 con aria-labelledby de la sección. */}
        <h1 id="hero-titulo">{hero.titulo}</h1>
        <p className="hero-subtitulo">{hero.subtitulo}</p>

        {/* Acciones principales: registro como llamada primaria y catálogo como alternativa. */}
        <div className="hero-acciones">
          <Link className="hero-boton hero-boton-primario" to={RUTAS.crearCuenta}>
            {hero.botones.crearCuentaGratis}
          </Link>
          <Link className="hero-boton hero-boton-secundario" to={RUTAS.catalogo}>
            {hero.botones.explorarCatalogo}
          </Link>
        </div>

        {/* [ACCESIBILIDAD] Lista de descripción: cada grupo asocia un valor (dt) con su etiqueta (dd).
            Canciones y cortes salen de los textos; el total de géneros llega por props. */}
        <dl className="hero-cifras">
          <div>
            <dt>{cifras.canciones.valor}</dt>
            <dd>{cifras.canciones.etiqueta}</dd>
          </div>
          <div>
            {/* Muestra un guion mientras el total de géneros no está disponible. */}
            <dt>{totalGeneros ?? "—"}</dt>
            <dd>{cifras.generos.etiqueta}</dd>
          </div>
          <div>
            <dt>{cifras.cortes.valor}</dt>
            <dd>{cifras.cortes.etiqueta}</dd>
          </div>
        </dl>
      </div>

      {/* [ACCESIBILIDAD] El collage se anuncia como una sola imagen con la descripción de la tarjeta;
          las ilustraciones llevan alt vacío porque son decorativas. */}
      <div className="hero-collage" role="img" aria-label={textoTarjeta}>
        {/* Ilustraciones decorativas: su posición y tamaño los define el CSS. */}
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
        {/* Texto repetido a propósito: es el mismo del aria-label, mostrado a quien ve el collage. */}
        <p className="hero-tarjeta">{textoTarjeta}</p>
      </div>
    </section>
  );
}