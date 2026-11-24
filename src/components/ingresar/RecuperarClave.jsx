// RESPONSABILIDAD: Presenta el flujo de solicitud de código y cambio de contraseña.
import { useState } from "react";
import { Link } from "react-router";
import { useRecuperacion } from "../../hooks/useRecuperacion.js";
import { RUTAS } from "../../rutas.js";
import logo from "../../assets/logo/logo.svg";
import "./Ingresar.css";
import "./RecuperarClave.css";

const TEXTO_LOCAL = {
  es: {
    titulo: "Recuperar contraseña",
    descripcion: "Solicita un código para crear una contraseña nueva.",
    correo: "Correo electrónico",
    codigo: "Código de recuperación",
    clave: "Nueva contraseña",
    solicitar: "Enviar código",
    enviando: "Enviando…",
    cambiar: "Guardar nueva contraseña",
    guardando: "Guardando…",
    confirmacion: "Si hay una cuenta con ese correo, te enviamos un código.",
    codigoIncorrecto: "El código es incorrecto.",
    codigoVencido: "El código venció. Solicita uno nuevo para continuar.",
    otroCodigo: "Solicitar otro código",
    cuentaPrueba: "Las cuentas de prueba no permiten cambiar la contraseña.",
    validacion: "Revisa los datos e inténtalo de nuevo.",
    conexion: "No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.",
    general: "No se pudo completar la recuperación. Inténtalo de nuevo.",
    errorCorreo: "Escribe un correo electrónico válido.",
    errorCodigo: "Escribe el código de recuperación.",
    errorClave: "La contraseña debe tener entre 8 y 72 caracteres.",
    exito: "Tu contraseña se actualizó correctamente.",
    volver: "Volver a iniciar sesión",
    correoEnviado: "Código enviado",
    codigoDesarrollo: "Código de prueba (solo desarrollo)",
    usarOtroCorreo: "Usar otro correo",
  },
  en: {
    titulo: "Reset password",
    descripcion: "Request a code to set a new password.",
    correo: "Email address",
    codigo: "Recovery code",
    clave: "New password",
    solicitar: "Send code",
    enviando: "Sending…",
    cambiar: "Save new password",
    guardando: "Saving…",
    confirmacion: "If an account exists for that email, we sent a code.",
    codigoIncorrecto: "The code is incorrect.",
    codigoVencido: "The code has expired. Request a new one to continue.",
    otroCodigo: "Request another code",
    cuentaPrueba: "Test accounts cannot change their password.",
    validacion: "Check the information and try again.",
    conexion: "Could not connect. Check your connection and try again.",
    general: "Could not complete the reset. Please try again.",
    errorCorreo: "Enter a valid email address.",
    errorCodigo: "Enter the recovery code.",
    errorClave: "The password must be between 8 and 72 characters.",
    exito: "Your password was updated successfully.",
    volver: "Back to log in",
    correoEnviado: "Code sent",
    codigoDesarrollo: "Test code (development only)",
    usarOtroCorreo: "Use another email",
  },
};

function textoNoVacio(valor, respaldo) {
  return typeof valor === "string" && valor.trim() ? valor : respaldo;
}

export default function RecuperarClave({ textos, idioma }) {
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [clave, setClave] = useState("");
  const recuperacion = useRecuperacion();
  const local = TEXTO_LOCAL[idioma] ?? TEXTO_LOCAL.es;
  const pagina = textos?.paginas?.recuperacion ?? {};
  const campos = pagina.campos ?? {};
  const botones = pagina.botones ?? {};
  const mensajes = pagina.mensajes ?? {};
  const errores = pagina.errores ?? {};
  const etiqueta = {
    titulo: textoNoVacio(pagina.titulo, local.titulo),
    descripcion: textoNoVacio(pagina.descripcion, local.descripcion),
    correo: textoNoVacio(campos.correo?.etiqueta ?? campos.correo?.label, local.correo),
    codigo: textoNoVacio(campos.codigo?.etiqueta ?? campos.codigo?.label, local.codigo),
    clave: textoNoVacio(campos.clave?.etiqueta ?? campos.clave?.label, local.clave),
    solicitar: textoNoVacio(botones.solicitarCodigo, local.solicitar),
    enviando: textoNoVacio(botones.enviando, local.enviando),
    cambiar: textoNoVacio(botones.cambiarClave, local.cambiar),
    guardando: textoNoVacio(botones.guardando, local.guardando),
    confirmacion: textoNoVacio(mensajes.confirmacion, local.confirmacion),
    codigoIncorrecto: textoNoVacio(errores.codigoIncorrecto, local.codigoIncorrecto),
    codigoVencido: textoNoVacio(errores.codigoVencido, local.codigoVencido),
    otroCodigo: textoNoVacio(botones.otroCodigo, local.otroCodigo),
    cuentaPrueba: textoNoVacio(errores.cuentaDePrueba, local.cuentaPrueba),
    validacion: textoNoVacio(errores.validacion, local.validacion),
    conexion: textoNoVacio(textos?.estados?.sinConexion?.descripcion, local.conexion),
    general: textoNoVacio(errores.general, local.general),
    errorCorreo: textoNoVacio(campos.correo?.error, local.errorCorreo),
    errorCodigo: textoNoVacio(campos.codigo?.error, local.errorCodigo),
    errorClave: textoNoVacio(campos.clave?.error, local.errorClave),
    exito: textoNoVacio(mensajes.claveActualizada, local.exito),
    volver: textoNoVacio(botones.volverAIngresar, local.volver),
    correoEnviado: textoNoVacio(mensajes.tituloConfirmacion, local.correoEnviado),
    codigoDesarrollo: textoNoVacio(mensajes.codigoDePrueba, local.codigoDesarrollo),
    usarOtroCorreo: textoNoVacio(botones.usarOtroCorreo, local.usarOtroCorreo),
  };

  const errorGeneral = {
    codigoVencido: etiqueta.codigoVencido,
    cuentaPrueba: etiqueta.cuentaPrueba,
    validacion: etiqueta.validacion,
    conexion: etiqueta.conexion,
    general: etiqueta.general,
  }[recuperacion.error];
  const errorCodigo = recuperacion.error === "codigoIncorrecto"
    ? etiqueta.codigoIncorrecto
    : recuperacion.erroresCampos.codigo;

  async function enviarCorreo(evento) {
    evento.preventDefault();
    await recuperacion.solicitarCodigo(correo.trim());
  }

  async function enviarNuevaClave(evento) {
    evento.preventDefault();
    const correcto = await recuperacion.cambiarClave(correo.trim(), codigo.trim(), clave);
    if (correcto) {
      setClave("");
      setCodigo("");
    }
  }

  function editar(setter, valor) {
    setter(valor);
    recuperacion.limpiarError();
  }

  const completado = recuperacion.paso === "completado";
  const solicitar = recuperacion.paso === "correo";

  return (
    <section className="ingresar-vista" aria-labelledby="recuperar-titulo">
      <div className="ingresar-tarjeta">
        <Link className="ingresar-marca" to={RUTAS.inicio} aria-label={textos?.navbar?.logo?.aria ?? "Sintonía"}>
          <img src={logo} alt="" />
        </Link>
        <header className="ingresar-encabezado">
          <h1 id="recuperar-titulo">{etiqueta.titulo}</h1>
          <p>{etiqueta.descripcion}</p>
        </header>

        {completado ? (
          <div className="ingresar-mensaje ingresar-mensaje--exito" role="status">
            <p>{etiqueta.exito}</p>
            <Link className="ingresar-enlace-volver" to={RUTAS.ingresar}>{etiqueta.volver}</Link>
          </div>
        ) : (
          <>
            {recuperacion.paso === "codigo" ? (
              <div className="recuperar-confirmacion" role="status">
                <strong>{etiqueta.correoEnviado}</strong>
                <p>{etiqueta.confirmacion}</p>
              </div>
            ) : null}

            {errorGeneral ? <p className="ingresar-mensaje" role="alert">{errorGeneral}</p> : null}

            {solicitar ? (
              <form className="ingresar-formulario" onSubmit={enviarCorreo}>
                <div className="ingresar-campo">
                  <label htmlFor="recuperar-correo">{etiqueta.correo}</label>
                  <input
                    id="recuperar-correo"
                    name="correo"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={correo}
                    onChange={(evento) => editar(setCorreo, evento.target.value)}
                    required
                    disabled={recuperacion.cargando}
                    aria-invalid={Boolean(recuperacion.erroresCampos.correo)}
                    aria-describedby={recuperacion.erroresCampos.correo ? "recuperar-error-correo" : undefined}
                  />
                  {recuperacion.erroresCampos.correo ? (
                    <span className="ingresar-error-campo" id="recuperar-error-correo">
                      {recuperacion.erroresCampos.correo}
                    </span>
                  ) : null}
                </div>
                <button className="ingresar-enviar" type="submit" disabled={recuperacion.cargando}>
                  {recuperacion.cargando ? etiqueta.enviando : etiqueta.solicitar}
                </button>
              </form>
            ) : (
              <form className="ingresar-formulario" onSubmit={enviarNuevaClave}>
                <div className="ingresar-campo">
                  <label htmlFor="recuperar-codigo">{etiqueta.codigo}</label>
                  <input
                    id="recuperar-codigo"
                    name="codigo"
                    type="text"
                    autoComplete="one-time-code"
                    value={codigo}
                    onChange={(evento) => editar(setCodigo, evento.target.value)}
                    required
                    disabled={recuperacion.cargando}
                    aria-invalid={Boolean(errorCodigo)}
                    aria-describedby={errorCodigo ? "recuperar-error-codigo" : undefined}
                  />
                  {errorCodigo ? (
                    <span className="ingresar-error-campo" id="recuperar-error-codigo">{errorCodigo}</span>
                  ) : null}
                </div>
                <div className="ingresar-campo">
                  <label htmlFor="recuperar-clave">{etiqueta.clave}</label>
                  <input
                    id="recuperar-clave"
                    name="clave"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    value={clave}
                    onChange={(evento) => editar(setClave, evento.target.value)}
                    required
                    disabled={recuperacion.cargando}
                    aria-invalid={Boolean(recuperacion.erroresCampos.clave)}
                    aria-describedby={recuperacion.erroresCampos.clave ? "recuperar-error-clave" : undefined}
                  />
                  {recuperacion.erroresCampos.clave ? (
                    <span className="ingresar-error-campo" id="recuperar-error-clave">
                      {recuperacion.erroresCampos.clave}
                    </span>
                  ) : null}
                </div>
                {import.meta.env.DEV && recuperacion.codigoDePrueba ? (
                  <p className="recuperar-codigo-prueba" role="note">
                    <span>{etiqueta.codigoDesarrollo}</span>
                    <strong>{recuperacion.codigoDePrueba}</strong>
                  </p>
                ) : null}
                <button className="ingresar-enviar" type="submit" disabled={recuperacion.cargando}>
                  {recuperacion.cargando ? etiqueta.guardando : etiqueta.cambiar}
                </button>
                {recuperacion.error === "codigoVencido" ? (
                  <button
                    className="ingresar-recuperar recuperar-otro-codigo"
                    type="button"
                    onClick={recuperacion.solicitarOtroCodigo}
                  >
                    {etiqueta.otroCodigo}
                  </button>
                ) : null}
                <button
                  className="ingresar-recuperar recuperar-otro-codigo"
                  type="button"
                  onClick={recuperacion.solicitarOtroCodigo}
                >
                  {etiqueta.usarOtroCorreo}
                </button>
              </form>
            )}
          </>
        )}

        {!completado ? (
          <p className="ingresar-crear-cuenta">
            <Link to={RUTAS.ingresar}>{etiqueta.volver}</Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
