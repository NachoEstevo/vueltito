# Vueltito

Vueltito propone sumar una microdonación opcional al pagar una compra online. Nació en la **Halketon de Paisanos**. La idea y el desarrollo inicial son de **Mauro Proto, Ignacio Estevo, Juan Martin Giorgio y Franco Ferreira**, del equipo Acelera.

Este repositorio contiene la [landing](https://vueltito.vercel.app/), las páginas para comercios y de ranking, el formulario de interés para ONG y la documentación de producto. El código del plugin de WooCommerce, la app experimental de Tiendanube, el cálculo de donaciones y el registro de remesas viven en [vueltito-platform](https://github.com/NachoEstevo/vueltito-platform), que requiere acceso.

## Estado al 24 de noviembre de 2026

| Componente | Estado |
| --- | --- |
| Landing | Publicada como demo de producto. La página de ranking puede mostrar ejemplos. |
| Demo del circuito de fondos | En la rama [`codex/vueltito-demo-cycle`](https://github.com/NachoEstevo/vueltito/tree/codex/vueltito-demo-cycle). Simula compra, remesa y confirmación de recepción con datos de prueba. |
| WooCommerce | Plugin 0.4.8 en el repositorio de plataforma. Candidato a piloto. |
| Tiendanube | Widget NubeSDK probado en una tienda demo. Su uso en producción quedó bloqueado por la forma de agregar el aporte al checkout. |
| Shopify | Previsto en el diseño y en los contratos de la API. Queda por desarrollar una app o extensión de checkout. |

En el modelo previsto para el piloto, el comercio cobra el pedido con su pasarela habitual y remite el 100 % de las donaciones a la ONG. Vueltito registra la aceptación, la obligación y la rendición. Cobro de comisiones y custodia de fondos quedan fuera del piloto.

## Vista local

Desde la raíz del repositorio, con Python 3:

```sh
python -m http.server 4173 --bind 127.0.0.1 --directory web
```

Abrí [la portada](http://127.0.0.1:4173/), [comercios](http://127.0.0.1:4173/comercios.html) o [ranking](http://127.0.0.1:4173/leaderboard.html). El servidor estático permite revisar las páginas. El formulario de ONG requiere funciones serverless y una base de prueba. El formulario de comercios simula la inscripción en el navegador. El ranking trae datos de ejemplo si Core no responde.

Con Node.js 22, desde `web/`:

```sh
npm ci
npm test
```

Para recorrer la demo del circuito, usá un checkout de la rama indicada arriba, levantá el mismo servidor y abrí `/demo.html` y `/demo-operations.html` en el mismo navegador y origen. Las pruebas de esa rama se corren desde `web/` con `node --test tests/demo-cycle.test.js`.

## Documentación

- [Integraciones y próximos pasos](docs/integrations/README.md)
- [Modelo operativo](docs/roadmap-modelo-operativo.md)
- [Formulario de interés, variables y privacidad](docs/waitlist-ongs.md)
- [Presentación original](PRESENTACION.md) y [diseño de junio de 2026](docs/superpowers/specs/2026-06-06-don-ar-platform-design.md)
- [Lista de continuidad de junio de 2026](docs/todo-continuidad-vueltito.md)

## Derechos de uso

El repositorio de la landing no tiene una licencia general publicada. La autorización para reutilizar su código, marca, fotos y logos de terceros se confirma con los titulares de cada material. La licencia declarada por el plugin WooCommerce corresponde al plugin.
