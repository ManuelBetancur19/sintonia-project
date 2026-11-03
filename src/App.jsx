import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Destacados from "./components/destacados/Destacados.jsx";
import { useHero } from "./hooks/useHero.js";
import { useDestacados } from "./hooks/useDestacados.js";

function App() {
  const [idioma, setIdioma] = useState("es");
  const {
    textosNavbar,
    textosHero,
    textosCompletos,
    textoTarjeta,
    cargando,
    error,
    recargar,
  } = useHero(idioma);
  const destacados = useDestacados({ textos: textosCompletos });

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  return (
    <div className="sitio">
      <Navbar
        textos={textosNavbar}
        cargando={cargando}
        error={error}
        recargar={recargar}
        idioma={idioma}
        cambiarIdioma={setIdioma}
        activo="inicio"
      />
      <main id="contenido" className="contenedor">
        <Hero
          textos={textosHero}
          textoTarjeta={textoTarjeta}
          totalGeneros={destacados.totalGeneros}
        />
        <Destacados {...destacados} />
      </main>
    </div>
  );
}

export default App;
