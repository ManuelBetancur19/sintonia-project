import { useEffect, useId, useRef, useState } from "react";
import Icono from "../Icono/Icono.jsx";
import logo from "../../assets/logo/logo.svg";
import "./Navbar.css";

const RUTAS = {
  inicio: "/",
  catalogo: "/catalogo",
  ingresar: "/ingresar",
  crearCuenta: "/crear-cuenta",
};

export default function Navbar({
  textos,
  cargando,
  error,
  recargar,
  idioma,
  cambiarIdioma,
  activo,
}) {
  const [abierto, setAbierto] = useState(false);
  const botonMenu = useRef(null);
  const idPanel = useId();

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
        <a
          className="navbar-marca"
          href={RUTAS.inicio}
          aria-label={nav?.logo?.aria}
          onClick={cerrarMenu}
        >
          <img className="navbar-logo" src={logo} alt="" />
        </a>

        {menu && (
          <a className="navbar-ingresar-rapido" href={RUTAS.ingresar}>
            {menu.botones?.invitado?.ingresar}
          </a>
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
                    <a
                      href={RUTAS[clave]}
                      aria-current={activo === clave ? "page" : undefined}
                      onClick={cerrarMenu}
                    >
                      {texto}
                    </a>
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

                <a
                  className="navbar-crear-cuenta"
                  href={RUTAS.crearCuenta}
                  onClick={cerrarMenu}
                >
                  {menu?.botones?.invitado?.crearCuenta ??
                    nav.botones?.invitado?.crearCuenta}
                </a>

                <a
                  className="navbar-ingresar-menu"
                  href={RUTAS.ingresar}
                  onClick={cerrarMenu}
                >
                  {menu?.botones?.invitado?.ingresar}
                </a>
                <a
                  className="navbar-ingresar-escritorio"
                  href={RUTAS.ingresar}
                  onClick={cerrarMenu}
                >
                  {nav.botones?.invitado?.ingresar}
                </a>
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
