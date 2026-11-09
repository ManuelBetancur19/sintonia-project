# Mapa de carpetas del proyecto

Este mapa explica la responsabilidad de cada carpeta de código y de sus archivos. Las cabeceras `RESPONSABILIDAD` de cada archivo describen su propósito individual. Los archivos generados y los datos privados no se editan para añadir comentarios.

## Raíz

- `index.html`: documento HTML y punto de montaje `#root`.
- `vite.config.js`: configuración de Vite y el complemento de React.
- `package.json` y `package-lock.json`: scripts, dependencias y versiones instaladas.
- `.gitignore`: archivos locales o generados que Git debe excluir.
- `.env`: configuración local de la API; no se documenta ni se publica.
- `src/`: código de la aplicación.
- `dist/`: salida generada por el build; no se edita manualmente.
- `node_modules/`: dependencias instaladas; no se edita manualmente.

## `src/`

- `App.jsx`: composición global, rutas, textos compartidos, aviso de cookies y navegación de foco.
- `App.css`: estructura global del contenedor de la aplicación.
- `main.jsx`: montaje de React, `BrowserRouter` y hojas globales.
- `config.js`: URL base de la API.
- `rutas.js`: rutas internas reutilizadas por los enlaces.

### `src/assets/`

Archivos gráficos importados por los componentes. No llevan comentarios de código para evitar alterar su contenido visual.

- `catalogo/`: ilustraciones horizontales para las tarjetas de género de Explora y Catálogo.
- `generos/`: ilustraciones SVG asociadas con los géneros.
- `ilustraciones/`: ilustraciones de la sección hero.
- `logo/`: logotipo SVG de Sintonía.

### `src/components/`

Componentes de interfaz organizados por sección o elemento reutilizable.

- `albumes/`: `TarjetaAlbum.jsx`, enlace de álbum con portada e información.
- `avisoCookies/`: `AvisoCookies.jsx` y `AvisoCookies.css`, presentación y estilos del consentimiento.
- `catalogo/`: `Catalogo.jsx` y `Catalogo.css`, página general y detalle por género.
- `cta/`: `CTA.jsx` y `CTA.css`, llamado final de la página pública.
- `destacados/`: `Destacados.jsx`, `Destacados.css` y `PortadaAlbum.jsx`, álbumes populares, estados y dibujo de portadas.
- `exploraGeneros/`: `ExploraGeneros.jsx` y `ExploraGeneros.css`, cuadrícula de géneros de inicio.
- `footer/`: `Footer.jsx` y `Footer.css`, pie compartido entre vistas.
- `generos/`: `TarjetaGenero.jsx` y `TarjetaGenero.css`, enlace e ilustración de un género.
- `hero/`: `Hero.jsx` y `Hero.css`, presentación principal de la página pública.
- `Icono/`: `Icono.jsx`, iconos SVG reutilizables.
- `navbar/`: `Navbar.jsx`, `Navbar.css`, `PanelAccesibilidad.jsx` y `PanelAccesibilidad.css`, navegación, menú móvil y preferencias de accesibilidad.

### `src/hooks/`

Estado y efectos reutilizables de la interfaz.

- `useAccesibilidad.js`: aplica y actualiza las preferencias de accesibilidad.
- `useConsentimiento.js`: conecta el estado React con la cookie de consentimiento.
- `useDestacados.js`: carga álbumes populares y expone sus estados.
- `useExploraGeneros.js`: carga géneros y prepara datos de sección.
- `useGeneroSeleccionado.js`: sigue el género indicado por `?genero=` y carga su detalle.
- `useHero.js`: obtiene y valida los textos del sitio por idioma.
- `useTextosNavbar.js`: obtiene y valida los textos del navbar por idioma.

### `src/services/`

- `albumes.js`: solicitud de álbumes populares.
- `generos.js`: solicitud compartida de géneros, detalle y normalización de la respuesta.

### `src/styles/`

- `tokens.css`: tokens visuales, temas y estilos tipográficos.
- `global.css`: reinicio, estilos base y contenedor general.
- `accesibilidad.css`: reglas globales para movimiento, subrayado y espaciado de lectura.

### `src/utils/`

- `consentimiento.js`: lectura, validación, persistencia y notificación de cambios del consentimiento.

## Alcance de los comentarios

Los archivos de código JS, JSX y CSS tienen una cabecera de responsabilidad. Los comentarios internos se limitan a comportamiento no evidente, datos, accesibilidad y fallbacks que necesiten explicación; no se comenta cada etiqueta o propiedad.
