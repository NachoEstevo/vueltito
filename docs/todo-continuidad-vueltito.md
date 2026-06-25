# To-do de continuidad Vueltito

Estado: 2026-06-24. Documento operativo para retomar trabajo sin depender del thread.

## 1. Confirmar landing actual

- [ ] Revisar `http://127.0.0.1:4173/`.
- [ ] Revisar `http://127.0.0.1:4173/comercios.html`.
- [ ] Revisar `http://127.0.0.1:4173/leaderboard.html`.
- [x] Confirmar si el posicionamiento publico debe usar "vueltito", "don.ar" o ambos. Decision: `vueltito`.
- [x] Confirmar si la landing puede decir explicitamente que el piloto inicial no cobra comision. Decision: home no necesita mencionarlo; comercios si.
- [x] Confirmar si se mantiene el ZIP WooCommerce descargable desde la landing. Decision: visible desde pagina de comercios.
- [x] Confirmar si el leaderboard debe mostrarse como datos reales, demo visual o hibrido con fallback. Decision: mantener demo/fallback hasta datos reales.
- [x] Preparar commit de landing, README y documentos operativos iniciales.

## 2. Hacer accesibles los runbooks

- [x] Crear un indice publico/interno de operaciones con links a todos los runbooks relevantes. Ver `docs/integrations/README.md`.
- [ ] Separar el contenido por tabs o secciones claras:
  - Producto y modelo operativo.
  - WooCommerce piloto.
  - Comercio.
  - ONG.
  - Plataforma/admin.
  - Legal, privacidad y datos.
  - Remesas, conciliacion y refunds.
  - Soporte e incidentes.
  - Tienda Negocio spike.
- [x] Crear runbook de spike TiendaNube con evidencia oficial y bloqueantes. Ver `docs/runbooks/tiendanube-spike.md`.
- [x] Crear runbook de spike TiendaNegocio con bloqueantes y contrato esperado. Ver `docs/runbooks/tiendanegocio-spike.md`.
- [x] Crear reporte de decision TiendaNube con evidencia real 2026-06-24. Ver `docs/reports/2026-06-24-tiendanube-checkout-validation.md`.
- [ ] Decidir si ese hub vive en la landing, en `vueltito-platform/docs`, en Notion, o en los tres con roles distintos.
- [ ] Escribir version corta para usuarios no tecnicos y version completa para operadores.
- [ ] Evitar que documentos tecnicos internos parezcan terminos legales finales.

## 3. Kit comercio

- [ ] Explicar el modelo v1 sin custodia: el comercio cobra la donacion y remite el 100% a la ONG.
- [ ] Incluir pasos de instalacion WooCommerce con capturas o placeholders.
- [ ] Incluir que datos necesita el comercio: API URL, installation ID, API key, campana, ONG.
- [ ] Explicar como aparece la donacion en checkout y en la orden.
- [ ] Explicar como reportar remesa y subir evidencia.
- [ ] Incluir politica de refund/cancelacion.
- [ ] Incluir checklist de soporte: health check, cola pendiente del plugin, contacto Vueltito.

## 4. Kit ONG

- [ ] Listar datos obligatorios: razon social, CUIT, personeria, contacto, cuenta de recepcion, logo/perfil publico.
- [ ] Explicar que confirma la ONG en Vueltito y cuando.
- [ ] Explicar recibos/comprobantes como pendiente a validar por contador/abogado.
- [ ] Incluir privacidad, uso de marca y baja del perfil publico.
- [ ] Incluir flujo de disputa si no reconoce una remesa.

## 5. WooCommerce production pilot

- [ ] Elegir primer comercio real o staging representativo.
- [ ] Elegir primera ONG real.
- [ ] Crear configuracion real de comercio, ONG, campana e instalacion.
- [ ] Instalar ZIP `vueltito-donations-0.4.8.zip`.
- [ ] Ejecutar health check desde WooCommerce.
- [ ] Hacer compra real chica con donacion.
- [ ] Verificar metadata Woo, ledger, conciliacion y dashboard.
- [ ] Probar refund/cancel y reversal.
- [ ] Reportar remesa con evidencia.
- [ ] Confirmar recepcion desde panel ONG.
- [ ] Verificar transparencia publica y leaderboard opt-in.

## 6. Legal y operaciones

- [ ] Conseguir dictamen contable sobre tratamiento de la linea de donacion.
- [ ] Preparar convenio comercio.
- [ ] Preparar convenio ONG.
- [ ] Preparar disclosure de checkout y privacidad/leaderboard.
- [ ] Definir quien es donante formal y quien emite recibo si aplica.
- [ ] Definir plazo de remesa y umbral de suspension.
- [ ] Definir politica de alias ofensivos y baja del ranking.

## 7. Produccion y observabilidad

- [ ] Confirmar variables de produccion en Railway.
- [ ] Confirmar dominios, health checks, logs y backups.
- [ ] Confirmar `PAID_BILLING_ENABLED=false`.
- [ ] Confirmar split/custody desactivado.
- [ ] Documentar como revisar eventos Woo fallidos.
- [ ] Documentar como actuar si el comercio no remite o la ONG disputa.

## 8. Tienda Negocio

- [ ] Esperar credenciales/sandbox real. Estado actual: bloqueado en este repo; ver `docs/runbooks/tiendanegocio-spike.md`.
- [ ] Validar OAuth e instalacion.
- [ ] Provisionar productos de donacion.
- [ ] Probar agregar, quitar y reemplazar linea de donacion.
- [ ] Confirmar si el producto puede quedar oculto del catalogo.
- [ ] Confirmar webhook de orden pagada y line items.
- [ ] Decidir `pilot_candidate` o `blocked` con evidencia.

## 8.1 TiendaNube

- [x] Crear app partner Vueltito con redirect/support/privacy URLs.
- [x] Validar OAuth authorization code en tienda demo propia.
- [x] Confirmar scopes minimos: orders, products y scripts solo si son necesarios.
- [x] Probar NubeSDK checkout en tienda demo propia.
- [x] Ajustar UI checkout NubeSDK: card clara, sin icono de checkbox, encabezado alineado y pills `$100/$250/$500`.
- [x] Probar agregar, quitar y reemplazar linea de donacion con producto publicado temporalmente.
- [x] Confirmar bloqueo de producto tecnico oculto: `published=false` devuelve `variant_unavailable`.
- [ ] Escalar a Partner Support por primitiva de checkout-only line/optional fee/private buyable product.
- [ ] Escalar/confirmar navegacion externa desde checkout: `Link` renderiza anchor sin `href` hacia `https://vueltito.org/`.
- [ ] Confirmar webhook `order/paid` y line items.
- [ ] Probar cancel/refund o flujo equivalente de reversa.
- [x] Decidir `blocked` para V1 productiva con evidencia. Ver `docs/runbooks/tiendanube-spike.md` y `docs/reports/2026-06-24-tiendanube-checkout-validation.md`.

## 9. Notion y seguimiento

- [ ] Revisar tareas existentes y marcar hecho vs pendiente.
- [ ] Crear pagina hub con estado real: built, ready, blocked, next.
- [ ] Linkear runbooks completos y kits simplificados.
- [ ] Mantener el modelo v1 fijo: no custodia, fee-free, comercio remite 100%.
