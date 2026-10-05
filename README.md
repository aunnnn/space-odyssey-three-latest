# Space Odyssey

The code for Spaceship Flight: a silent, scroll-driven 3D voyage through a
planets-and-stars route that ends in a surprise Greek corridor and a wormhole
finale.

## Layout

- `index.html` — page shell, loading UI, asset preloads
- `assets/css/style.css` — all styles
- `assets/js/config.js` — tuning constants
- `assets/js/main.js` — scene, voyage route, chapters, mission logs
- `assets/js/performance.js` — adaptive quality tiers
- `assets/js/vendor/` — three.js + GLTFLoader (pinned, unmodified)
- `assets/models/*.glb` — comet, satellite, Doryphoros, Apollo, moai
- `assets/images/backdrop.jpg` — deep-space backdrop

## Rendering notes

Everything is preloaded up front behind a progress screen: all five models are
fetched and parsed in parallel, then each one is drawn once before scrolling
unlocks, so shaders compile and GPU buffers upload before the voyage begins —
no hitches when model objects first appear on screen. Draco meshes were decoded
at build time, so no decoder download is needed at runtime.

Serve this folder over HTTP (e.g. `python3 -m http.server`) and open
`index.html`, or publish with GitHub Pages.
