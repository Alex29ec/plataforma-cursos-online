# Aula Online — plataforma de cursos online

Plataforma web para vender cursos online con diploma: el alumno estudia el temario gratis, hace un examen tipo test corregido en el servidor y, si aprueba, paga y descarga un diploma en PDF con código de verificación y QR. Incluye un panel de administración para crear y publicar cursos.

**Demo en línea:** https://alex29ec.github.io/plataforma-cursos-online/ — panel en `/admin` con usuario `admin` y contraseña `admin`.

## Qué incluye

- **Catálogo de cursos** con estados Borrador / Próximamente / Publicado.
- **Curso**: temario en Markdown, examen aleatorio de un banco de preguntas, nota mínima configurable.
- **Pago** con Stripe Checkout (o pago simulado en local/demo), protegido contra cobros dobles y con webhook idempotente.
- **Diploma** en PDF (OpenPDF) con código `CO-XXXX-XXXX` y QR; página pública de verificación con el DNI enmascarado.
- **Panel de administración**: sesión con cookie + CSRF, bloqueo tras 5 intentos, edición de cursos, fotos, temas y preguntas, y reglas de publicación.
- **Tests**: JUnit + MockMvc en el backend, Vitest en el frontend.

## Tecnologías

- `backend/`: Java 21, Spring Boot 4 (Web, Data JPA, Security, Validation), Flyway, H2 / PostgreSQL, Stripe, OpenPDF, ZXing.
- `frontend/`: Angular 22 (componentes standalone, signals), SCSS.

## Demo sin servidor

La demo es solo el frontend, publicado en GitHub Pages en cada push a `main` (`.github/workflows/pages.yml`, configuración `demo` de Angular). Una API simulada en el navegador (`frontend/src/app/demo/`) responde a las mismas rutas que el backend y guarda los datos en el `localStorage` del visitante: funciona todo, también el panel. El pago es simulado, el diploma descargado es un PDF de ejemplo y las fotos subidas en la demo están limitadas a 1 MB. «Reiniciar demo» vuelve a los datos de ejemplo.

## Requisitos

- Java 21
- Node.js 22 o superior (con npm)
- No hace falta instalar Maven ni una base de datos: el backend incluye `mvnw` y usa H2 en local.

## Arrancar en local

En dos terminales.

1. Backend (puerto 8080):

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. Frontend (puerto 4200; reenvía `/api` al backend):

   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Abre http://localhost:4200.

`./mvnw spring-boot:run` arranca con el perfil **`local`** (H2 + pago simulado). Fuera de ese perfil la aplicación
usa Stripe y exige una base de datos configurada, así que un despliegue mal configurado no arranca en modo demo por accidente.

En local el pago es **simulado**: tras rellenar los datos aparece una página "MODO DEMO" con un botón "Simular pago". No se cobra nada.

Los datos se guardan en `backend/data/` (base de datos H2 en fichero). Bórrala para empezar de cero.

## Panel de administración

- URL: http://localhost:4200/admin
- En el perfil `local`: usuario `admin`, contraseña `admin`.
- En producción define las variables `ADMIN_USUARIO` y `ADMIN_PASSWORD`. Con el perfil `prod` la aplicación no arranca si faltan o si la contraseña es `admin`.
- Tras 5 intentos fallidos desde una misma IP, el acceso queda bloqueado 15 minutos.
- La sesión caduca tras 8 horas sin uso.

Desde el panel se puede:

- Crear cursos (nacen como **Borrador**).
- Editar los datos del curso y su foto.
- Gestionar los temas (Markdown, con vista previa) y las preguntas (de 2 a 6 opciones).
- Cambiar el estado: **Borrador**, **Próximamente** o **Publicado**. Para publicar hace falta al menos un tema y al menos tantas preguntas activas como preguntas tiene el examen.

Los cursos no se borran: para ocultarlos, pásalos a Borrador. "Borrar" una pregunta la desactiva.

### Fotos de los cursos

Las fotos se guardan en la carpeta `app.uploads-dir` (por defecto `./uploads`, relativa al directorio desde el que se ejecuta el backend).
Admiten JPG, PNG o WebP de hasta 5 MB.

En producción esa carpeta debe ser persistente: define la variable `APP_UPLOADS_DIR` o la propiedad `app.uploads-dir`.

### Textos de la plataforma

- Nombre, contacto y textos: `frontend/src/app/core/empresa.ts`. Si rellenas `whatsapp`, `facebook` o `linkedin`, aparecen el botón flotante de WhatsApp y los iconos del pie.

## Tests

```bash
cd backend && ./mvnw test
```

```bash
cd frontend && npx ng test --watch=false
```

## Configuración

| Propiedad | Valores | Por defecto |
|---|---|---|
| `app.pagos.proveedor` | `simulado`, `stripe` | `stripe` (`simulado` solo en el perfil `local`; prohibido con `prod`) |
| `app.diplomas.emisor` | `automatico`, `manual` | `automatico` |
| `app.frontend-url` | URL pública de la web | `http://localhost:4200` |
| `app.uploads-dir` | Carpeta de fotos de cursos | `./uploads` |

- **`automatico`**: al confirmarse el pago se genera el diploma (PDF con código y QR) y el alumno lo descarga al momento.
- **`manual`**: el pedido se queda en "Pago recibido" para que una persona emita el diploma. (La pantalla para subirlo está pendiente.)

Los códigos de diploma empiezan por `CO-`. Los códigos antiguos `MA-` siguen verificándose.

### Stripe (pagos reales)

Activa `app.pagos.proveedor=stripe` y define estas variables de entorno:

- `STRIPE_SECRET_KEY`: clave secreta (`sk_test_...` para pruebas).
- `STRIPE_WEBHOOK_SECRET`: secreto del webhook (`whsec_...`).

El webhook debe apuntar a `https://<tu-backend>/api/pagos/stripe/webhook` con los eventos
`checkout.session.completed` y `checkout.session.async_payment_succeeded` (este último para métodos de pago diferidos, como SEPA).

Si un alumno inicia un segundo pago para el mismo examen, la sesión de pago anterior se expira en Stripe para evitar cobros dobles.
Para probarlo en local: `stripe listen --forward-to localhost:8080/api/pagos/stripe/webhook`.

### Producción (perfil `prod`)

```bash
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://host:5432/cursos
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
FRONTEND_URL=https://tu-dominio.es
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
ADMIN_USUARIO=...
ADMIN_PASSWORD=...
APP_UPLOADS_DIR=/ruta/persistente/uploads
```

El backend no arranca en `prod` si faltan las claves de Stripe ni las credenciales del panel.
`ADMIN_PASSWORD` no puede superar 72 bytes en UTF-8 (límite de BCrypt), en ningún perfil.

### Despliegue

- Sirve el frontend y el backend **desde el mismo origen** detrás de un proxy inverso (por ejemplo Nginx o Caddy):
  `/api` → backend (puerto 8080) y el resto → los ficheros compilados del frontend (`frontend/dist`).
  La sesión del panel y la cookie CSRF dependen de ese mismo origen.
- **Solo HTTPS.** Con el perfil `prod` las cookies de sesión y `XSRF-TOKEN` son `Secure`: por HTTP el panel no funciona.
- El proxy debe enviar `X-Forwarded-For` y `X-Forwarded-Proto` (y sobrescribirlos, no añadir lo que mande el cliente).
  El perfil `prod` usa `server.forward-headers-strategy: native`: Tomcat toma de ahí la IP real del cliente (el límite de
  intentos de acceso del panel va por IP) y el esquema `https`. Tomcat solo confía en esas cabeceras si el proxy llega
  desde una IP interna (10.x, 192.168.x, 172.16–31.x, 127.x, ::1...). Si tu proxy usa otra IP, configúrala con
  `server.tomcat.remoteip.internal-proxies`; si no, todos los clientes compartirían la IP del proxy y cinco contraseñas
  erróneas bloquearían el panel a todo el mundo durante 15 minutos.
- `APP_UPLOADS_DIR` debe apuntar a una carpeta persistente (volumen) con permisos de escritura para el backend.

## Cargas masivas de contenido (migraciones SQL)

Para editar cursos, temas y preguntas usa el **panel de administración**.

La ruta por migración SQL queda solo para cargas masivas. El temario y las preguntas del curso de prueba son **provisionales**
(`backend/src/main/resources/db/migration/V2__curso_manipulador_provisional.sql`).
Si necesitas cargar contenido en bloque, crea una migración nueva (con versión V4 o superior, por ejemplo `V4__curso_manipulador_definitivo.sql`; `V1`–`V3` ya existen y Flyway no arrancaría con una versión repetida) que actualice
los temas y sustituya las preguntas. No modifiques una migración que ya se haya aplicado.

Cada pregunta tiene de 2 a 6 opciones (`pregunta_opcion.posicion` 0–5) y `pregunta.correcta` es la posición de la correcta.
El precio (`precio_centimos`), la nota mínima (`nota_minima`) y el número de preguntas por examen (`num_preguntas`) están en la tabla `curso`.
