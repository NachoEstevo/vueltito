# Roadmap Y Modelo Operativo

Estado: 2026-06-20. Documento de producto, no asesoramiento legal.

## Decision Actual

Vueltito empieza como una capa de checkout, consentimiento, ledger, conciliacion y transparencia.

Para los primeros pilotos reales:

- El comprador acepta una donacion visible en checkout.
- El comercio cobra la orden completa, incluyendo la donacion.
- Vueltito registra la donacion y calcula lo que debe remitirse.
- El comercio transfiere el 100% a la ONG.
- La ONG confirma la recepcion.
- Vueltito no cobra comision ni descuenta nada durante la etapa inicial.

El objetivo no es monetizar de inmediato. El objetivo es validar que el flujo funciona sin friccion y sin que Vueltito custodie fondos.

## Por Que No Cobramos Al Inicio

Cobrar una factura mensual al comercio es ordenado desde el punto de vista operativo, pero agrega una carga justo cuando todavia estamos probando adopcion.

La primera pregunta es mas basica:

- Los compradores donan?
- El checkout sigue convirtiendo?
- El comercio entiende que debe remitir el dinero?
- La ONG puede confirmar lo recibido?
- La trazabilidad genera confianza?

Hasta que eso este probado, cobrar un fee puede distraer y frenar pilotos.

## Evolucion Del Modelo

### 1. Piloto Bonificado

El comercio instala Vueltito, recauda donaciones y remite 100% a la ONG. Vueltito no cobra fee.

### 2. Plan SaaS Para Comercios

Cuando el modelo este validado, Vueltito puede cobrar un plan al comercio por software, conciliacion, reportes y transparencia.

La donacion sigue separada: si se promete que el 100% llega a la ONG, el fee no se descuenta de esa donacion.

### 3. Remesa Automatica Sin Custodia

El siguiente ideal es automatizar el pago comercio -> ONG sin que Vueltito toque fondos.

Vueltito calcularia el monto, prepararia o dispararia la transferencia, registraria evidencia y conciliaria confirmacion.

### 4. Custodia Y Distribucion Por Vueltito

Es posible como modelo futuro, pero no como simple cambio tecnico.

Si Vueltito cobra, guarda y distribuye donaciones, aparecen obligaciones legales, fiscales, contables, bancarias y posiblemente regulatorias. Solo debe evaluarse con estructura legal, asesoramiento y volumen suficiente.

## Principios

- La donacion es opt-in y visible.
- No hay cargos ocultos.
- Si el comprador no quiere figurar publicamente, dona igual en privado.
- La transparencia publica muestra informacion confirmada, no promesas.
- Vueltito no promete split automatico ni custodia hasta tenerlo resuelto legal y tecnicamente.

## Proximo Foco

1. Primer piloto WooCommerce controlado.
2. ONG verificada y comercio dispuesto a operar el ciclo completo.
3. Conciliacion mensual, remesa y confirmacion real.
4. Tienda Negocio como spike paralelo hasta validar checkout/script/webhook.
5. Pricing recien despues de validar adopcion y operacion.

## Plan Operativo Detallado

El plan implementable vive en el repo de plataforma:

`D:\GithubProjects\vueltito-platform\docs\plans\2026-06-20-production-readiness.md`

Ese documento baja los bloqueantes a tareas: modo bonificado, aceptacion de terminos,
runbook WooCommerce, release hardening, observabilidad, CI Woo y spike Tienda Negocio.
