import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./App.css";
import AvisoCookies from "./components/avisoCookies/AvisoCookies.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Destacados from "./components/destacados/Destacados.jsx";
import ExploraGeneros from "./components/exploraGeneros/ExploraGeneros.jsx";
import CTA from "./components/cta/CTA.jsx";
import Footer from "./components/footer/Footer.jsx";
import { useHero } from "./hooks/useHero.js";
import { useDestacados } from "./hooks/useDestacados.js";
import { useExploraGeneros } from "./hooks/useExploraGeneros.js";
import { useConsentimiento } from "./hooks/useConsentimiento.js";

function App() {
  const [idioma, setIdioma] = useState("es");
  const consentimiento = useConsentimiento();
  const avisoCookiesRef = useRef(null);
  const contenidoRef = useRef(null);
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
  const exploraGeneros = useExploraGeneros({ textos: textosCompletos });

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  useLayoutEffect(() => {
    const aviso = avisoCookiesRef.current;
    const raiz = document.documentElement;

    if (!aviso) {
      raiz.style.removeProperty("--altura-aviso-cookies");
      return undefined;
    }

    const actualizarAltura = () => {
      const altura = Math.ceil(aviso.getBoundingClientRect().height);
      raiz.style.setProperty("--altura-aviso-cookies", `${altura}px`);
    };

    actualizarAltura();
    const observador = new ResizeObserver(actualizarAltura);
    observador.observe(aviso);

    return () => {
      observador.disconnect();
      raiz.style.removeProperty("--altura-aviso-cookies");
    };
  }, [consentimiento.decidido, textosCompletos]);

  const aceptarCookies = () => {
    consentimiento.aceptar();
    requestAnimationFrame(() => contenidoRef.current?.focus({ preventScroll: true }));
  };

  const rechazarCookies = () => {
    consentimiento.rechazar();
    requestAnimationFrame(() => contenidoRef.current?.focus({ preventScroll: true }));
  };

  return (
    <div className="sitio">
      <AvisoCookies
        referencia={avisoCookiesRef}
        textos={textosCompletos?.cookies?.banner}
        decidido={consentimiento.decidido}
        aceptar={aceptarCookies}
        rechazar={rechazarCookies}
      />
      <Navbar
        textos={textosNavbar}
        cargando={cargando}
        error={error}
        recargar={recargar}
        idioma={idioma}
        cambiarIdioma={setIdioma}
        activo="inicio"
      />
      <main
        ref={contenidoRef}
        id="contenido"
        className="contenedor"
        tabIndex={-1}
      >
        <Hero
          textos={textosHero}
          textoTarjeta={textoTarjeta}
          totalGeneros={exploraGeneros.totalGeneros}
        />
        <Destacados {...destacados} />
        <ExploraGeneros {...exploraGeneros} />
        <CTA textos={textosCompletos} />
      </main>
      <Footer textos={textosCompletos} />
    </div>
  );
}

export default App;
