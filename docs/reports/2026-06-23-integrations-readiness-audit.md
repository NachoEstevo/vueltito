# Auditoria De Readiness De Integraciones

Fecha: 2026-06-23.
Repo auditado: `D:\GithubProjects\vueltito`.

## Comandos ejecutados

- `git status --short`: working tree limpio al inicio.
- `git branch --show-current`: `main`.
- `rg --files`: landing/web, docs, waitlist API y ZIP WooCommerce 0.4.7.
- `rg -n "tiendanube|tiendanegocio|nubesdk|referrer|webhook|donation-config|provision|woocommerce" . -S`: sin codigo TiendaNube/TiendaNegocio; referencias en docs/landing.

## Estructura encontrada

- `web/`: landing estatica, leaderboard, pagina comercios, spec publica y API serverless de waitlist.
- `web/downloads/vueltito-donations-0.4.7.zip`: unico ZIP WooCommerce presente.
- `web/api/`: waitlist y notificaciones; no contiene ledger/core de donaciones.
- `apps/api/`: carpeta vacia o sin archivos versionados relevantes en esta auditoria.
- `docs/`: roadmap operativo, continuidad, waitlist y spec historica.

## Estado WooCommerce

Localmente el repo expone WooCommerce como disponible, pero el ZIP presente es `0.4.7`. El handoff menciona release `0.4.8`; esa version no existe en este checkout al momento de la auditoria. Accion necesaria: traer el ZIP 0.4.8 o ajustar el estado publico a lo que realmente existe aqui.

## Estado TiendaNube

No hay codigo local de app/conector. La documentacion oficial confirma piezas necesarias para investigar: OAuth, scripts, Checkout payment options, Products, Orders y Webhooks. Eso no prueba que Vueltito pueda modificar checkout como necesita V1; solo habilita el spike.

Estado recomendado: `blocked` hasta tener app partner y tienda demo. Si se prueba add/remove de linea y webhook con line items, puede pasar a `pilot_candidate`.

## Estado TiendaNegocio

No hay codigo local ni docs de TiendaNegocio en este repo. No se encontro documentacion publica suficiente durante la auditoria. La informacion de endpoints viene del handoff/memoria, no de evidencia local actual.

Estado recomendado: `blocked` hasta obtener sandbox/credenciales/API contract y payloads reales.

## Bloqueantes compartidos

- Falta backend/core/admin local en este checkout para ledger, remesas y dashboard.
- Falta decidir si este repo sera solo landing/docs o si debe recibir codigo de integraciones.
- Falta cerrar brecha WooCommerce 0.4.7 vs 0.4.8.
- Falta fuente canonica local para runbooks de piloto WooCommerce.
- Falta Notion sync o instrucciones de publicacion si Notion sigue siendo fuente operativa.

## Plan meticuloso

1. Ordenar docs locales y hacer explicito el estado real por plataforma.
2. Resolver version WooCommerce en este repo antes de afirmar release 0.4.8 publicamente.
3. Preparar spike TiendaNube contra app partner/tienda demo con capturas y payloads sanitizados.
4. Preparar spike TiendaNegocio solo cuando haya contrato API verificable.
5. Si se importa codigo desde otro repo, hacerlo con tests y manteniendo logica de negocio en servicios/use-cases, no en controladores.
6. Actualizar landing/spec solo cuando los estados cambien con evidencia real.
