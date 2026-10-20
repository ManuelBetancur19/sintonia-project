import { useState } from "react";
import "./Navbar.css";
import Icono from "../components/Icono";

const ENLACES = [
    { id: "descubrir", href: "#descubrir", es: "Descubrir", en: "Discover" },
    { id: "planes", href: "#planes", es: "Planes", en: "Plans" },
    { id: "para-artistas", href: "#para-artistas", es: "Para artistas", en: "For artists" },
    { id: "ayuda", href: "#ayuda", es: "Ayuda", en: "Help" },
];

const Navbar = ({
    idioma = "es",
    cambiarIdioma,
    activo,
    textoGrande,
    alternarTexto,
}) => {
    const [abierto, setAbierto] = useState(false);
    const ingles = idioma === "en";

    return (
        <header className="navbar">
            <nav
                className="navbar-interior"
                aria-label={ingles ? "Main navigation" : "Navegación principal"}
            >
                <a
                    className="navbar-marca"
                    href="#inicio"
                    aria-label={ingles ? "Home" : "Inicio"}
                    onClick={() => setAbierto(false)}
                >
                    <span className="navbar-simbolo" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4" />
                        </svg>
                    </span>
                    <span>sintonía</span>
                </a>

                <div
                    id="navbar-panel"
                    className={`navbar-panel${abierto ? " is-abierto" : ""}`}
                >
                    <ul className="navbar-enlaces">
                        {ENLACES.map((enlace) => (
                            <li key={enlace.id}>
                                <a
                                    href={enlace.href}
                                    aria-current={activo === enlace.id ? "page" : undefined}
                                    onClick={() => setAbierto(false)}
                                >
                                    {ingles ? enlace.en : enlace.es}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="navbar-utilidades">
                        <label className="navbar-idioma">
                            <Icono nombre="idioma" />
                            <select
                                value={idioma}
                                onChange={(evento) => cambiarIdioma?.(evento.target.value)}
                                aria-label={ingles ? "Change language" : "Cambiar idioma"}
                            >
                                <option value="es">ES</option>
                                <option value="en">EN</option>
                            </select>
                        </label>

                        <button
                            className="navbar-icono navbar-accesibilidad"
                            type="button"
                            aria-label={ingles ? "Enlarge text" : "Aumentar texto"}
                            aria-pressed={textoGrande}
                            onClick={alternarTexto}
                        >
                            <Icono nombre="accesibilidad" />
                        </button>

                        <a
                            className="navbar-ingresar"
                            href="#ingresar"
                            onClick={() => setAbierto(false)}
                        >
                            {ingles ? "Log in" : "Ingresar"}
                        </a>

                        <a
                            className="navbar-accion"
                            href="#crear-cuenta"
                            onClick={() => setAbierto(false)}
                        >
                            {ingles ? "Sign up" : "Crear cuenta"}
                        </a>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;