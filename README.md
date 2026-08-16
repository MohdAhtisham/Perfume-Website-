# Noir Essence — 3D Perfume Website

A responsive, interactive showcase site for a fictional fine-fragrance brand, built with plain HTML/CSS/JS and a Three.js hero scene.

## Features

- **3D hero bottle** — a Three.js glass-material perfume bottle you can drag to spin, with mouse-parallax tilt and gentle auto-rotation. Falls back to a static SVG bottle if WebGL or the CDN is unavailable.
- **Tilt product cards** — the collection grid reacts to the pointer with a light 3D tilt and a moving glass "shine" highlight.
- **Layered parallax** — the craft/story section uses stacked 3D layers that shift depth as you scroll.
- **Flip cards** — top/heart/base fragrance notes flip in 3D on tap or click.
- **Fully responsive** — fluid type, a collapsible mobile nav, and layouts that adapt from phone to ultra-wide.
- **Small extras** — animated stat counters, a review carousel, a mock "add to bag" flow, and a newsletter form.
- Respects `prefers-reduced-motion` throughout.

## Structure

```
index.html        markup for every section
css/style.css      all styling (tokens, layout, animations, responsive rules)
js/main.js         core UI: nav, product grid, reveal-on-scroll, tilt, flip cards,
                    carousel, forms — has no external dependencies
js/hero-scene.js   the Three.js hero bottle, loaded as its own module so a failed
                    or blocked CDN import can never break the rest of the site
```

## Running locally

No build step — just serve the folder statically:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Notes

- `js/hero-scene.js` loads Three.js from a CDN (jsDelivr) via an import map in `index.html`. If that request fails for any reason, the hero automatically shows a static SVG bottle instead — the rest of the site (nav, products, cart, forms) is unaffected either way, since it lives in a separate, dependency-free script.
- All product imagery is drawn with inline SVG/CSS — no external image assets required.
