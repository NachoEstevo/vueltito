# Waitlist de ONGs

La landing ahora envia las solicitudes de ONG a `POST /api/waitlist/ongs`.

## Persistencia

El endpoint usa Postgres via `DATABASE_URL` y crea automaticamente la tabla `waitlist_leads` al primer uso. Esta tabla guarda:

- nombre de la ONG
- persona de contacto
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

## Bridge opcional a platform

Si `VUELTITO_PLATFORM_API_BASE_URL` esta configurado en el entorno server-side del deploy de la landing, el endpoint `POST /api/waitlist/ongs` reenvia cada alta guardada a:

```text
POST {VUELTITO_PLATFORM_API_BASE_URL}/v1/public/ngo-applications
```

El payload enviado a platform usa el contrato publico de aplicaciones ONG:

```json
{
  "publicName": "Fundacion Agua Clara",
  "contactName": "Ana Perez",
  "contactEmail": "hola@tuong.org",
  "cause": "Salud",
  "message": "Acompanamos familias.",
  "source": "landing-waitlist"
}
```

La variable no se lee en el browser ni se serializa al cliente. El forward es best-effort: si platform no responde, devuelve error o la variable no esta configurada, la waitlist sigue guardandose y la respuesta actual de `POST /api/waitlist/ongs` sigue siendo exitosa.

Variables opcionales:

- `VUELTITO_PLATFORM_API_TOKEN`: si existe, se envia como `Authorization: Bearer ...`.
- `VUELTITO_PLATFORM_FORWARD_TIMEOUT_MS`: timeout del forward. Default: `2500`.

El fallo queda logueado en el servidor con `leadId`, email y `statusCode` cuando exista.

Cuando el bridge este configurado en produccion, la cola de aplicaciones de platform pasa a ser la fuente operativa de verdad para revisar, contactar, convertir o rechazar ONGs. La tabla `waitlist_leads` queda como respaldo historico de la landing. Convertir una solicitud solo crea la ONG y su invitacion; la ONG no debe quedar usable en checkout hasta que acepte la invitacion, complete perfil/logo y platform la verifique.

## Railway

El token probado durante la implementacion no autorizo llamadas de Railway CLI. Para usar una base Railway hay que configurar `DATABASE_URL` en el deploy del sitio o proveer un token valido para crear/inspeccionar el recurso.
