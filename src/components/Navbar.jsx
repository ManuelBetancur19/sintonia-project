import "./Navbar.css"

const Navbar = () => {
    return (
        <header className="navbar">
            <nav
                className="contenedor navbar-interior"
                aria-label="Navegacion Principal"
            >
                <a href="" className="navbar-marca" hre="#inicio">
                    <span className="navbar-simbolo" aria-hidden="true">
                        R
                    </span>
                    <span>Mi sitio React</span>
                </a>
                <div className="navbar-panel">
                    <ul className="navbar-enlaces">
                        <li><a href="#inicio">Inicio</a></li>
                        <li><a href="#practica">Practica</a></li>
                        <li><a href="#contacto">Contacto</a></li>
                    </ul>
                    <a href="#practica" className="navbar-accion">Comenzar</a>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;