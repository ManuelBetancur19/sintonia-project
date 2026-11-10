# Guía de contexto para IA — Sintonía

Este documento resume la arquitectura y las convenciones actuales del proyecto para facilitar futuras tareas de desarrollo asistidas por IA. La fuente de verdad son los archivos del repositorio y el contrato vigente de la API; esta guía no reemplaza ninguno de ellos.

## Contexto del producto

Sintonía es una aplicación web de catálogo musical. La vista de inicio presenta álbumes populares y géneros; la vista de catálogo permite explorar los géneros y consultar el detalle que devuelve la API. La aplicación no implementa reproducción de audio.

## Tecnologías y punto de entrada

- React con componentes `.jsx`.
- Vite como servidor de desarrollo y empaquetador.
- React Router con `BrowserRouter` montado en `src/main.jsx`, por fuera de `App`.
- JavaScript con módulos ES y CSS propio.
- Los paquetes de TypeScript aparecen en dependencias, pero el código actual de `src/` está escrito en JavaScript/JSX. No migres archivos a TypeScript salvo que se solicite expresamente.

`src/main.jsx` carga tokens y estilos globales, crea la raíz de React y envuelve `App` en `StrictMode` y `BrowserRouter`.

## Rutas actuales

Las rutas se centralizan en `src/rutas.js`:

- `/`: inicio público.
- `/catalogo`: catálogo musical.
- `/ingresar` y `/crear-cuenta`: destinos reservados, sin páginas implementadas.

El catálogo lee el filtro de género desde `?genero=<id>`. Las tarjetas de álbum enlazan a `/albumes/:id`, pero esa vista de detalle aún no está registrada en `App.jsx`; hasta que se implemente, cae en la ruta comodín.

`App.jsx` mantiene idioma, carga los textos y compone las secciones. Al cambiar el `pathname`, sube el scroll y enfoca `main#contenido`. Un cambio exclusivo del parámetro `genero` no debe reiniciar el foco ni el scroll.

## Flujo de datos

La dirección base de la API se lee desde `VITE_API_URL` en `src/config.js`. No escribas una URL fija en componentes o servicios.

| Dato | Endpoint | Responsable |
| --- | --- | --- |
| Textos de interfaz por idioma | `GET /textos?idioma=es` o `en` | `useHero.js` |
| Lista de géneros | `GET /generos` | `services/generos.js` y `useExploraGeneros.js` |
| Detalle de género | `GET /generos/:id` | `services/generos.js` y `useGeneroSeleccionado.js` |
| Álbumes destacados | `GET /albumes?orden=populares&limite=6` | `services/albumes.js` y `useDestacados.js` |

`obtenerGeneros()` comparte una solicitud mientras siga en curso. `normalizarGeneroDetalle()` garantiza arreglos para `artistas`, `albumes` y `pistas`, incluso si alguno falta en la respuesta.

Los hooks distinguen fallos de conexión de errores generales y entregan una acción `recargar` cuando la sección muestra error. Conserva la forma de respuesta real de la API y no inventes campos ni endpoints. Si cambia el contrato, valida primero con una respuesta real o el contrato actualizado.

## Composición de la interfaz

- `App.jsx`: carga global, rutas, estado de idioma, consentimiento y composición de vistas.
- `components/navbar/`: navegación, idioma, menú móvil y panel de accesibilidad.
- `components/hero/`: portada y cifras del inicio.
- `components/destacados/`: álbumes populares y SVG inline de portadas.
- `components/exploraGeneros/`: géneros destacados en el inicio.
- `components/catalogo/`: vista del catálogo y contenido del género seleccionado.
- `components/generos/`: tarjeta reutilizable de género.
- `components/albumes/`: tarjeta reutilizable de álbum.
- `components/cta/`: llamado final a crear una cuenta.
- `components/footer/`: pie global.
- `components/avisoCookies/`: aviso de consentimiento.
- `components/Icono/`: iconos de interfaz.

Los componentes reciben datos y textos desde `App.jsx` y sus hooks. No agregues una petición propia a una sección que ya recibe los datos que necesita.

## Activos y estilos

- `assets/logo/`: logotipo del sitio.
- `assets/ilustraciones/`: ilustraciones del hero.
- `assets/generos/`: SVG cuadrados para las portadas de géneros usados por las tarjetas de álbum.
- `assets/catalogo/`: SVG panorámicos usados en las tarjetas del explorador de géneros.
- `styles/tokens.css`: tokens de color, tipografía y otros valores del sistema visual.
- `styles/global.css`: estilos globales y reglas compartidas.
- `styles/accesibilidad.css`: reglas que responden a las preferencias de accesibilidad.

Usa los tokens existentes en vez de fijar colores o tipografías nuevos sin necesidad. Las ilustraciones de `assets/catalogo/` ya contienen su composición visual; no las recortes ni alteres si el pedido no lo requiere.

## Accesibilidad, idioma y consentimiento

- Los textos visibles vienen de `GET /textos`; respeta sus claves y no dupliques contenido con cadenas escritas a mano.
- Mantén nombres accesibles, estados `aria-*`, foco visible y alternativas adecuadas para imágenes decorativas.
- `useAccesibilidad.js` controla el tamaño de texto y otras preferencias visuales.
- `useConsentimiento.js` y `utils/consentimiento.js` controlan el consentimiento. Las preferencias persistentes dependen de que se haya aceptado la categoría correspondiente.
- El idioma actual se conserva en el estado de `App` y se refleja en el atributo `lang` del documento.

## Convenciones para cambios futuros

1. Sigue la organización existente: una carpeta por sección, estilos junto al componente y hooks/servicios en sus carpetas compartidas.
2. Mantén los componentes de presentación enfocados en pintar; coloca carga de datos y lógica compartida en hooks o servicios según la convención ya usada.
3. Reutiliza `RUTAS`, los servicios y los componentes existentes; evita duplicar URLs o solicitudes.
4. No elimines assets ni tokens sin comprobar antes todos sus usos.
5. Respeta el alcance solicitado: no cambies otras secciones, rutas, textos ni comportamiento de manera incidental.
6. No muestres ni registres valores privados de `.env`.
7. Para desarrollo usa `npm run dev`. Para comprobar una compilación puede ejecutarse `npx vite build`; no hay todavía scripts de lint o pruebas reales configurados.

## Árbol de `src`

```text
src/
├── App.css
├── App.jsx
├── config.js
├── main.jsx
├── rutas.js
├── assets/
│   ├── catalogo/                 # Ilustraciones panorámicas de géneros
│   ├── generos/                  # Portadas cuadradas de géneros
│   ├── ilustraciones/            # Ilustraciones del hero
│   └── logo/
├── components/
│   ├── albumes/
│   ├── avisoCookies/
│   ├── catalogo/
│   ├── cta/
│   ├── destacados/
│   ├── exploraGeneros/
│   ├── footer/
│   ├── generos/
│   ├── hero/
│   ├── Icono/
│   └── navbar/
├── hooks/
├── services/
├── styles/
└── utils/
```
