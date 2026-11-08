import "./CTA.css";

export default function CTA({ textos }) {
  const cta = textos?.paginas?.inicioPublico?.cta;
  if (!cta?.titulo || !cta?.texto || !cta?.botones?.crearCuentaGratis) return null;

  return (
    <section className="inicio-cta" aria-labelledby="inicio-cta-titulo">
      <div className="inicio-cta-contenido">
        <h2 id="inicio-cta-titulo">{cta.titulo}</h2>
        <p>{cta.texto}</p>
      </div>
      <a className="inicio-cta-enlace" href="/crear-cuenta">
        {cta.botones.crearCuentaGratis}
      </a>
    </section>
  );
}
