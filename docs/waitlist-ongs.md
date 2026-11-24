# Solicitudes de ONG

Antes de reabrir la convocatoria, verificar la persistencia y el acceso del responsable en un entorno de prueba. Confirmar quién opera la base, quién recibe las notificaciones, qué se envía a Core y por cuánto tiempo se conserva cada dato. Definir el contacto que atenderá consultas y bajas.

La landing envía las solicitudes a `POST /api/waitlist/ongs`. El endpoint acepta JSON de hasta 16 KiB y devuelve 400 para JSON inválido, 413 cuando excede el límite y 415 para otros formatos. Configurar un límite por cliente en el proxy o proveedor de hosting antes de una convocatoria abierta.

## Persistencia

El endpoint usa Postgres via `DATABASE_URL` y crea automaticamente la tabla `waitlist_leads` al primer uso. Esta tabla guarda:

- nombre de la ONG
- persona de contacto
- email de contacto
- area
- mensaje opcional
- fuente/pagina
- estado `new`
- fecha de creacion

La IP, el user-agent y el referrer ya no se escriben ni se devuelven desde la API. La tabla conserva esas columnas para instalaciones existentes. Inventariar valores históricos, logs y respaldos y acordar retención o eliminación con el responsable. Usar una base de prueba con datos ficticios.

## Admin

La vista `waitlist-admin.html` consume `GET /api/admin/waitlist/ongs` y requiere:

- `ADMIN_WAITLIST_TOKEN`: token aleatorio que se ingresa en la página admin. Generar uno nuevo al cambiar de responsables.
- `DATABASE_URL`: conexion Postgres.

La API comprueba el token antes de leer los registros y envía `Cache-Control: no-store`. La página se sirve públicamente y solo muestra datos después de autenticarse.

## Notificaciones opcionales

El alta queda guardada aunque falle la notificación. Cada solicitud de notificación a un tercero vence a los 2,5 segundos. Estas opciones envían datos de contacto a los destinatarios configurados.

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

El fallo se registra con `leadId` y código de estado cuando está disponible. El email y el mensaje permanecen fuera de ese log.

Cuando el bridge este configurado en produccion, la cola de aplicaciones de platform pasa a ser la fuente operativa de verdad para revisar, contactar, convertir o rechazar ONGs. La tabla `waitlist_leads` queda como respaldo historico de la landing. Convertir una solicitud solo crea la ONG y su invitacion; la ONG no debe quedar usable en checkout hasta que acepte la invitacion, complete perfil/logo y platform la verifique.

## Traspaso de configuración

Configurar `DATABASE_URL` y el token de administración en las variables del proyecto de la landing. Revisar las integraciones opcionales antes de habilitarlas. Si se usa Railway o cualquier otro Postgres, validar desde el entorno de prueba que la conexión y los permisos sean los correctos.
