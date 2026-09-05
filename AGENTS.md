# Prototype Instructions

## Locked portfolio decisions

- Build a Chinese-first portfolio with English display headings for Yang Ming.
- Use the supplied OFF+BRAND screen recording only as visual motion reference.
- Keep one fixed WebGL liquid sphere through the home sections and use a full-screen rounded-cross transition before contact.
- Publish five projects from the legacy repository history; project pages contain only metadata, one introduction, and images.
- Always show project artwork at its intrinsic aspect ratio; never crop card or detail images.
- On project detail pages, stack gallery images with no gaps so adjacent artwork edges meet continuously.
- Keep project titles inside the card. Reveal the one-line teaser and arrow only on hover/focus, while the default state shows the title and colored cross.
- Treat the home sphere as a real-time WebGL organic fluid: use 3D noise displacement, Fresnel edge lighting, and immediate pointer hover/drag deformation with transient ripples but no elastic inertia or release rebound.
- Keep pointer wave response gentle: use restrained displacement, short-lived ripples, and sparse ripple emission.
- Keep ripple lighting clearly visible through soft warm-pink energy, without increasing the underlying wave displacement.
- Keep sphere colors unified and reference-led: a soft pink, peach-orange, and cream gradient with a restrained lilac-blue lower transition; avoid high-contrast red/cyan color blocking.
- Avoid glossy specular hotspots on the sphere; use only a low-intensity Fresnel contour for volume.
- Keep the sphere silhouette smooth with high radial/vertical subdivisions and sufficient renderer pixel ratio.
- Show the university email and existing social links. Do not expose phone number, date of birth, QQ email, or the resume PDF.
- Preserve the complete internship and campus-project wording supplied in the reference images; do not shorten either section into summaries or tags.
- Use the supplied reference copy for the WAYS OF MAKING section, including all four capability groups and their full bullet text.
- Do not modify or restore `D:\SingProjects\yangmingyangming.github.io`; extract source assets from its Git history only.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
