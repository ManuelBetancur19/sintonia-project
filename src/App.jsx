// RESPONSABILIDAD: Coordina rutas, datos globales y secciones de la aplicación.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router";
import "./App.css";
import AvisoCookies from "./components/avisoCookies/AvisoCookies.jsx";
import Navbar from "./components/navbar/Navbar.jsx";
import Hero from "./components/hero/Hero.jsx";
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
  // [LOCAL] Idioma actual de la interfaz; empieza en español.
  const [idioma, setIdioma] = useState("es");
  const location = useLocation();
  // Estado y acciones del consentimiento de cookies.
  const consentimiento = useConsentimiento();
  // Referencias: el aviso de cookies (para medir su altura), el contenido principal (para mover el foco)
  // y la ruta anterior (para detectar cambios de pathname).
  const avisoCookiesRef = useRef(null);
  const contenidoRef = useRef(null);
  const rutaAnterior = useRef(location.pathname);
  // Textos del idioma actual (navbar, hero y completos) junto con el estado de carga, error y reintento.
  const {
    textosNavbar,
    textosHero,
    textosCompletos,
    textoTarjeta,
    cargando,
    error,
    recargar,
  } = useHero(idioma);
  // Datos de las secciones; el inicio y el catálogo usan listas de géneros distintas (el catálogo limita a 12).
  const destacados = useDestacados({ textos: textosCompletos });
  const exploraGenerosInicio = useExploraGeneros({ textos: textosCompletos });
  const exploraGenerosCatalogo = useExploraGeneros({
    textos: textosCompletos,
    limite: 12,
  });
  const generoSeleccionado = useGeneroSeleccionado();

  // [ACCESIBILIDAD] Sincroniza el atributo lang del documento con el idioma elegido.
  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  // [ACCESIBILIDAD] Mueve scroll y foco solo al cambiar pathname, no al cambiar ?genero=.
  useLayoutEffect(() => {
    if (rutaAnterior.current !== location.pathname) {
      window.scrollTo(0, 0);
      contenidoRef.current?.focus({ preventScroll: true });
      rutaAnterior.current = location.pathname;
    }
  }, [location.pathname]);

  // [LOCAL] Actualiza los metadatos del catálogo y restaura los valores anteriores al salir.
  useEffect(() => {
    const seo = textosCompletos?.paginas?.catalogo?.seo;
    // No cambia nada si no es el catálogo o si faltan el título o la descripción.
    if (location.pathname !== RUTAS.catalogo || !seo?.titulo || !seo?.descripcion) {
      return undefined;
    }

    // Guarda el título anterior y reutiliza la meta description existente; si no hay, la crea.
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

    // Al salir restaura el título y la descripción anteriores; si la meta la creó este efecto, la elimina.
    return () => {
      document.title = tituloAnterior;
      if (metaExistente) {
        metaDescripcion.content = descripcionAnterior;
      } else {
        metaDescripcion.remove();
      }
    };
  }, [location.pathname, textosCompletos]);

  // [LOCAL] Reserva el espacio ocupado por el aviso mientras cambia su altura.
  useLayoutEffect(() => {
    const aviso = avisoCookiesRef.current;
    const raiz = document.documentElement;

    // Sin aviso en pantalla, no se reserva espacio y se quita la variable de altura.
    if (!aviso) {
      raiz.style.removeProperty("--altura-aviso-cookies");
      return undefined;
    }

    const actualizarAltura = () => {
      const altura = Math.ceil(aviso.getBoundingClientRect().height);
      raiz.style.setProperty("--altura-aviso-cookies", `${altura}px`);
    };

    // Mide el aviso al montarlo y vuelve a medirlo cada vez que cambia de tamaño.
    actualizarAltura();
    const observador = new ResizeObserver(actualizarAltura);
    observador.observe(aviso);

    // Deja de observar el aviso y quita la variable de altura al desmontarlo.
    return () => {
      observador.disconnect();
      raiz.style.removeProperty("--altura-aviso-cookies");
    };
  }, [consentimiento.decidido, textosCompletos]);

  // [ACCESIBILIDAD] Devuelve el foco al contenido principal después de decidir.
  const aceptarCookies = () => {
    consentimiento.aceptar();
    requestAnimationFrame(() => contenidoRef.current?.focus({ preventScroll: true }));
  };

  const rechazarCookies = () => {
    consentimiento.rechazar();
    requestAnimationFrame(() => contenidoRef.current?.focus({ preventScroll: true }));
  };

  return (
    // Estructura general: aviso de cookies, navegación, contenido principal por rutas y pie de página.
    <div className="sitio">
      {/* Aviso de consentimiento: recibe la referencia para medir su altura y las acciones de decisión. */}
      <AvisoCookies
        referencia={avisoCookiesRef}
        textos={textosCompletos?.cookies?.banner}
        decidido={consentimiento.decidido}
        aceptar={aceptarCookies}
        rechazar={rechazarCookies}
      />
      {/* Navegación con el selector de idioma y la opción de recargar si falló la carga de textos. */}
      <Navbar
        textos={textosNavbar}
        cargando={cargando}
        error={error}
        recargar={recargar}
        idioma={idioma}
        cambiarIdioma={setIdioma}
      />
      {/* [ACCESIBILIDAD] Con tabIndex -1 el contenido no entra en el orden de tabulación,
          pero puede recibir el foco desde el código al cambiar de ruta o decidir las cookies. */}
      <main
        ref={contenidoRef}
        id="contenido"
        className="contenedor"
        tabIndex={-1}
      >
        <Routes>
          {/* Inicio: portada, destacados, géneros y llamada a la acción. */}
          <Route
            path={RUTAS.inicio}
            element={
              <>
                {/* El hero recibe el total de géneros para mostrarlo en sus cifras. */}
                <Hero
                  textos={textosHero}
                  textoTarjeta={textoTarjeta}
                  totalGeneros={exploraGenerosInicio.totalGeneros}
                />
                {/* Destacados y géneros reciben el estado completo de sus hooks como props. */}
                <Destacados {...destacados} />
                <ExploraGeneros {...exploraGenerosInicio} />
                <CTA textos={textosCompletos} />
              </>
            }
          />
          {/* Catálogo: arma el objeto de textos solo cuando los textos completos están disponibles; mientras tanto recibe null. */}
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
          {/* Cualquier otra ruta muestra la página no encontrada. */}
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
  // No renderiza nada hasta que los textos estén disponibles.
  if (!textos) return null;

  // Acepta los textos como cadena (se usa como título) o como objeto;
  // en el objeto, la descripción usa descripcion o, si falta, texto.
  const titulo = typeof textos === "string" ? textos : textos.titulo;
  const descripcion =
    typeof textos === "object" && textos !== null
      ? textos.descripcion ?? textos.texto
      : null;

  return (
    // [ACCESIBILIDAD] El título nombra la sección para lectores de pantalla.
    <section className="estado-ruta" aria-labelledby="estado-ruta-titulo">
      {/* [ACCESIBILIDAD] El id enlaza este h1 con aria-labelledby de la sección; se muestra solo si hay título. */}
      {titulo ? <h1 id="estado-ruta-titulo">{titulo}</h1> : null}
      {/* Muestra la descripción solo si existe. */}
      {descripcion ? <p>{descripcion}</p> : null}
      {/* Muestra el enlace al inicio solo si los textos incluyen el botón. */}
      {typeof textos === "object" && textos?.botones?.irAlInicio ? (
        <Link to={RUTAS.inicio}>{textos.botones.irAlInicio}</Link>
      ) : null}
    </section>
  );
}

export default App;