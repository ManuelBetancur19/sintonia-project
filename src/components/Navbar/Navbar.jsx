import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import Icono from "../Icono/Icono.jsx";
import PanelAccesibilidad from "./PanelAccesibilidad.jsx";
import { useAccesibilidad } from "../../hooks/useAccesibilidad.js";
import logo from "../../assets/logo/logo.svg";
import { RUTAS } from "../../rutas.js";
import "./Navbar.css";

export default function Navbar({
  textos,
  cargando,
  error,
  recargar,
  idioma,
  cambiarIdioma,
}) {
  const [abierto, setAbierto] = useState(false);
  const botonMenu = useRef(null);
  const idPanel = useId();
  const location = useLocation();
  const estadoAccesibilidad = useAccesibilidad();

  const nav = textos?.navbar;
  const menu = textos?.menuMovil;
  const codigos = textos?.idioma?.codigos;
  const enlaces = nav
    ? [
        { clave: "inicio", texto: nav.enlaces?.inicio },
        { clave: "catalogo", texto: nav.enlaces?.catalogo },
      ].filter((enlace) => enlace.texto)
    : [];

  const idiomas = [
    { valor: "es", texto: codigos?.es },
    { valor: "en", texto: codigos?.en },
  ];

  useEffect(() => {
    if (!abierto) return undefined;

    function cerrarConEscape(evento) {
      if (evento.key === "Escape") {
        setAbierto(false);
        botonMenu.current?.focus();
      }
    }

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto]);

  const cerrarMenu = () => setAbierto(false);

  return (
    <header
      className={`navbar${abierto ? " menu-abierto" : ""}`}
    >
      <nav className="navbar-interior" aria-label={nav?.aria?.navegacion}>
        <Link
          className="navbar-marca"
          to={RUTAS.inicio}
          aria-label={nav?.logo?.aria}
          onClick={cerrarMenu}
        >
          <img className="navbar-logo" src={logo} alt="" />
        </Link>

        {menu && (
          <Link className="navbar-ingresar-rapido" to={RUTAS.ingresar}>
            {menu.botones?.invitado?.ingresar}
          </Link>
        )}

        <button
          ref={botonMenu}
          type="button"
          className="navbar-icono-hamburguesa"
          aria-label={abierto ? menu?.cerrar : menu?.abrir}
          aria-expanded={abierto}
          aria-controls={idPanel}
          disabled={!menu}
          onClick={() => setAbierto((valor) => !valor)}
        >
          <Icono nombre={abierto ? "cerrar" : "menu"} />
        </button>

        <div
          id={idPanel}
          className={`navbar-panel${abierto ? " is-abierto" : ""}`}
          aria-label={menu?.aria}
          aria-busy={cargando}
        >
          {nav && (
            <>
              <ul className="navbar-enlaces">
                {enlaces.map(({ clave, texto }) => (
                  <li key={clave}>
                    <Link
                      to={RUTAS[clave]}
                      aria-current={location.pathname === RUTAS[clave] ? "page" : undefined}
                      onClick={cerrarMenu}
                    >
                      {texto}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="navbar-acciones">
                <div className="navbar-idioma">
                  <span className="navbar-idioma-titulo">
                    {menu?.secciones?.idioma}
                  </span>
                  <div
                    className="navbar-idioma-opciones"
                    role="group"
                    aria-label={nav.aria?.idioma}
                  >
                    {idiomas.map(({ valor, texto }) => (
                      <button
                        key={valor}
                        type="button"
                        lang={valor}
                        className={idioma === valor ? "is-activo" : ""}
                        aria-pressed={idioma === valor}
                        onClick={() => cambiarIdioma(valor)}
                      >
                        {texto}
                      </button>
                    ))}
                  </div>
                </div>

                <PanelAccesibilidad
                  textos={textos?.accesibilidad}
                  ariaBoton={nav.aria?.accesibilidad}
                  etiquetaMovil={menu?.secciones?.accesibilidad}
                  estado={estadoAccesibilidad}
                />

                <div className="navbar-botones-movil">
                  <Link
                    className="navbar-crear-cuenta"
                    to={RUTAS.crearCuenta}
                    onClick={cerrarMenu}
                  >
                    {menu?.botones?.invitado?.crearCuenta ??
                      nav.botones?.invitado?.crearCuenta}
                  </Link>

                  <Link
                    className="navbar-ingresar-menu"
                    to={RUTAS.ingresar}
                    onClick={cerrarMenu}
                  >
                    {menu?.botones?.invitado?.ingresar}
                  </Link>
                </div>
                <Link
                  className="navbar-ingresar-escritorio"
                  to={RUTAS.ingresar}
                  onClick={cerrarMenu}
                >
                  {nav.botones?.invitado?.ingresar}
                </Link>
              </div>
            </>
          )}
        </div>
      </nav>

      {(cargando || error) && (
        <div className="navbar-feedback">
          {cargando && (
            <span className="navbar-esqueleto" role="status">
              Cargando navegación…
            </span>
          )}
          {error && (
            <div className="navbar-estado" role="alert">
              <span>No se pudo cargar la navegación.</span>
              <button type="button" onClick={recargar}>
                Reintentar
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
