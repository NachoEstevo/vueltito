# Runbook Spike TiendaNegocio

Estado: blocked por falta de sandbox/credenciales y contrato API verificable en este repo.

## Objetivo

Validar si Vueltito puede instalarse en TiendaNegocio, provisionar productos de donacion, agregar/quitar la linea de donacion en checkout, recibir webhooks de orden y detectar line items de forma idempotente.

## Evidencia local

- Este repo no contiene cliente TiendaNegocio, rutas backend ni docs tecnicos locales para `referrer/api/v1`.
- La busqueda local no encontro `tiendanegocio`, `donation-config`, `provision-donation` ni endpoints backend relacionados.
- La memoria de trabajo previa menciona un adapter en `D:\GithubProjects\vueltito-platform`, pero este repo no debe asumir ese codigo como fuente de verdad sin copiarlo o verificarlo.

## Contrato esperado a verificar

Estos nombres vienen del handoff y deben validarse contra credenciales/API reales antes de implementarse aqui:

- OAuth/app token bajo `https://api.tiendanegocio.com/referrer/api/v1/oauth/app/token`.
- Provisioning de productos de donacion.
- Configuracion publica tipo `donation-config`.
- Endpoint admin tipo `provision-donation`.
- Webhook de orden pagada con line items.

## Bloqueantes reales

- Falta documentacion oficial publica localizada desde este repo.
- Falta sandbox o comercio de prueba.
- Falta token/app credentials.
- Falta confirmar si el producto de donacion puede ocultarse del catalogo y quedar disponible para checkout.
- Falta confirmar API o script para agregar, quitar y reemplazar line item.
- Falta confirmar payload de webhook y reglas de reintento/firma.

## Plan de ejecucion

1. Obtener credenciales y base URL confirmada por TiendaNegocio.
2. Validar OAuth con request minimo y guardar request/response sanitizados.
3. Listar scopes/permisos requeridos y dejarlos en docs.
4. Implementar cliente TiendaNegocio solo despues de confirmar contrato, con funciones simples y tests por endpoint.
5. Provisionar productos de donacion idempotentemente por monto fijo.
6. Probar agregar, quitar y reemplazar donacion en checkout.
7. Capturar orden paga y confirmar line items estables.
8. Capturar cancel/refund si existe evento equivalente.
9. Decidir estado: `blocked`, `pilot_candidate` o `ready`.

## Checklist de readiness

- [ ] Credenciales/sandbox disponibles.
- [ ] OAuth validado contra endpoint real.
- [ ] Base URL y version API documentadas.
- [ ] Productos de donacion provisionados idempotentemente.
- [ ] Producto de donacion oculto o no navegable, si la plataforma lo permite.
- [ ] Donacion agregable al checkout.
- [ ] Donacion removible del checkout.
- [ ] Orden paga contiene line item detectable.
- [ ] Webhook idempotente validado con payload real.
- [ ] Cancel/refund genera reversa o queda documentado como flujo operativo manual.
- [ ] Una ONG/campana por comercio como default V1.
- [ ] Payloads sanitizados guardados en docs/reports antes de promover estado.

## No cerrar sin evidencia

No marcar TiendaNegocio como lista por memoria de otro repo. En este checkout, el estado correcto es `blocked` hasta validar sandbox/API real o importar el adapter con pruebas.
