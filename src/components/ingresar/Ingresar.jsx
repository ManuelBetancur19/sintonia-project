// RESPONSABILIDAD: Presenta la composición de dos columnas de inicio de sesión.
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { usePortadasIngreso } from "../../hooks/usePortadasIngreso.js";
import PortadaAlbum from "../destacados/PortadaAlbum.jsx";
import { RUTAS } from "../../rutas.js";
import logo from "../../assets/logo/logo.svg";
import ilustracionTurquesa from "../../assets/ilustraciones/Hero (2).svg";
import ilustracionRosa from "../../assets/ilustraciones/Hero (3).svg";
import ilustracionNaranja from "../../assets/ilustraciones/Hero.svg";
import "./Ingresar.css";

const TEXTO_LOCAL = {
  es: {
    promocionTitulo: "Tu música, siempre a mano",
    promocionTexto: "Explora álbumes y artistas de todos los géneros.",
    validacion: "Revisa los campos marcados",
    descripcionValidacion: "Para ingresar escribe tu correo y tu contraseña.",
    titulo: "Ingresa a tu cuenta",
    descripcion: "Ingresa con tu correo electrónico y contraseña.",
    correo: "Correo electrónico",
    clave: "Contraseña",
    recordar: "Mantener la sesión iniciada",
    mostrarClave: "Mostrar contraseña",
    ocultarClave: "Ocultar contraseña",
    recuperar: "¿Olvidaste tu contraseña?",
    enviar: "Ingresar",
    cargando: "Ingresando…",
    crearCuenta: "¿Aún no tienes cuenta?",
    enlaceCrearCuenta: "Crear cuenta",
    credenciales: "El correo o la contraseña son incorrectos.",
    limite: "Demasiados intentos. Respeta la espera indicada por el servidor.",
    espera: "Espera {segundos} s para volver a intentarlo.",
    conexionTitulo: "No pudimos conectarnos",
    conexion: "Revisa tu conexión a internet e inténtalo de nuevo. Lo que escribiste se conserva",
    reintentar: "Reintentar",
    general: "No se pudo iniciar sesión. Inténtalo de nuevo.",
    exito: "Sesión iniciada.",
    errorCorreo: "Escribe tu correo electrónico.",
    errorClave: "Escribe tu contraseña.",
  },
  en: {
    promocionTitulo: "Your music, always at hand",
    promocionTexto: "Explore albums and artists across every genre.",
    validacion: "Review the marked fields",
    descripcionValidacion: "Enter your email address and password to continue.",
    titulo: "Log in to your account",
    descripcion: "Sign in with your email address and password.",
    correo: "Email address",
    clave: "Password",
    recordar: "Keep me signed in",
    mostrarClave: "Show password",
    ocultarClave: "Hide password",
    recuperar: "Forgot your password?",
    enviar: "Log in",
    cargando: "Signing in…",
    crearCuenta: "Don't have an account yet?",
    enlaceCrearCuenta: "Create account",
    credenciales: "The email or password is incorrect.",
    limite: "Too many attempts. Wait for the server's retry period to end.",
    espera: "Wait {segundos}s before trying again.",
    conexionTitulo: "We couldn't connect",
    conexion: "Check your internet connection and try again. What you entered will be kept.",
    reintentar: "Try again",
    general: "Could not sign in. Please try again.",
    exito: "Signed in successfully.",
    errorCorreo: "Enter your email address.",
    errorClave: "Enter your password.",
  },
};

function textoNoVacio(valor, respaldo) {
  return typeof valor === "string" && valor.trim() ? valor : respaldo;
}

function obtenerDestinoSeguro(origen) {
  let ruta = origen;
  if (origen && typeof origen === "object") {
    ruta = `${origen.pathname ?? ""}${origen.search ?? ""}${origen.hash ?? ""}`;
  }

  if (typeof ruta !== "string" || !ruta.startsWith("/") || ruta.startsWith("//") || ruta.includes("\\")) {
    return RUTAS.inicio;
  }

  try {
    const destino = new URL(ruta, window.location.origin);
    const pathnameNormalizado = destino.pathname.replace(/\/+$/, "") || "/";
    if (
      destino.origin !== window.location.origin
      || pathnameNormalizado === RUTAS.ingresar
      || pathnameNormalizado === RUTAS.recuperarClave
    ) {
      return RUTAS.inicio;
    }
    return `${destino.pathname}${destino.search}${destino.hash}`;
  } catch {
    return RUTAS.inicio;
  }
}

function AvisoFormulario({ titulo, descripcion }) {
  if (!titulo) return null;
  return (
    <div className="ingresar-aviso-formulario" role="alert">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5m0 3h.01" />
      </svg>
      <div>
        <strong>{titulo}</strong>
        {descripcion ? <p>{descripcion}</p> : null}
      </div>
    </div>
  );
}

export default function Ingresar({ textos, idioma, sesion }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [erroresLocales, setErroresLocales] = useState({});
  const destino = obtenerDestinoSeguro(location.state?.from);
  const portadas = usePortadasIngreso();
  const local = TEXTO_LOCAL[idioma] ?? TEXTO_LOCAL.es;
  const pagina = textos?.paginas?.ingresar ?? textos?.paginas?.sesion ?? {};
  const campoCorreo = pagina.campos?.correo ?? {};
  const campoClave = pagina.campos?.clave ?? {};
  const campoRecordar = pagina.campos?.recordarSesion ?? {};
  const invitado = textos?.navbar?.botones?.invitado;
  const promocion = pagina.promocional ?? {};
  const textoPromocion = {
    titulo: textoNoVacio(promocion.titulo, local.promocionTitulo),
    descripcion: textoNoVacio(promocion.texto, local.promocionTexto),
  };
  const pieDerechos = textos?.footer?.legal?.derechos;
  const etiqueta = {
    titulo: textoNoVacio(pagina.titulo, local.titulo),
    descripcion: textoNoVacio(pagina.descripcion, local.descripcion),
    correo: textoNoVacio(campoCorreo.etiqueta ?? campoCorreo.label, local.correo),
    clave: textoNoVacio(campoClave.etiqueta ?? campoClave.label, local.clave),
    recordar: textoNoVacio(campoRecordar.etiqueta ?? campoRecordar.label, local.recordar),
    mostrarClave: textoNoVacio(campoClave.mostrar ?? pagina.botones?.mostrarClave, local.mostrarClave),
    ocultarClave: textoNoVacio(campoClave.ocultar ?? pagina.botones?.ocultarClave, local.ocultarClave),
    recuperar: textoNoVacio(pagina.recuperar?.texto ?? pagina.recuperar, local.recuperar),
    enviar: textoNoVacio(pagina.botones?.enviar ?? invitado?.ingresar, local.enviar),
    cargando: textoNoVacio(pagina.botones?.cargando, local.cargando),
    crearCuenta: textoNoVacio(pagina.crearCuenta?.texto, local.crearCuenta),
    enlaceCrearCuenta: textoNoVacio(pagina.crearCuenta?.enlace, invitado?.crearCuenta ?? local.enlaceCrearCuenta),
    credenciales: textoNoVacio(pagina.errores?.credenciales, local.credenciales),
    limite: textoNoVacio(pagina.errores?.limite, local.limite),
    validacion: textoNoVacio(pagina.errores?.validacion, local.validacion),
    descripcionValidacion: textoNoVacio(pagina.descripcion, local.descripcionValidacion),
    espera: textoNoVacio(pagina.errores?.espera, local.espera),
    conexionTitulo: textoNoVacio(textos?.estados?.sinConexion?.titulo, local.conexionTitulo),
    conexion: textoNoVacio(textos?.estados?.sinConexion?.descripcion, local.conexion),
    reintentar: textoNoVacio(textos?.estados?.sinConexion?.botones?.reintentar, local.reintentar),
    general: textoNoVacio(textos?.estados?.error?.descripcion, local.general),
    exito: textoNoVacio(pagina.mensajes?.exito, local.exito),
    errorCorreo: textoNoVacio(campoCorreo.error, local.errorCorreo),
    errorClave: textoNoVacio(campoClave.error, local.errorClave),
  };

  const errorGeneral = {
    credenciales: etiqueta.credenciales,
    limite: etiqueta.limite.replace("{segundos}", String(sesion.segundosBloqueo || "")),
    conexion: etiqueta.conexionTitulo,
    general: etiqueta.general,
    validacion: etiqueta.validacion,
  }[sesion.error];
  const errorCorreo = erroresLocales.correo ?? sesion.erroresCampos.correo;
  const errorClave = erroresLocales.clave ?? sesion.erroresCampos.clave;
  const hayErroresLocales = Object.keys(erroresLocales).length > 0;
  const espera = etiqueta.espera.replace("{segundos}", String(sesion.segundosBloqueo));
  const bloquearFormulario = sesion.cargando || sesion.segundosBloqueo > 0 || sesion.iniciada;
  const derechos = typeof pieDerechos === "string"
    ? pieDerechos.replaceAll("{anio}", String(new Date().getFullYear()))
    : null;

  useEffect(() => {
    if (sesion.iniciada) navigate(destino, { replace: true });
  }, [sesion.iniciada, navigate, destino]);

  async function enviarFormulario(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const campoCorreoInput = formulario.elements.namedItem("correo");
    const errores = {};
    if (!correo.trim() || !campoCorreoInput.validity.valid) errores.correo = etiqueta.errorCorreo;
    if (!clave) errores.clave = etiqueta.errorClave;

    if (Object.keys(errores).length > 0) {
      sesion.limpiarError();
      setErroresLocales(errores);
      return;
    }

    setErroresLocales({});
    const correcto = await sesion.iniciar(correo.trim(), clave, sesion.recordarSesion);
    if (correcto) setClave("");
  }

  function cambiarCorreo(evento) {
    const valor = evento.target.value;
    setCorreo(valor);
    setErroresLocales((actuales) => {
      if (!actuales.correo || !valor.trim() || !evento.target.validity.valid) return actuales;
      const restantes = { ...actuales };
      delete restantes.correo;
      return restantes;
    });
    sesion.limpiarErrorCampo("correo");
  }

  function cambiarClave(evento) {
    const valor = evento.target.value;
    setClave(valor);
    setErroresLocales((actuales) => {
      if (!actuales.clave || !valor) return actuales;
      const restantes = { ...actuales };
      delete restantes.clave;
      return restantes;
    });
    sesion.limpiarErrorCampo("clave");
  }

  return (
    <section className="ingresar-vista" aria-labelledby="ingresar-titulo">
      <div className="ingresar-collage-movil" aria-hidden="true">
        <img className="ingresar-collage-principal" src={ilustracionTurquesa} alt="" />
        <img className="ingresar-collage-rosa" src={ilustracionRosa} alt="" />
        <img className="ingresar-collage-naranja" src={ilustracionNaranja} alt="" />
      </div>

      <div className="ingresar-columna-formulario">
        <div className="ingresar-cabecera">
          <Link
            className="ingresar-marca"
            to={RUTAS.inicio}
            aria-label={textos?.navbar?.logo?.aria ?? textos?.sitio?.nombre}
          >
            <img src={logo} alt="" />
          </Link>
        </div>

        <div className="ingresar-contenido">
          <div className="ingresar-tarjeta">
            <header className="ingresar-encabezado">
              <h1 id="ingresar-titulo">{etiqueta.titulo}</h1>
              <p>{etiqueta.descripcion}</p>
            </header>

            {sesion.iniciada ? (
              <div className="ingresar-mensaje ingresar-mensaje--exito" role="status">
                <p>{etiqueta.exito}</p>
                {sesion.usuario?.nombre ? <strong>{sesion.usuario.nombre}</strong> : null}
                {sesion.usuario?.correo ? <span>{sesion.usuario.correo}</span> : null}
              </div>
            ) : (
              <form className="ingresar-formulario" onSubmit={enviarFormulario} noValidate>
                <AvisoFormulario
                  titulo={hayErroresLocales ? etiqueta.validacion : errorGeneral}
                  descripcion={hayErroresLocales
                    ? etiqueta.descripcionValidacion
                    : sesion.error === "conexion" ? etiqueta.conexion : undefined}
                />
                {sesion.segundosBloqueo > 0 ? <p className="ingresar-espera" role="status">{espera}</p> : null}

                <div className="ingresar-campo">
                  <label htmlFor="ingresar-correo">{etiqueta.correo}</label>
                  <input
                    id="ingresar-correo"
                    name="correo"
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    value={correo}
                    onChange={cambiarCorreo}
                    required
                    disabled={bloquearFormulario}
                    aria-invalid={Boolean(errorCorreo)}
                    aria-describedby={errorCorreo ? "ingresar-error-correo" : undefined}
                  />
                  {errorCorreo ? (
                    <span className="ingresar-error-campo" id="ingresar-error-correo">
                      {errorCorreo}
                    </span>
                  ) : null}
                </div>

                <div className="ingresar-campo">
                  <label htmlFor="ingresar-clave">{etiqueta.clave}</label>
                  <div className="ingresar-clave-control">
                    <input
                      id="ingresar-clave"
                      name="clave"
                      type={mostrarClave ? "text" : "password"}
                      autoComplete="current-password"
                      value={clave}
                      onChange={cambiarClave}
                      required
                      disabled={bloquearFormulario}
                      aria-invalid={Boolean(errorClave)}
                      aria-describedby={errorClave ? "ingresar-error-clave" : undefined}
                    />
                    <button
                      className="ingresar-mostrar-clave"
                      type="button"
                      aria-label={mostrarClave ? etiqueta.ocultarClave : etiqueta.mostrarClave}
                      aria-pressed={mostrarClave}
                      onClick={() => setMostrarClave((visible) => !visible)}
                      disabled={bloquearFormulario}
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2.5 12s3.4-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.4 6.5-9.5 6.5S2.5 12 2.5 12Z" />
                        <circle cx="12" cy="12" r="2.5" />
                        {mostrarClave ? <path d="m4 4 16 16" /> : null}
                      </svg>
                    </button>
                  </div>
                  {errorClave ? (
                    <span className="ingresar-error-campo" id="ingresar-error-clave">
                      {errorClave}
                    </span>
                  ) : null}
                </div>

                <div className="ingresar-opciones">
                  <label className="ingresar-recordar">
                    <input
                      type="checkbox"
                      checked={sesion.recordarSesion}
                      onChange={(evento) => sesion.setRecordarSesion(evento.target.checked)}
                      disabled={bloquearFormulario}
                    />
                    <span>{etiqueta.recordar}</span>
                  </label>
                  <Link
                    className="ingresar-recuperar"
                    to={RUTAS.recuperarClave}
                    state={{ from: location.state?.from }}
                  >
                    {etiqueta.recuperar}
                  </Link>
                </div>

                <button className="ingresar-enviar" type="submit" disabled={bloquearFormulario}>
                  {sesion.cargando
                    ? etiqueta.cargando
                    : sesion.error === "conexion" ? etiqueta.reintentar : etiqueta.enviar}
                </button>
              </form>
            )}

            {!sesion.iniciada ? (
              <p className="ingresar-crear-cuenta">
                {etiqueta.crearCuenta} <Link to={RUTAS.crearCuenta}>{etiqueta.enlaceCrearCuenta}</Link>
              </p>
            ) : null}
          </div>
        </div>

        {derechos ? <p className="ingresar-derechos">{derechos}</p> : null}
      </div>

      <aside className="ingresar-panel-arte">
        <div className="ingresar-cuadricula" aria-hidden="true">
          {portadas.map((album) => (
            <div className="ingresar-portada" key={album.id}>
              <PortadaAlbum portada={album.portada} />
            </div>
          ))}
        </div>
        {textoPromocion.titulo && textoPromocion.descripcion ? (
          <div className="ingresar-promocion">
            <h2 id="ingresar-promocion-titulo">{textoPromocion.titulo}</h2>
            <p>{textoPromocion.descripcion}</p>
          </div>
        ) : null}
      </aside>
    </section>
  );
}
