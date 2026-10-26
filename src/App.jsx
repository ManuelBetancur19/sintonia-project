import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar.jsx";
import { useTextosNavbar } from "./hooks/useTextosNavbar.js";

function App() {
  const [idioma, setIdioma] = useState("es");
  const { textos, cargando, error, recargar } = useTextosNavbar(idioma);

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  return (
    <div className="sitio">
      <Navbar
        textos={textos}
        cargando={cargando}
        error={error}
        recargar={recargar}
        idioma={idioma}
        cambiarIdioma={setIdioma}
        activo="inicio"
      />
      <main className="contenedor">{/* vistas */}</main>
    </div>
  );
}

export default App;