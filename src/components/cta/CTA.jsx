// RESPONSABILIDAD: Presenta el llamado final a crear una cuenta.
import { Link } from "react-router";
import { RUTAS } from "../../rutas.js";
import "./CTA.css";

export default function CTA({ textos }) {
  // Toma los textos del llamado dentro del inicio público; puede ser undefined si aún no están cargados.
  const cta = textos?.paginas?.inicioPublico?.cta;

  // No renderiza el llamado si falta alguno de los textos necesarios.
  if (!cta?.titulo || !cta?.texto || !cta?.botones?.crearCuentaGratis) return null;

  return (
    // [ACCESIBILIDAD] El título nombra la sección para lectores de pantalla.
    <section className="inicio-cta" aria-labelledby="inicio-cta-titulo">
      <div className="inicio-cta-contenido">
        {/* [ACCESIBILIDAD] El id enlaza este h2 con aria-labelledby de la sección. */}
        <h2 id="inicio-cta-titulo">{cta.titulo}</h2>
        <p>{cta.texto}</p>
      </div>
      {/* Lleva a la página de registro. */}
      <Link className="inicio-cta-enlace" to={RUTAS.crearCuenta}>
        {cta.botones.crearCuentaGratis}
      </Link>
    </section>
  );
}