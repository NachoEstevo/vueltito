# Integraciones de Vueltito

Estado revisado el 24 de noviembre de 2026. El [repositorio de plataforma](https://github.com/NachoEstevo/vueltito-platform) contiene el código y las guías operativas. Requiere acceso.

| Plataforma | Qué queda disponible | Qué falta |
| --- | --- | --- |
| WooCommerce | Plugin instalable para Classic Checkout y Checkout Blocks. La versión 0.4.8 está en el repositorio de plataforma. | Configurar un entorno de prueba, ejecutar el flujo completo y cerrar las condiciones legales, contables y operativas con un comercio y una ONG. |
| Tiendanube | Adapter y OAuth en Core, app NubeSDK y prueba histórica de un widget con montos fijos en una tienda demo. | Validar con Partner Support una línea opcional de checkout. En la prueba, los productos ocultos devolvieron `variant_unavailable`. También falta comprobar en una tienda el registro de pedidos pagos y la reversa. |
| Tienda Negocio | Cliente de API, OAuth, rutas de app en Core y prueba histórica de aprovisionamiento y carrito. | Recuperar acceso autorizado y resolver el rechazo de la variante oculta. Completar un ensayo de checkout y de eventos. |
| Shopify | Identificador de plataforma en los contratos de Core y rutas genéricas reutilizables. | Confirmar si hubo una cuenta de desarrollador y diseñar y construir la app. Revisar los requisitos del plan de tienda para intervenir en checkout. |

## Evidencia y decisiones

- [Auditoría de integraciones de junio](../reports/2026-06-23-integrations-readiness-audit.md)
- [Prueba de checkout de Tiendanube](../reports/2026-06-24-tiendanube-checkout-validation.md) y [guía de exploración](../runbooks/tiendanube-spike.md)
- [Exploración inicial de Tienda Negocio](../runbooks/tiendanegocio-spike.md)
- [Tecnologías oficiales de checkout de Shopify](https://shopify.dev/docs/apps/build/checkout/technologies)

La prueba de Tiendanube usó importes fijos y llegó hasta la interfaz y la modificación de carrito con un producto publicado temporalmente. El redondeo dinámico y la distribución al público siguen pendientes.

Los webhooks de órdenes de Tiendanube y Tienda Negocio quedaron limitados a pruebas locales. Para habilitarlos hace falta autenticar eventos de proveedor y verificar el estado de las órdenes antes de escribir en el ledger.
