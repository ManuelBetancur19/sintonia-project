import { useId } from "react";
import logo from "../../assets/logo/logo.svg";
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
            <a className="pie-logo" href="/" aria-label={nombreSitio}>
              <img src={logo} alt="" />
            </a>
            <p>{footer.lema}</p>
          </div>

          <nav className="pie-columna" aria-labelledby={idExplora}>
            <h2 id={idExplora}>{footer.columnas.explora.titulo}</h2>
            <ul>
              <li>
                <a href="/">{footer.columnas.explora.enlaces.inicio}</a>
              </li>
              <li>
                <a href="/catalogo">
                  {footer.columnas.explora.enlaces.catalogo}
                </a>
              </li>
            </ul>
          </nav>

          <nav className="pie-columna" aria-labelledby={idCuenta}>
            <h2 id={idCuenta}>{footer.columnas.cuenta.titulo}</h2>
            <ul>
              <li>
                <a href="/ingresar">
                  {footer.columnas.cuenta.enlaces.ingresar}
                </a>
              </li>
              <li>
                <a href="/crear-cuenta">
                  {footer.columnas.cuenta.enlaces.crearCuenta}
                </a>
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
