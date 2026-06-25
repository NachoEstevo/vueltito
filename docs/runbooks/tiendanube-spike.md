# Runbook Spike TiendaNube

Estado: blocked para V1 productiva por limitacion de checkout/producto oculto confirmada en tienda demo propia.

## Objetivo

Validar si Vueltito puede mostrar una donacion opt-in y visible en TiendaNube, persistir consentimiento, detectar la linea de donacion en la orden y reversar el ledger ante cancelacion o refund, sin custodia de fondos.

## Evidencia oficial revisada

- Authentication: TiendaNube/Nuvemshop usa OAuth 2 authorization code. El token endpoint documentado es `https://www.tiendanube.com/apps/authorize/token`; el token devuelve `access_token`, scopes y `user_id` de la tienda. Fuente: https://tiendanube.github.io/api-documentation/authentication
- Scopes relevantes: `read_orders`, `write_orders`, `read_products`, `write_products` y `write_scripts` segun el camino elegido. Fuente: https://tiendanube.github.io/api-documentation/authentication
- Scripts: una app puede registrar JS para storefront y checkout; los scripts requieren permiso de scripts, se cargan con `store=<id>` y el documento advierte migracion a NubeSDK para scripts de checkout. Fuente: https://tiendanube.github.io/api-documentation/resources/script
- Checkout payment options: la Checkout API expone `LoadCheckoutPaymentContext`, `Checkout.getData(...)`, `Checkout.processPayment(...)` y opciones de pago externas, modales o transparentes. Fuente: https://tiendanube.github.io/api-documentation/resources/checkout
- Webhooks: existen eventos `order/paid`, `order/cancelled`, `order/updated`, `order/edited`, `order/voided` y otros; los webhooks no pueden usar dominios localhost/tiendanube/nuvemshop. Fuente: https://tiendanube.github.io/api-documentation/resources/webhook
- Orders: las ordenes exponen `products`, estados `open/closed/cancelled`, `payment_status` y endpoints de historia de valores/ediciones utiles para refunds o cambios. Fuente: https://tiendanube.github.io/api-documentation/resources/order

## Evidencia real 2026-06-24

- Tienda demo propia usada: `vueltitotienda.mitiendanube.com`, store id `7833593`.
- App partner: `vueltito-donaciones` (`app_id=34054`).
- OAuth productivo completado con scopes `write_products`, `read_orders`, `write_scripts`.
- Config publica OK: `GET /v1/public/tiendanube/donation-config?store=7833593` devuelve 3 opciones.
- NubeSDK checkout OK: script `Vueltito Checkout Donacion #7743`, version v9 (`id=26174`), location `checkout`, event `onload`, instalado solo en tienda demo.
- UI OK: widget renderiza en checkout y permite elegir/quitar donacion.
- Add con producto tecnico `published=false`: falla con `variant_unavailable`; el total no cambia.
- Add con producto temporalmente `published=true`: funciona y suma la linea al carrito/checkout, pero no es aceptable para V1 porque expone o puede exponer productos de donacion en catalogo/busqueda/relacionados.
- UI v9 OK visual: card clara sin icono de checkbox, encabezado alineado, pills `$100/$250/$500`; link externo de marca bloqueado porque el host remueve el `href`.
- Limpieza realizada: donacion removida del checkout de prueba y producto `$100` devuelto a `published=false`.

## Hipotesis y resultado

1. Storefront script puede mostrar seleccion de donacion antes del checkout y guardar consentimiento local o backend: probado como spike, no es UX final.
2. Checkout SDK/script puede renderizar seleccion dentro del checkout: probado con NubeSDK en `after_line_items`.
3. La donacion puede agregarse como producto/variante oculto sin romper totales: bloqueado; `published=false` devuelve `variant_unavailable`.
4. Producto publicado suma al total y queda como linea: probado, pero rechazado como workaround productivo.
5. Webhook `order/paid`, cancel/refund y line items: pendiente hasta resolver una forma aceptable de crear la linea.

## Bloqueantes

- TiendaNube permite UI NubeSDK y `cart:add`, pero no acepta variantes no publicadas en el carrito de checkout segun la prueba real.
- No hay evidencia oficial de una primitiva publica para linea/fee opcional de checkout que no sea producto de catalogo.
- Payment Provider es otra clase de producto: requiere soporte/habilitacion como app de pago y probablemente asumir flujo de pago, riesgo, homologacion y conciliacion. No es equivalente a "agregar un extra" sobre el medio de pago existente.
- El split 97/3 ideal no entra en V1 sin una primitiva de pago/split aprobada; para V1 sigue vigente comercio cobra y remite.

## Plan de ejecucion

1. Mantener el NubeSDK checkout como spike probado, no como canal self-serve.
2. Abrir consulta puntual a Partner Support con evidencia: `published=false -> variant_unavailable`; pedir linea/fee opcional, private buyable product o app-owned checkout line.
3. Confirmar por escrito si Payment Provider puede cobrar cart total + donacion sin reemplazar la pasarela del comercio y si permite split/remesa 97/3.
4. Solo si TiendaNube habilita una primitiva aceptable, retomar webhook `order/paid`, cancel/refund y orden pagada.
5. Si no hay primitiva, mantener TiendaNube como `blocked` y no venderlo como V1 productiva.

## Checklist de readiness

- [x] App partner creada con URLs reales y politicas publicas.
- [x] OAuth validado en tienda demo propia.
- [x] Scopes minimos justificados para el spike.
- [x] Producto/variante de donacion creado idempotentemente.
- [x] Donacion visible y opt-in antes del pago.
- [x] Donacion removible antes del pago.
- [x] Bloqueo `published=false` confirmado con evidencia real.
- [ ] Orden pagada contiene line item detectable.
- [ ] Webhook `order/paid` procesado idempotentemente.
- [ ] Cancel/refund genera reversa y no duplica ledger.
- [ ] Sin PII publica en leaderboard.
- [ ] Una ONG/campana por comercio como default V1.
- [ ] Respuesta de Partner Support sobre primitiva checkout-only/private line.

## No cerrar sin evidencia

No marcar TiendaNube como lista hasta que TiendaNube confirme una primitiva aceptable para crear una linea opt-in que no contamine catalogo. La alternativa `published=true` solo sirve para diagnostico o piloto manual con aceptacion explicita del comercio, no para V1 self-serve. Tambien falta confirmar navegacion externa soportada desde checkout si queremos que la marca `VUELTITO` abra `https://vueltito.org/`.
