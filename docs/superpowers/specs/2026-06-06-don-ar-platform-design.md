# don.ar Platform Design Spec

Fecha: 2026-06-06  
Estado: Draft para revision  
Owner: don.ar  
Scope: plataforma de microdonaciones por redondeo/aporte sobre pagos en Argentina

## 1. Resumen

don.ar es una plataforma para habilitar microdonaciones autorizadas sobre pagos cotidianos. El usuario configura una regla de aporte, por ejemplo un monto fijo por transaccion, un porcentaje chico de la compra o un redondeo. Cuando compra en un comercio integrado, don.ar calcula el aporte, lo muestra de forma visible, registra el consentimiento y asigna el monto a una ONG o campana. El producto incluye ledger auditable, conciliacion, panel de ONGs/comercios y una capa de gamificacion con leaderboard opt-in.

La estrategia recomendada no depende de que Mercado Pago sea partner directo desde el primer dia. El primer wedge es una suite de plugins/adaptadores para comercios que ya cobran con Mercado Pago. Con esos pilotos se genera traccion y evidencia para buscar una alianza directa con Mercado Pago.

La arquitectura debe separar tres capas:

1. Core don.ar: donantes, reglas, ONGs, campanas, consentimientos, ledger, leaderboard, auditoria y conciliacion.
2. Payment layer: Mercado Pago Checkout Pro/API, webhooks, OAuth, Split Payments 1:1 cuando este permitido.
3. Adapter layer: WooCommerce, Tiendanube, VTEX, Adobe Commerce, Shopify y eventualmente QR/Point.

## 2. Decision de producto

La tesis publica debe ser:

> don.ar permite que comercios integrados ofrezcan microaportes solidarios transparentes en el checkout, procesados con Mercado Pago cuando sea posible y registrados con trazabilidad hacia ONGs verificadas.

Evitar esta tesis:

> don.ar intercepta cualquier pago personal de Mercado Pago y desvia automaticamente un porcentaje a cualquier ONG.

Esa version no esta respaldada por la documentacion publica actual y crea riesgos de compliance, confianza y partnership.

## 3. Research tecnico

### 3.1 Mercado Pago Split Payments

Mercado Pago documenta Split Payments 1:1 para modelos marketplace. El checkout puede repartir importes entre vendedor y marketplace. Para Checkout Pro se usa `marketplace_fee` en la preferencia. Para Checkout API se usa `application_fee` al crear el pago.

Hallazgos importantes:

- El split se plantea como vendedor + marketplace, no como distribucion arbitraria a N ONGs.
- Para integrar se requiere OAuth del vendedor.
- El vendedor necesita cuenta Mercado Pago y requisitos de identificacion/KYC.
- El modelo 1:N esta disponible unicamente para vendedores de cartera asesorada y requiere contacto comercial.
- En reembolsos, Mercado Pago divide el valor a devolver entre vendedor y marketplace. Si el vendedor no tiene saldo, el marketplace puede quedar expuesto a cubrir parte de la devolucion por otro medio.
- Split 1:1 permite pagos con dinero en cuenta entre cuentas Mercado Pago y no transferencias externas de instituciones financieras.

Implicacion para don.ar:

- El aporte puede representarse como `marketplace_fee` o `application_fee` cuando don.ar participa como marketplace/integrador y el comercio esta conectado.
- El dinero del aporte deberia entrar a una cuenta don.ar o estructura equivalente y luego asignarse/liquidarse a ONGs por ledger y conciliacion.
- No asumir que el split puede mandar directamente partes del pago a muchas ONGs sin partnership o configuracion comercial adicional.

Fuentes:

- Mercado Pago Split Payments 1:1: https://www.mercadopago.com.ar/developers/es/docs/split-payments/split-1-1/integration-configuration/integrate-marketplace
- Requisitos Split Payments: https://www.mercadopago.com.ar/developers/es/docs/split-payments/split-1-1/prerequisites
- API create preference: https://www.mercadopago.com.ar/developers/es/reference/online-payments/checkout-pro/preferences/create-preference/post

### 3.2 WooCommerce

WooCommerce permite crear payment gateways y procesar el checkout mediante `process_payment($order_id)`. Tambien permite agregar fees al carrito mediante hooks, aunque hay diferencias entre checkout clasico y Checkout Blocks.

Implicacion:

- Es el mejor primer canal porque da control tecnico y permite una demo sandbox.
- don.ar puede implementarse como plugin propio, no solo como extension del plugin oficial de Mercado Pago.
- El plugin puede mostrar el aporte, agregarlo como fee/linea visible, crear una preferencia Mercado Pago y redirigir al comprador.
- Para Checkout Blocks se necesita soporte JS/blocks, no solo hooks PHP clasicos.

Fuente:

- WooCommerce Payment Gateway API: https://developer.woocommerce.com/docs/woocommerce-payment-gateway-api/
- WooCommerce Checkout Blocks hooks: https://developer.woocommerce.com/docs/block-development/reference/hooks/hook-alternatives/

### 3.3 Tiendanube

Tiendanube/Nuvemshop tiene API de apps con OAuth, webhooks y una API de Checkout para payment options. La documentacion muestra `Checkout.processPayment`, `ExternalPayment`, `ModalPayment` y opciones transparentes. Tambien permite acceder al contexto del checkout, como carrito, total, contacto y formulario.

Hallazgo importante:

- La documentacion de Mercado Pago para Tiendanube indica que el plugin de Mercado Pago no cuenta con entorno de pruebas; las validaciones se hacen en produccion con pagos reales minimos.

Implicacion:

- don.ar puede construirse como app/payment provider de Tiendanube.
- Debe pasar por un proceso de app/homologacion y manejar scopes, OAuth y webhooks.
- Tiendanube es muy relevante para Argentina, pero no debe ser el primer canal de demo tecnica si necesitamos sandbox robusto.

Fuentes:

- Tiendanube Checkout API: https://tiendanube.github.io/api-documentation/resources/checkout
- Tiendanube API auth: https://tiendanube.github.io/api-documentation/authentication
- Mercado Pago Tiendanube Checkout Pro: https://www.mercadopago.com.ar/developers/es/docs/tiendanube/payment-configuration/checkout-pro

### 3.4 VTEX

VTEX tiene Payment Provider Protocol (PPP), un contrato REST para integrar proveedores de pago. Exige endpoints HTTPS, tiempos de respuesta, pruebas con Payment Provider Test Suite y homologacion. Tambien puede requerir PCI-DSS o Secure Proxy si se aceptan tarjetas.

Implicacion:

- Es viable, pero es enterprise y no debe ser primer MVP.
- Para don.ar puede haber dos enfoques:
  - payment provider/connector propio;
  - integracion complementaria que agrega aporte y delega pago final.
- Requiere homologacion y un proceso comercial/tecnico mas lento.

Fuentes:

- VTEX Payment Provider Protocol: https://developers.vtex.com/docs/api-reference/payment-provider-protocol
- VTEX Payment Provider Homologation: https://developers.vtex.com/docs/guides/payments-integration-payment-provider-homologation

### 3.5 Adobe Commerce / Magento

Adobe Commerce permite payment provider gateways y modulos custom de checkout. Se pueden crear metodos de pago y customizaciones del checkout en modulos separados.

Implicacion:

- Es tecnicamente viable, pero mas costoso y sensible por la complejidad de Magento.
- Conviene abordarlo despues de validar el core y tener integracion Mercado Pago madura.

Fuente:

- Adobe Commerce Payments Integrations: https://developer.adobe.com/commerce/php/development/payments-integrations/
- Adobe Commerce custom checkout: https://developer.adobe.com/commerce/php/tutorials/frontend/custom-checkout/

### 3.6 Shopify

Shopify payment apps y checkout extensions existen, pero tienen restricciones fuertes. La documentacion indica que solo approved Partners pueden construir payments extensions en la Payments Platform. Custom payment extensions estan limitadas a merchants elegibles de Shopify Plus. Checkout UI extensions para pasos de informacion, envio y pago tambien son Shopify Plus.

Implicacion:

- Shopify no es buen primer canal.
- Puede ser roadmap con dos rutas:
  - app no-payment para mostrar/registrar intencion y trabajar en thank-you/cart cuando sea posible;
  - payments app/offsite payment solo cuando haya approval/partner.

Fuentes:

- Shopify Payments Apps: https://shopify.dev/docs/apps/build/payments
- Shopify Checkout UI Extensions: https://shopify.dev/docs/api/checkout-ui-extensions

### 3.7 QR / Point / presencial

Mercado Pago documenta QR y Point con Orders, stores, POS, webhooks y conciliacion. Es relevante para supermercados y pagos presenciales.

Implicacion:

- Viable a futuro, pero no asumir split automatico sin validacion especifica.
- Requiere caja presencial, conciliacion, experiencia de POS y probablemente partnership mas cercano.

Fuentes:

- Mercado Pago QR Code: https://www.mercadopago.com.ar/developers/es/docs/qr-code/landing
- Mercado Pago Point: https://www.mercadopago.com.ar/developers/es/docs/mp-point/payment-processing

## 4. Objetivos

### 4.1 Objetivos de negocio

- Validar que compradores aceptan microaportes visibles si la friccion es baja.
- Probar que comercios pueden activar don.ar sin rehacer su stack de pagos.
- Generar evidencia para negociar partnership directo con Mercado Pago.
- Crear confianza con ONGs verificadas, trazabilidad y reportes.

### 4.2 Objetivos de producto

- Activar regla de donacion por usuario o por checkout.
- Mostrar aporte antes de pagar.
- Registrar consentimiento y detalle de calculo.
- Procesar el pago con Mercado Pago cuando sea posible.
- Registrar ledger idempotente y conciliable.
- Mostrar impacto y leaderboard opt-in.
- Administrar ONGs, campanas, comercios y liquidaciones.

### 4.3 No objetivos iniciales

- Interceptar cualquier pago personal de Mercado Pago fuera de un comercio/canal integrado.
- Distribuir automaticamente un pago a N ONGs desde la API publica de Mercado Pago sin acuerdo comercial.
- Manejar fondos reales de ONGs sin modelo legal, fiscal y operativo definido.
- Hacer todos los plugins en paralelo en el primer hito.

## 5. Arquitectura propuesta

### 5.1 Componentes

#### don.ar Core API

Servicio central para:

- donantes;
- reglas de aporte;
- ONGs;
- campanas;
- comercios;
- transacciones;
- ledger;
- conciliacion;
- leaderboard;
- auditoria;
- webhooks de plataforma y Mercado Pago.

Debe contener la logica de negocio. Los plugins no deben duplicar calculos de donacion, elegibilidad, privacidad o leaderboard.

#### Adapter layer

Cada canal implementa:

- instalacion y autenticacion del comercio;
- lectura de carrito/order context;
- render de UI de consentimiento;
- envio de calculo al Core API;
- creacion/redireccion de pago;
- recepcion de callbacks/webhooks propios;
- sincronizacion de estado con el comercio.

Adapters iniciales:

- WooCommerce;
- Tiendanube;
- VTEX;
- Adobe Commerce;
- Shopify;
- QR/Point.

#### Payment layer

Responsable de:

- Mercado Pago SDK/API;
- credenciales;
- OAuth vendedor;
- creacion de preferencias;
- `marketplace_fee` / `application_fee`;
- webhooks Mercado Pago;
- idempotency keys;
- refund/cancellation flow;
- reconciliacion de reportes.

#### Admin/Ops

Panel para:

- aprobar ONGs;
- revisar comercios;
- ver transacciones;
- resolver discrepancias;
- iniciar liquidaciones;
- configurar campanas;
- auditar consentimientos;
- gestionar leaderboard y privacidad.

## 6. Flujos clave

### 6.1 Onboarding de comercio

1. Comercio instala plugin/app don.ar.
2. Comercio crea o conecta cuenta don.ar.
3. Comercio conecta cuenta Mercado Pago por OAuth cuando el canal lo permita.
4. don.ar registra seller account, platform, scopes y estado de KYC/configuracion.
5. Comercio selecciona ONGs/campanas habilitadas.
6. Comercio activa reglas permitidas: fijo, porcentaje, redondeo, donacion opcional.
7. don.ar muestra checklist: webhooks, credenciales, split disponible, modo sandbox/produccion.

### 6.2 Onboarding de donante

Dos modos:

#### Checkout opt-in

El comprador decide en el checkout donar esta vez. Es el modo mas simple y confiable para MVP.

#### Cuenta don.ar

El usuario crea cuenta, elige regla persistente y puede usarla en comercios integrados. Requiere identificacion por email/telefono y cuidado de privacidad.

### 6.3 Checkout con aporte

1. Adapter lee subtotal, moneda, items y comercio.
2. Adapter solicita al Core API opciones de aporte.
3. Core calcula:
   - monto fijo;
   - porcentaje;
   - redondeo;
   - limites minimos/maximos;
   - ONG/campana elegida.
4. UI muestra aporte como linea visible.
5. Comprador acepta.
6. Adapter crea orden local con metadata don.ar.
7. Payment layer crea preferencia/pago en Mercado Pago:
   - compra total visible;
   - `marketplace_fee` o `application_fee` si el canal y credenciales lo permiten;
   - `external_reference`;
   - `notification_url`;
   - metadata con ids don.ar.
8. Mercado Pago procesa.
9. Webhook actualiza estado.
10. Ledger registra compra, aporte, split y asignacion ONG.
11. Leaderboard se actualiza solo si el donante opto por participar.

### 6.4 Refund

1. Refund llega desde comercio o Mercado Pago.
2. Core identifica transaccion original.
3. Payment layer consulta estado MP.
4. Ledger crea reversa, nunca edita entradas historicas.
5. Si hubo split, aplicar regla definida:
   - devolver aporte junto con compra;
   - mantener aporte si usuario lo acepta explicitamente;
   - caso default recomendado: si la compra se cancela antes de liquidacion, revertir aporte.
6. Ajustar leaderboard con reversa o marcar puntos como pending hasta liquidacion.

## 7. Modelo de datos conceptual

### 7.1 Entidades

#### `donors`

- id
- email_hash / phone_hash
- display_alias
- leaderboard_opt_in
- created_at
- status

#### `donation_rules`

- id
- donor_id nullable
- merchant_id nullable
- type: `fixed`, `percentage`, `round_up`
- amount_cents nullable
- percentage_bps nullable
- min_amount_cents
- max_amount_cents
- currency
- active

#### `ngos`

- id
- legal_name
- display_name
- tax_id
- verification_status
- payout_status
- country
- bank_or_mp_account_reference encrypted/opaque
- created_at

#### `campaigns`

- id
- ngo_id
- title
- description
- goal_amount_cents nullable
- active
- starts_at
- ends_at nullable

#### `merchants`

- id
- platform
- external_platform_id
- mp_user_id nullable
- mp_oauth_status
- kyc_status
- split_enabled
- status

#### `transactions`

- id
- merchant_id
- donor_id nullable
- platform
- external_order_id
- mp_preference_id nullable
- mp_payment_id nullable
- purchase_amount_cents
- donation_amount_cents
- currency
- donation_rule_snapshot json
- consent_snapshot json
- status
- created_at

#### `ledger_entries`

- id
- transaction_id
- type: `purchase_observed`, `donation_authorized`, `split_received`, `ngo_allocated`, `payout_sent`, `refund_reversed`, `adjustment`
- amount_cents
- currency
- debit_account
- credit_account
- idempotency_key
- created_at

#### `leaderboard_entries`

- id
- donor_id
- period
- donation_amount_cents
- donation_count
- score
- visibility

### 7.2 Data principles

- Ledger append-only.
- Cada webhook debe ser idempotente.
- Guardar snapshots de regla y consentimiento por transaccion.
- No exponer PII en leaderboard.
- Separar estado de pago, estado de split, estado de asignacion ONG y estado de payout.

## 8. Plugin strategy

### 8.1 WooCommerce MVP

Construir primero.

Funciones:

- Admin settings para conectar don.ar y Mercado Pago.
- Selector de ONGs/campanas.
- Widget/checkbox de aporte en checkout.
- Agregado de fee visible.
- Creacion de preferencia Mercado Pago.
- Redireccion a Mercado Pago.
- Webhook handler.
- Sync de estado a WooCommerce order.

Riesgos:

- Checkout Blocks vs classic checkout.
- Conflicto con plugin oficial de Mercado Pago.
- Fees y taxes en WooCommerce.
- Carritos recalculados muchas veces.

Mitigacion:

- Soportar classic checkout primero y documentar Blocks como siguiente paso, o implementar ambos si el primer hito lo exige.
- No duplicar logica de calculo en PHP; llamar al Core API.
- Testear con productos simples, envio, cupones y refunds.

### 8.2 Tiendanube

Funciones:

- OAuth app.
- Payment option con `Checkout.processPayment`.
- ExternalPayment/redirect hacia flujo don.ar/MP.
- Webhooks de order/payment.
- Panel embedded/external para configuracion.

Riesgos:

- Validacion en produccion para MP plugin.
- App store/homologacion.
- Menor control sobre checkout que WooCommerce.

### 8.3 VTEX

Funciones:

- Payment Provider Protocol endpoints:
  - `/manifest`
  - `/payments`
  - `/payments/{paymentId}/settlements`
  - `/payments/{paymentId}/refunds`
  - `/payments/{paymentId}/cancellations`
  - auth/config endpoints.
- Test Suite.
- Homologacion.

Riesgos:

- Tiempos de respuesta.
- HTTPS/TLS.
- PCI/Secure Proxy.
- SLA/homologacion.

### 8.4 Adobe Commerce

Funciones:

- Modulo PHP.
- Payment method o extension de checkout/totals.
- Admin settings.
- Webhook endpoints.

Riesgos:

- Complejidad Magento.
- Performance del checkout.
- Compatibilidad versiones.

### 8.5 Shopify

Funciones posibles:

- App para configuracion, intencion y reportes.
- Checkout UI extension si merchant es Shopify Plus.
- Payment app/offsite si somos approved Partner.

Riesgos:

- Payments apps requieren approval.
- Checkout UI de pasos principales limitado a Shopify Plus.
- No conviene como MVP.

## 9. Infraestructura

### 9.1 Servicios

- Web/API app: Core API + admin.
- Worker queue: procesamiento de webhooks, conciliacion, payouts, leaderboard.
- Database: Postgres.
- Object storage: recibos/reportes.
- Secrets manager: credenciales MP, platform tokens.
- Observability: logs, traces, metrics, webhook replay.
- Scheduler: conciliacion periodica.

### 9.2 API boundaries

Los adapters deben usar endpoints como:

- `POST /api/merchant/install`
- `POST /api/merchant/:id/connect-mercadopago`
- `POST /api/donations/quote`
- `POST /api/checkout/session`
- `POST /api/webhooks/mercadopago`
- `POST /api/webhooks/:platform`
- `GET /api/transactions/:id`
- `GET /api/leaderboard`

### 9.3 Idempotencia

Idempotency keys por:

- platform order id;
- MP preference id;
- MP payment id;
- webhook event id;
- ledger transaction id.

Regla: ningun webhook puede crear doble aporte ni doble ledger entry.

## 10. Seguridad y privacidad

- Tokens de Mercado Pago y plataformas cifrados.
- Webhook signature validation donde exista.
- No guardar tarjetas ni datos sensibles de pago.
- Leaderboard opt-in.
- Alias por defecto.
- Limites de donacion por transaccion y por periodo.
- Admin audit log para cambios en ONG, payouts y ajustes.
- Separar permisos de admin, merchant y ONG.

## 11. UX principles

- El aporte debe ser visible antes del pago.
- El usuario debe entender ONG, monto y regla.
- Nunca llamar al aporte "fee" hacia el usuario final si es donacion.
- Copy recomendado:
  - "Sumar aporte don.ar"
  - "Donas $X a [ONG]. Podras verlo en tu historial."
  - "Este aporte es opcional y podes quitarlo antes de pagar."
- Leaderboard:
  - opt-in;
  - alias;
  - no mostrar montos exactos si el usuario no quiere;
  - rankings por periodo y badges no monetarios.

## 12. Problemas esperables

### 12.1 Split no disponible

Algunos canales no permitiran controlar la preferencia Mercado Pago o el split. Fallback:

- sumar aporte como linea visible;
- cobrar con flujo propio si es permitido;
- registrar ledger como pending;
- liquidar manual/conciliado.

### 12.2 Refunds

Refunds pueden romper la contabilidad si compra y aporte se tratan distinto. Necesitamos politica clara antes de produccion.

### 12.3 ONGs y fondos

Si don.ar recauda y luego liquida, puede tener obligaciones fiscales, contables o regulatorias. Necesita revision legal local.

### 12.4 Percepcion de surcharge

Si el usuario siente que se agrego un cargo oculto, el producto pierde confianza. La UX debe ser opt-in, visible y reversible antes de pagar.

### 12.5 Platform limits

Shopify, VTEX y Tiendanube tienen procesos de approval/homologacion. No prometer fechas sin validar acceso a partner/dev programs.

## 13. Testing strategy

### 13.1 Core tests

- Calculo de monto fijo.
- Calculo porcentaje bps.
- Calculo redondeo.
- Limites min/max.
- Snapshots de consentimiento.
- Ledger append-only.
- Idempotencia de webhooks.
- Reversas/refunds.

### 13.2 Payment tests

- Crear preferencia MP sandbox.
- Aplicar `marketplace_fee`.
- Recibir webhook aprobado.
- Recibir webhook duplicado.
- Payment rejected/pending.
- Refund/cancel.

### 13.3 Plugin tests

WooCommerce:

- Producto simple.
- Carrito con envio.
- Cupon.
- Fee visible.
- Checkout classic.
- Checkout Blocks, si esta en scope.
- Webhook actualiza orden.

Tiendanube:

- OAuth.
- Payment option.
- processPayment redirect.
- Webhook order/payment.

VTEX:

- Manifest.
- Create payment.
- Settlement.
- Refund.
- Test Suite.

## 14. Roadmap recomendado

### Fase 0: Spec, legal y sandbox

Output:

- spec aprobado;
- decision de modelo legal/fiscal;
- cuenta Mercado Pago dev;
- test users;
- webhook endpoint publico;
- definicion de politica de refund;
- lista de ONGs demo.

### Fase 1: Core + WooCommerce demo

Output:

- Core API;
- Postgres;
- admin basico;
- WooCommerce plugin MVP;
- MP Checkout Pro sandbox;
- ledger;
- leaderboard opt-in;
- demo end-to-end.

### Fase 2: Tiendanube app

Output:

- app OAuth;
- payment option;
- configuracion de comercio;
- piloto con pagos minimos;
- documentacion de instalacion.

### Fase 3: VTEX / Adobe enterprise

Output:

- VTEX PPP connector prototype;
- Adobe module prototype;
- test suite/homologation checklist;
- oferta para comercios grandes.

### Fase 4: Shopify

Output:

- research de approval;
- Plus checkout UI extension si disponible;
- payment app/offsite route si somos approved Partner.

### Fase 5: QR/Point y Mercado Pago partnership

Output:

- propuesta partnership con datos de conversion;
- piloto presencial;
- evaluacion QR/Point;
- negociacion de primitives mejores para redondeo.

## 15. Success criteria

Primer demo exitoso:

- Un comercio WooCommerce demo activa don.ar.
- Un comprador elige aporte.
- El aporte aparece visible.
- Mercado Pago sandbox procesa pago.
- Webhook actualiza estado.
- Ledger muestra compra, aporte y asignacion.
- Admin ve la transaccion.
- Leaderboard refleja el aporte con alias opt-in.

Primer piloto real exitoso:

- Comercio real instala plugin/app.
- ONG verificada recibe asignaciones.
- Al menos 100 compras procesadas.
- Tasa de opt-in medida.
- Conciliacion sin descuadres materiales.
- Refunds manejados sin ajustes manuales criticos.

## 16. Open questions

- Cual sera la entidad legal que recibe fondos antes de liquidar a ONGs?
- Las donaciones generan recibo fiscal? Quien lo emite?
- El aporte se devuelve automaticamente en refunds?
- El usuario puede elegir ONG por compra o solo regla default?
- Habra limite mensual por donante?
- Que metricas de leaderboard son aceptables sin incentivar malas conductas?
- Que marketplaces/platforms permiten publicar app sin partnership previo?

## 17. Recommendation final

Proceder, pero con una arquitectura que no dependa de promesas no verificadas.

La ruta mas fuerte es:

1. Core don.ar con ledger robusto.
2. WooCommerce + Mercado Pago sandbox como demo.
3. Tiendanube como segundo canal por relevancia Argentina.
4. VTEX/Adobe como expansion enterprise.
5. Shopify y QR/Point solo despues de validar constraints y/o partnership.

El mensaje de producto debe ser transparente: don.ar no desvia pagos; don.ar habilita microaportes autorizados, visibles y conciliables.
