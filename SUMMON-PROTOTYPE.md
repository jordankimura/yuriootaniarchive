# Blender summon prototype

The redesign entry point is `src/SummonStudy.jsx`. The original app remains in `src/App.jsx` for reference. Project content remains in `src/data/projects.js`.

## Run

Run `npm ci`, then `npm run dev`. Build with `npm run build`. In restricted Windows environments where esbuild cannot scan parent folders, use `npm run build -- --configLoader native`, followed by `npm run preview -- --configLoader native --host 0.0.0.0`.

## Blender source

`tools/create_yuri_chamber.py` creates the editable source scene. Run it in Blender's Scripting workspace. It creates a new scene. Save the resulting blend file, then export with:

    blender --background path/to/yuri_chamber.blend --python export_chamber.py

The export writes `public/models/chamber.glb` (approximately 318 KB). The browser recreates the lights; Blender's area lighting does not transfer directly. The animated blank sheet hands off to an HTML dossier with real project content. No project-specific Blender animation is required.

## Checks performed

- Production build and ESLint for the new React components.
- Desktop and 390px-wide browser inspection: loading, summon, result, repeat summon, skip and direct browsing.
- No browser console errors during these checks.

## Remaining prototype limitations

- Physical phone performance has not been measured; viewport testing is not a hardware benchmark.
- No audio or advanced postprocessing yet. The idle chamber is intentionally static for this integration milestone.
- Existing dependency audit reports vulnerabilities; dependency updates are a separate task.
- Local preview is not a public deployment. GitHub-to-Vercel deployment configuration has not been verified.
