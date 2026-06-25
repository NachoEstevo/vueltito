# TiendaNube checkout validation and product decision

Fecha: 2026-06-24.
Estado: blocked para V1 productiva; spike tecnico funcional hasta el limite de producto oculto y links externos en checkout.

## Producto objetivo

La experiencia correcta es la de WooCommerce: en el checkout, el comprador ve una donacion opt-in como linea clara, puede elegir monto o quitarla, el total final la incluye antes de pagar y la orden conserva esa linea para ledger, refunds y remesa.

Para V1, Vueltito no debe custodiar fondos. El comercio cobra la donacion y remite el 100% a la ONG. El split 97% ONG / 3% Vueltito es un objetivo futuro que requiere una primitiva de pago/split aprobada; no debe mezclarse con el camino V1 sin custodia.

## Evidencia verificada

| Area | Resultado |
| --- | --- |
| Tienda demo propia | `vueltitotienda.mitiendanube.com`, store id `7833593` |
| App partner | `vueltito-donaciones`, app id `34054` |
| OAuth/scopes | OK: `write_products`, `read_orders`, `write_scripts` |
| Config publica | OK: `/v1/public/tiendanube/donation-config?store=7833593` |
| NubeSDK checkout | OK: script `#7743`, version v9 (`id=26174`) en `testing`, instalado solo en tienda demo via `deploy-test` |
| UI checkout | OK: card blanca estilo WooCommerce con pills `$100/$250/$500`, sin icono de checkbox y encabezado alineado; evidencia `docs/reports/tiendanube-v9-checkout-viewport.png` |
| Link externo marca Vueltito | Bloqueado por runtime de checkout: `Link` renderiza `<a>`, pero TiendaNube remueve el `href` externo |
| Producto `published=false` | Bloqueado para flujo completo: `cart:add` devuelve `variant_unavailable` al intentar agregar la linea real |
| Producto `published=true` | Funciona tecnicamente y suma al total, pero no es aceptable como V1 |
| Limpieza | Linea de prueba removida; producto `$100` devuelto a `published=false` |

## Nota UI 2026-06-24

Se corrigio el widget NubeSDK que inicialmente heredaba botones oscuros y ancho excesivo. La version de demo activa es v9, cuyo DOM verificado no muestra SVG/icono de checkbox en el card y alinea verticalmente "Suma tu vueltito" con "Opcional". La marca `VUELTITO` se deja como `Link` apuntando a `https://vueltito.org/` en fuente, pero el checkout host renderiza el anchor sin `href`; no hay primitiva NubeSDK verificada para abrir URL externa. No se activo instalacion global ni se toco Whisper.

## Decision matrix

| Camino | Fit producto | Estado |
| --- | --- | --- |
| NubeSDK + linea/fee privada de checkout | Alto: se parece a WooCommerce y no contamina catalogo | No encontrada en docs publicas; pedir a Partner Support |
| NubeSDK + private buyable product | Alto si TiendaNube lo habilita | No disponible en prueba; `published=false` falla |
| NubeSDK + producto publicado | Bajo: fricciona al comercio y contamina catalogo | Rechazado para V1 self-serve |
| Payment Provider Vueltito | Medio/futuro: podria habilitar pago/split, pero cambia el producto | Requiere soporte, homologacion y asumir flujo de pago |
| Donacion post-compra | Bajo: no es la tesis de checkout y baja conversion | Solo fallback comercial, no V1 ideal |

## Proxima accion correcta

Escalar a TiendaNube con evidencia puntual:

> Tenemos una app NubeSDK en checkout que renderiza bien y llama `cart:add`. Para una donacion opt-in necesitamos agregar una linea visible que no aparezca en catalogo. Con variantes `published=false`, TiendaNube responde `variant_unavailable`; con `published=true` funciona, pero no es aceptable para comercios. Existe una primitiva aprobada para checkout-only line, optional fee, private buyable product o app-owned line item? Si la unica alternativa es Payment Provider, puede esa app cobrar carrito + donacion voluntaria sin reemplazar el medio de pago del comercio y con split/remesa separada?

Hasta tener esa respuesta, TiendaNube no esta listo para V1 productiva aunque el widget de checkout funcione. El link externo de marca tambien requiere confirmacion/soporte de TiendaNube o una alternativa aprobada de navegacion externa.

## Fuentes primarias

- Scripts API: https://tiendanube.github.io/api-documentation/resources/script
- Products API: https://tiendanube.github.io/api-documentation/resources/product
- Cart API: https://tiendanube.github.io/api-documentation/resources/cart
- Checkout API: https://tiendanube.github.io/api-documentation/resources/checkout
- Payment Provider API: https://tiendanube.github.io/api-documentation/resources/payment-provider
- NubeSDK events: https://dev.tiendanube.com/docs/applications/nube-sdk/events
- NubeSDK UI slots: https://dev.tiendanube.com/docs/applications/nube-sdk/ui-slots
