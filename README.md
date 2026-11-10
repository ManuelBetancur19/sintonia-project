# Sintonía

Sintonía es una aplicación web para explorar un catálogo musical por género y conocer álbumes y artistas. La interfaz obtiene sus textos y datos de una API, y ofrece controles de idioma y accesibilidad.

## Funciones actuales

- Página de inicio con hero, álbumes populares, exploración de géneros y llamado a crear una cuenta.
- Catálogo musical con filtro de género mediante el parámetro `?genero=<id>`.
- Textos cargados por idioma desde la API.
- Preferencias de accesibilidad y aviso de consentimiento de cookies.
- Diseño adaptable a pantallas de escritorio y móvil.

## Sitio publicado

El proyecto está desplegado en Vercel. Vercel genera y publica la versión de producción a partir del proyecto; la URL pública no se incluye aquí porque no está especificada en este repositorio.

Para que la versión publicada pueda consultar la API, configura `VITE_API_URL` en **Project Settings → Environment Variables** del proyecto de Vercel y vuelve a desplegar después de cambiarla. Las variables con prefijo `VITE_` se incluyen en el código del navegador, así que no deben contener secretos.

## Tecnologías

- React y React DOM
- Vite
- React Router
- JavaScript y JSX
- CSS

## Requisitos

Necesitas Node.js y npm instalados.

## Instalación y ejecución

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Para ejecutar el proyecto en local, crea un archivo `.env` en la raíz y configura la dirección base de la API:

   ```env
   VITE_API_URL=https://direccion-de-tu-api
   ```

   Sustituye el valor de ejemplo por la URL de la API de tu entorno local. No publiques credenciales ni valores privados; `.env` está excluido de Git. La configuración local es independiente de la variable que se guarda en Vercel.

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Vite mostrará en la terminal la dirección local, normalmente `http://localhost:5173`.

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Inicio público |
| `/catalogo` | Catálogo musical |
| `/catalogo?genero=gen_pop` | Catálogo filtrado por género; el valor es un id de la API |
| `/ingresar` | Ruta reservada; la página todavía no está implementada |
| `/crear-cuenta` | Ruta reservada; la página todavía no está implementada |
| `/albumes/:id` | Destino de las tarjetas de álbum; la página de detalle todavía no está implementada |

Las rutas que aún no tienen página muestran el estado de ruta no encontrada.

## API

La base se configura mediante `VITE_API_URL` en [src/config.js](src/config.js). Los servicios están en `src/services/` y actualmente consultan:

- `GET /textos?idioma=<es|en>` para textos de interfaz.
- `GET /generos` para la lista de géneros.
- `GET /generos/:id` para el detalle de un género.
- `GET /albumes?orden=populares&limite=6` para los álbumes destacados.

## Comandos disponibles

- `npm run dev`: inicia Vite en modo desarrollo.
- `npx vite build`: genera una compilación de producción en `dist/`.
- `npx vite preview`: sirve localmente la compilación generada.

`package.json` todavía no define scripts de `build` ni de lint. El script `test` es un marcador de posición y no ejecuta pruebas del proyecto.

En Vercel, el comando de compilación equivalente es `npx vite build`; la carpeta de salida es `dist/`.

## Estructura

La guía de carpetas, responsabilidades y flujo de datos está en [ia.md](ia.md).
