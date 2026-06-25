# Integraciones Vueltito

Estado: 2026-06-24.

Este indice separa evidencia local, evidencia de plataforma y bloqueantes reales para no mezclar roadmap con readiness productivo.

## Estado por plataforma

| Plataforma | Estado local en este repo | Estado producto | Evidencia |
| --- | --- | --- | --- |
| WooCommerce | Landing y descarga `web/downloads/vueltito-donations-0.4.7.zip` | Disponible en este repo como 0.4.7; el handoff menciona 0.4.8, pero este checkout no contiene ese ZIP | `README.md`, `web/comercios.html`, `web/downloads/` |
| TiendaNube | Scaffold NubeSDK de prueba en `output/tiendanube-checkout-build`; codigo vivo de app en `D:\GithubProjects\vueltito-platform\apps\tiendanube-checkout` | Widget checkout v9 probado en tienda demo propia con UI alineada y sin icono; V1 productiva bloqueada: `published=false` devuelve `variant_unavailable`; `published=true` funciona pero se rechaza como workaround; link externo de marca pierde `href` en checkout | `docs/runbooks/tiendanube-spike.md`, `docs/reports/2026-06-24-tiendanube-checkout-validation.md` |
| TiendaNegocio | Sin codigo de app/conector local | Spike bloqueado por credenciales/sandbox y contrato verificable en este repo | `docs/runbooks/tiendanegocio-spike.md` |

## Hallazgos de auditoria local

- Branch actual: `main`.
- Working tree: contiene docs/artefactos no committeados de auditoria y spike.
- No hay backend/core/admin local visible en este checkout. `apps/api` existe como carpeta, pero no contiene implementacion versionada inspeccionable.
- La API versionada real de este repo esta bajo `web/api` y cubre waitlist de ONGs/comercios, no ledger ni integraciones de ecommerce.
- El documento `docs/roadmap-modelo-operativo.md` referencia un plan detallado en `D:\GithubProjects\vueltito-platform`. Para TiendaNube, se verifico en vivo que el monorepo contiene el adapter/Core y la app NubeSDK, pero este checkout conserva la decision y evidencia resumida.

## Decisiones fijas para V1

- Vueltito no custodia fondos.
- La donacion es opt-in, visible y reversible.
- El comercio cobra la orden completa, incluyendo la donacion.
- El comercio remite el 100% de la donacion a la ONG.
- Fee-free durante pilotos iniciales; no usarlo como claim comercial central salvo en contexto operativo.
- Split/custody y Mercado Pago marketplace quedan fuera de V1.
- Leaderboard solo opt-in, con alias publico y sin PII publica.
- Para V1 se prefiere una sola ONG/campana por comercio salvo aceptacion operativa explicita.

## Proximo orden de trabajo

1. Corregir la brecha WooCommerce 0.4.7 vs 0.4.8: importar o publicar el ZIP correcto en este repo, o documentar que 0.4.8 vive fuera de este checkout.
2. Escalar TiendaNube a Partner Support con evidencia `published=false -> variant_unavailable`; pedir linea/fee opcional, private buyable product o app-owned checkout line.
3. Ejecutar TiendaNegocio solo cuando existan credenciales/sandbox y contrato API verificable.
4. Cuando haya evidencia real, promover cada plataforma de `blocked` a `pilot_candidate` o `ready`.
