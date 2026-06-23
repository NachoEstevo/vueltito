# Waitlist de ONGs

La landing ahora envia las solicitudes de ONG a `POST /api/waitlist/ongs`.

## Persistencia

El endpoint usa Postgres via `DATABASE_URL` y crea automaticamente la tabla `waitlist_leads` al primer uso. Esta tabla guarda:

- nombre de la ONG
- email de contacto
- area
- mensaje opcional
- fuente/pagina
- metadata tecnica de request
- estado `new`
- fecha de creacion

## Admin

La vista `waitlist-admin.html` consume `GET /api/admin/waitlist/ongs` y requiere:

- `ADMIN_WAITLIST_TOKEN`: token que se ingresa en la pagina admin.
- `DATABASE_URL`: conexion Postgres.

No hay link publico a esta vista desde la landing.

## Notificaciones opcionales

El alta queda guardada aunque falle la notificacion. Se puede configurar una o ambas opciones:

- `WAITLIST_WEBHOOK_URL`: recibe un POST JSON con `text` y `lead`.
- `RESEND_API_KEY`, `WAITLIST_TO_EMAIL`, `WAITLIST_FROM_EMAIL`: envia email via Resend.

## Railway

El token probado durante la implementacion no autorizo llamadas de Railway CLI. Para usar una base Railway hay que configurar `DATABASE_URL` en el deploy del sitio o proveer un token valido para crear/inspeccionar el recurso.