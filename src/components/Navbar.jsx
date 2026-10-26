import { useEffect, useRef, useState } from "react";
import Icono from "./Icono.jsx";
import logo from "../assets/logo.svg";
import "./Navbar.css";

// Rutas de cada enlace
const RUTAS = {
    inicio: "/",
    catalogo: "/catalogo",
    ingresar: "/ingresar",
    crearCuenta: "/crear-cuenta",
};

// Props: textos, cargando, error, recargar, idioma, cambiarIdioma, activo
export default function Navbar({
    textos,
    cargando,
    error,
    recargar,
    idioma,
    cambiarIdioma,
    activo,
    // ACCESIBILIDAD
    /* textoGrande,
    alternarTexto, */
}) {
    const [abierto, setAbierto] = useState(false);
    const botonMenu = useRef(null);

    // --- Valores derivados ---
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

    // --- Cerrar con Escape y devolver el foco al botón ---
    useEffect(() => {
        function cerrarConEscape(evento) {
            if (evento.key === "Escape" && abierto) {
                setAbierto(false);
                botonMenu.current?.focus();
            }
        }
        document.addEventListener("keydown", cerrarConEscape);
        return () => document.removeEventListener("keydown", cerrarConEscape);
    }, [abierto]);

    const cerrarMenu = () => setAbierto(false);

    return (
        <header className="navbar">
            <nav className="navbar-interior" aria-label={nav?.aria?.navegacion}>
                {/* ---------- Logo ---------- */}
                <a
                    className="navbar-marca"
                    href={RUTAS.inicio}
                    aria-label={nav?.logo?.aria}
                    onClick={cerrarMenu}
                >
                    <img className="navbar-logo" src={logo} alt="" />
                </a>

                {/* ---------- Panel: enlaces, idioma y Crear cuenta ----------
                    En escritorio se ve en fila; en móvil es el menú desplegable */}
                <div
                    id="navbar-panel"
                    className={`navbar-panel${abierto ? " is-abierto" : ""}`}
                    aria-label={menu?.aria}
                    aria-busy={cargando}
                >
                    {cargando && <span className="navbar-esqueleto" role="status" />}

                    {error && (
                        <div className="navbar-estado" role="alert">
                            {/* TODO: texto de error y reintento sin API (preguntar a la profe) */}
                            <button type="button" onClick={recargar}>
                                Reintentar
                            </button>
                        </div>
                    )}

                    {nav && (
                        <>
                            {/*  ACCESIBILIDAD */}
                            {/* <button
                                className="navbar-icono-accesibilidad"
                                type="button"
                                aria-label={nav.aria?.accesibilidad}
                                aria-pressed={textoGrande}
                                onClick={alternarTexto}
                            >
                                <Icono nombre="accesibilidad" />
                            </button> */}
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

                            {/* Selector ES | EN (también aparece dentro del menú móvil) */}
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
                                            className={idioma === valor ? "is-activo" : ""}
                                            aria-pressed={idioma === valor}
                                            onClick={() => cambiarIdioma(valor)}
                                        >
                                            {texto}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Crear cuenta: versión escritorio */}
                            <a
                                className="boton-primario-crear-cuenta-escritorio"
                                href={RUTAS.crearCuenta}
                                onClick={cerrarMenu}
                            >
                                {nav.botones?.invitado?.crearCuenta}
                            </a>

                            {/* Crear cuenta: versión menú móvil */}
                            <a
                                className="boton-primario-crear-cuenta-movil"
                                href={RUTAS.crearCuenta}
                                onClick={cerrarMenu}
                            >
                                {menu?.botones?.invitado?.crearCuenta}
                            </a>
                        </>
                    )}
                </div>

                {/* ---------- Ingresar + hamburguesa (siempre visibles) ---------- */}
                <div className="navbar-acciones">
                    {nav && (
                        <>
                            {/* Ingresar: versión escritorio */}
                            <a
                                className="navbar-ingresar-escritorio"
                                href={RUTAS.ingresar}
                            >
                                {nav.botones?.invitado?.ingresar}
                            </a>

                            {/* Ingresar: versión móvil */}
                            <a
                                className="navbar-ingresar-movil"
                                href={RUTAS.ingresar}
                            >
                                {menu?.botones?.invitado?.ingresar}
                            </a>
                        </>
                    )}
                    <button
                        ref={botonMenu}
                        type="button"
                        className="navbar-icono-hamburguesa"
                        aria-label={abierto ? menu?.cerrar : menu?.abrir}
                        aria-expanded={abierto}
                        aria-controls="navbar-panel"
                        disabled={!menu}
                        onClick={() => setAbierto((valor) => !valor)}
                    >
                        <Icono nombre={abierto ? "cerrar" : "menu"} />
                    </button>
                </div>
            </nav>
        </header>
    );
}