// RESPONSABILIDAD: Presenta la navegación, el idioma y el menú móvil.
import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import Icono from "../Icono/Icono.jsx";
import PanelAccesibilidad from "./PanelAccesibilidad.jsx";
import { useAccesibilidad } from "../../hooks/useAccesibilidad.js";
import logo from "../../assets/logo/logo.svg";
import { RUTAS } from "../../rutas.js";
import "./Navbar.css";

// Props: textos trae los textos de la barra y del menú móvil; cargando, error y recargar
// controlan su estado de carga; idioma y cambiarIdioma gobiernan el selector de idioma.
export default function Navbar({
  textos,
  cargando,
  error,
  recargar,
  idioma,
  cambiarIdioma,
}) {
  // [LOCAL] Estado del menú móvil y referencia a su botón, usada para devolverle el foco al cerrar.
  const [abierto, setAbierto] = useState(false);
  const botonMenu = useRef(null);

  // Id único para enlazar el botón con el panel, ruta actual para marcar el enlace activo
  // y estado del panel de accesibilidad.
  const idPanel = useId();
  const location = useLocation();
  const estadoAccesibilidad = useAccesibilidad();

  // Separa las secciones de textos que se usan más abajo; el encadenado opcional evita errores mientras no han cargado.
  const nav = textos?.navbar;
  const menu = textos?.menuMovil;
  const codigos = textos?.idioma?.codigos;

  // Arma la lista de enlaces y descarta los que no tienen texto; queda vacía mientras no hay textos de navegación.
  const enlaces = nav
    ? [
        { clave: "inicio", texto: nav.enlaces?.inicio },
        { clave: "catalogo", texto: nav.enlaces?.catalogo },
      ].filter((enlace) => enlace.texto)
    : [];

  // [STATIC] Idiomas disponibles; los códigos que se muestran salen de los textos.
  const idiomas = [
    { valor: "es", texto: codigos?.es },
    { valor: "en", texto: codigos?.en },
  ];

  useEffect(() => {
    // Solo actúa mientras el menú está abierto.
    if (!abierto) return undefined;

    // [ACCESIBILIDAD] Cierra el menú con Escape y devuelve el foco al botón disparador.
    function cerrarConEscape(evento) {
      if (evento.key === "Escape") {
        setAbierto(false);
        botonMenu.current?.focus();
      }
    }

    // Bloquea el scroll de la página mientras el menú está abierto; la limpieza lo restaura y quita el listener.
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto]);

  // Cierra el menú; se usa al navegar para que el panel no quede abierto.
  const cerrarMenu = () => setAbierto(false);

  return (
    // La clase menu-abierto permite al CSS elevar el logo y la hamburguesa por encima del panel.
    <header
      className={`navbar${abierto ? " menu-abierto" : ""}`}
    >
      {/* [ACCESIBILIDAD] El aria-label nombra la región de navegación. */}
      <nav className="navbar-interior" aria-label={nav?.aria?.navegacion}>
        {/* [ACCESIBILIDAD] El enlace de la marca lleva el aria-label; el logo tiene alt vacío para no repetir el nombre. */}
        <Link
          className="navbar-marca"
          to={RUTAS.inicio}
          aria-label={nav?.logo?.aria}
          onClick={cerrarMenu}
        >
          <img className="navbar-logo" src={logo} alt="" />
        </Link>

        {/* Acceso rápido a ingresar en móvil; solo se renderiza cuando hay textos del menú móvil. */}
        {menu && (
          <Link className="navbar-ingresar-rapido" to={RUTAS.ingresar}>
            {menu.botones?.invitado?.ingresar}
          </Link>
        )}

        {/* [ACCESIBILIDAD] El nombre cambia entre abrir y cerrar; aria-expanded y aria-controls enlazan el botón con el panel.
            Queda deshabilitado mientras no hay textos del menú. */}
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

        {/* [ACCESIBILIDAD] El id enlaza este panel con aria-controls del botón; aria-busy indica que aún está cargando. */}
        <div
          id={idPanel}
          className={`navbar-panel${abierto ? " is-abierto" : ""}`}
          aria-label={menu?.aria}
          aria-busy={cargando}
        >
          {/* Muestra enlaces y acciones solo cuando los textos de navegación están disponibles. */}
          {nav && (
            <>
              {/* Un enlace por entrada; cada uno cierra el menú al navegar. */}
              <ul className="navbar-enlaces">
                {enlaces.map(({ clave, texto }) => (
                  <li key={clave}>
                    {/* [ACCESIBILIDAD] aria-current marca el enlace de la página actual. */}
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
                {/* Selector de idioma; el título solo se ve en el menú móvil. */}
                <div className="navbar-idioma">
                  <span className="navbar-idioma-titulo">
                    {menu?.secciones?.idioma}
                  </span>
                  {/* [ACCESIBILIDAD] role="group" nombra el conjunto de botones; aria-pressed indica el idioma activo
                      y lang marca el idioma de cada botón. */}
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

                {/* Panel de accesibilidad: recibe sus textos, el nombre del botón, la etiqueta móvil y el estado. */}
                <PanelAccesibilidad
                  textos={textos?.accesibilidad}
                  ariaBoton={nav.aria?.accesibilidad}
                  etiquetaMovil={menu?.secciones?.accesibilidad}
                  estado={estadoAccesibilidad}
                />

                {/* Botones de cuenta: en móvil se agrupan en una tarjeta con ingresar; en escritorio solo se ve crear cuenta. */}
                <div className="navbar-botones-movil">
                  {/* Prefiere el texto del menú móvil y usa el de la barra como respaldo. */}
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
                {/* Ingresar de escritorio: va aparte porque el CSS lo oculta en móvil, donde se usa el del menú. */}
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

      {/* Muestra el estado de carga o el error de la navegación bajo la barra. */}
      {(cargando || error) && (
        <div className="navbar-feedback">
          {/* [STATIC] Textos fijos del componente: no dependen de los textos cargados, que pueden faltar en este estado.
              [ACCESIBILIDAD] role="status" anuncia la carga sin interrumpir; role="alert" anuncia el error de inmediato. */}
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