import { useId } from "react";
import { Link } from "react-router";
import logo from "../../assets/logo/logo.svg";
import { RUTAS } from "../../rutas.js";
import "./Footer.css";

export default function Footer({ textos }) {
  const footer = textos?.footer;
  const nombreSitio = textos?.sitio?.nombre;
  const idExplora = useId();
  const idCuenta = useId();
  const idLegal = useId();

  if (!footer || !nombreSitio) return null;

  const derechos = footer.legal.derechos.replaceAll(
    "{anio}",
    String(new Date().getFullYear()),
  );

  return (
    <footer className="pie">
      <div className="pie-interior">
        <div className="pie-superior">
          <div className="pie-marca">
            <Link className="pie-logo" to={RUTAS.inicio} aria-label={nombreSitio}>
              <img src={logo} alt="" />
            </Link>
            <p>{footer.lema}</p>
          </div>

          <nav className="pie-columna" aria-labelledby={idExplora}>
            <h2 id={idExplora}>{footer.columnas.explora.titulo}</h2>
            <ul>
              <li>
                <Link to={RUTAS.inicio}>{footer.columnas.explora.enlaces.inicio}</Link>
              </li>
              <li>
                <Link to={RUTAS.catalogo}>
                  {footer.columnas.explora.enlaces.catalogo}
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="pie-columna" aria-labelledby={idCuenta}>
            <h2 id={idCuenta}>{footer.columnas.cuenta.titulo}</h2>
            <ul>
              <li>
                <Link to={RUTAS.ingresar}>
                  {footer.columnas.cuenta.enlaces.ingresar}
                </Link>
              </li>
              <li>
                <Link to={RUTAS.crearCuenta}>
                  {footer.columnas.cuenta.enlaces.crearCuenta}
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="pie-columna" aria-labelledby={idLegal}>
            <h2 id={idLegal}>{footer.columnas.legal.titulo}</h2>
            <ul>
              <li>
                <span>{footer.columnas.legal.enlaces.terminos}</span>
              </li>
              <li>
                <span>{footer.columnas.legal.enlaces.accesibilidad}</span>
              </li>
            </ul>
          </nav>
        </div>

        <div className="pie-inferior">
          <p>{derechos}</p>
          <p>{footer.legal.nota}</p>
        </div>
      </div>
    </footer>
  );
}
