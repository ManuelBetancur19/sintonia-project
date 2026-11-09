import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router";
import "./App.css";
import AvisoCookies from "./components/avisoCookies/AvisoCookies.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Destacados from "./components/destacados/Destacados.jsx";
import ExploraGeneros from "./components/exploraGeneros/ExploraGeneros.jsx";
import CTA from "./components/cta/CTA.jsx";
import Footer from "./components/footer/Footer.jsx";
import Catalogo from "./components/catalogo/Catalogo.jsx";
import { useHero } from "./hooks/useHero.js";
import { useDestacados } from "./hooks/useDestacados.js";
import { useExploraGeneros } from "./hooks/useExploraGeneros.js";
import { useConsentimiento } from "./hooks/useConsentimiento.js";
import { useGeneroSeleccionado } from "./hooks/useGeneroSeleccionado.js";
import { RUTAS } from "./rutas.js";

function App() {
  const [idioma, setIdioma] = useState("es");
  const location = useLocation();
  const consentimiento = useConsentimiento();
  const avisoCookiesRef = useRef(null);
  const contenidoRef = useRef(null);
  const rutaAnterior = useRef(location.pathname);
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
  const exploraGenerosInicio = useExploraGeneros({ textos: textosCompletos });
  const exploraGenerosCatalogo = useExploraGeneros({
    textos: textosCompletos,
    limite: 12,
  });
  const generoSeleccionado = useGeneroSeleccionado();

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  useLayoutEffect(() => {
    if (rutaAnterior.current !== location.pathname) {
      window.scrollTo(0, 0);
      contenidoRef.current?.focus({ preventScroll: true });
      rutaAnterior.current = location.pathname;
    }
  }, [location.pathname]);

  useEffect(() => {
    const seo = textosCompletos?.paginas?.catalogo?.seo;
    if (location.pathname !== RUTAS.catalogo || !seo?.titulo || !seo?.descripcion) {
      return undefined;
    }

    const tituloAnterior = document.title;
    let metaDescripcion = document.querySelector('meta[name="description"]');
    const metaExistente = Boolean(metaDescripcion);
    if (!metaDescripcion) {
      metaDescripcion = document.createElement("meta");
      metaDescripcion.name = "description";
      document.head.append(metaDescripcion);
    }
    const descripcionAnterior = metaDescripcion.content;
    document.title = seo.titulo;
    metaDescripcion.content = seo.descripcion;

    return () => {
      document.title = tituloAnterior;
      if (metaExistente) {
        metaDescripcion.content = descripcionAnterior;
      } else {
        metaDescripcion.remove();
      }
    };
  }, [location.pathname, textosCompletos]);

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
      />
      <main
        ref={contenidoRef}
        id="contenido"
        className="contenedor"
        tabIndex={-1}
      >
        <Routes>
          <Route
            path={RUTAS.inicio}
            element={
              <>
                <Hero
                  textos={textosHero}
                  textoTarjeta={textoTarjeta}
                  totalGeneros={exploraGenerosInicio.totalGeneros}
                />
                <Destacados {...destacados} />
                <ExploraGeneros {...exploraGenerosInicio} />
                <CTA textos={textosCompletos} />
              </>
            }
          />
          <Route
            path={RUTAS.catalogo}
            element={
              <Catalogo
                textos={
                  textosCompletos
                    ? {
                        catalogo: textosCompletos.paginas?.catalogo,
                        estados: textosCompletos.estados,
                      }
                    : null
                }
                generos={exploraGenerosCatalogo.generos}
                cargandoGeneros={exploraGenerosCatalogo.cargando}
                errorGeneros={exploraGenerosCatalogo.error}
                recargarGeneros={exploraGenerosCatalogo.recargar}
                destacados={destacados}
                generoSeleccionado={generoSeleccionado}
              />
            }
          />
          <Route
            path="*"
            element={
              <PaginaNoEncontrada
                textos={textosCompletos?.estados?.noEncontrado}
              />
            }
          />
        </Routes>
      </main>
      <Footer textos={textosCompletos} />
    </div>
  );
}

function PaginaNoEncontrada({ textos }) {
  if (!textos) return null;

  const titulo = typeof textos === "string" ? textos : textos.titulo;
  const descripcion =
    typeof textos === "object" && textos !== null
      ? textos.descripcion ?? textos.texto
      : null;

  return (
    <section className="estado-ruta" aria-labelledby="estado-ruta-titulo">
      {titulo ? <h1 id="estado-ruta-titulo">{titulo}</h1> : null}
      {descripcion ? <p>{descripcion}</p> : null}
      {typeof textos === "object" && textos?.botones?.irAlInicio ? (
        <Link to={RUTAS.inicio}>{textos.botones.irAlInicio}</Link>
      ) : null}
    </section>
  );
}

export default App;
