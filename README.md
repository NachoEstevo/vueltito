# Vueltito

Vueltito propone sumar una microdonación opcional al pagar una compra online. Nació en la **Halketon de Paisanos**. La idea y el desarrollo inicial son de **Mauro Proto, Ignacio Estevo, Juan Martin Giorgio y Franco Ferreira**, del equipo Acelera.

Este repositorio contiene la [landing](https://vueltito.vercel.app/), las páginas para comercios y de ranking, el formulario de interés para ONG y la documentación de producto. El código del plugin de WooCommerce, la app experimental de Tiendanube, el cálculo de donaciones y el registro de remesas viven en [vueltito-platform](https://github.com/NachoEstevo/vueltito-platform), que requiere acceso.

## Dónde empezar

El [plan de continuidad](https://github.com/NachoEstevo/vueltito-platform/blob/main/docs/continuidad.md) prioriza un piloto de WooCommerce con un comercio y una ONG. La rama [`codex/vueltito-demo-cycle`](https://github.com/NachoEstevo/vueltito/tree/codex/vueltito-demo-cycle) permite simular compra, remesa y confirmación de recepción con datos de prueba.

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

- [Estado de las integraciones](docs/integrations/README.md)
- [Formulario de interés, variables y privacidad](docs/waitlist-ongs.md)
- [Presentación original](https://github.com/NachoEstevo/vueltito/blob/b3a6201ab8b8864f049464068bba35c0d3578e68/PRESENTACION.md)

## Derechos de uso

El repositorio de la landing no tiene una licencia general publicada. La autorización para reutilizar su código, marca, fotos y logos de terceros se confirma con los titulares de cada material. La licencia declarada por el plugin WooCommerce corresponde al plugin.
