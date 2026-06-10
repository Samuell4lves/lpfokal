# lpfokal

Landing page da **Fokal Company** — agência de marketing estratégico.

Página de conversão (avaliação gratuita / diagnóstico), construída em **HTML, CSS e JS puro**, com estética dark premium e animações Three.js no hero.

## Estrutura

- `index.html` — página completa (hero, problema, método, serviços, sobre, comparação, resultados, formulário, CTA, FAQ)
- `styles.css` — design system (dark premium, azul de conversão `#0051C5`, Clash Display + Manrope)
- `script.js` — interações (scroll reveal, contadores, spotlight, FAQ, máscara de WhatsApp, hooks de Pixel Meta/GA)
- `weave.js` — malha de luz interativa do hero (Three.js via CDN)
- `copy.md` — copy completa da página
- `server.js` — servidor estático local para desenvolvimento (`node server.js` → http://localhost:4321)

## Rodando localmente

```bash
node server.js
```

> Abrir via servidor (não via `file://`) — o `weave.js` usa módulos ES + CDN.

## Pendências

- [ ] Número real do WhatsApp (`wa.me/55...`)
- [ ] Integração real do formulário (CRM / e-mail)
- [ ] IDs do Pixel Meta, GA4 e GTM
- [ ] Depoimentos e logos de clientes
