# Design QA

## Evidence

- Source visual truth: `D:\Singolun\Videos\屏幕录制 2026-09-03 173827.mp4`.
- Card interaction references: `C:\Users\Singolun\AppData\Local\Temp\codex-clipboard-7ade3196-88bc-4def-ae37-de4a31604ffe.png` and `codex-clipboard-6019e564-9878-4458-b5c3-ae6d8ffaca23.png`.
- Source dimensions: 1920 x 908 px, 30 fps, 37.35 seconds.
- Final desktop captures: `qa/screenshots/desktop-hero-1920x908.png`, `desktop-projects-1920x908.png`, `desktop-cross-small-1920x908.png`, `desktop-cross-mid-1920x908.png`, and `desktop-cross-full-1920x908.png`.
- Responsive captures: 1440 x 900 desktop, 1024 x 768 tablet, and 390 x 844 mobile at device scale factor 1.
- Combined comparison: `qa/visual-comparison.jpg`, with reference frames on the left and matched implementation states on the right.
- Card-state comparison: `qa/card-interaction-comparison.jpg`, pairing the supplied default and hover references with `desktop-projects-1440x900.png` and `desktop-projects-hover-1440x900.png`.

## Final Findings

- Fonts and typography: passed. Inter with Chinese system fallbacks reproduces the reference's light neo-grotesk hierarchy; display text, body text, and metadata remain readable at all tested widths.
- Spacing and layout rhythm: passed. The sphere yields to the active content, project cards preserve each artwork's intrinsic ratio, and no incoherent overlap or horizontal overflow is visible.
- Colors and visual tokens: passed. Black, warm white, blue, pink, orange, and yellow preserve the reference balance without overwhelming the supplied project imagery.
- Image quality and asset fidelity: passed. All artwork comes from the supplied legacy portfolio assets, converted to WebP without stretching. The commercial internship board is split into four sequential images.
- Copy and content: passed. Resume details are condensed into the six requested sections; phone number, birth date, QQ email, and source resume PDF are not published.
- Interaction: passed. Project cards default to title plus cross; hover/focus slightly enlarges the image, lifts the title, reveals one sentence, and swaps the cross for an arrow. Navigation, project routes, mobile menu, sphere motion, and cross transition produce no browser console errors.
- Accessibility: passed. Semantic headings, keyboard focus, image alt text, reduced-motion behavior, and high-contrast content are present.

## Comparison History

- Pass 1 found a faceted sphere outline, an oversized work-section sphere, and programmatic captures that missed the cross animation. The sphere geometry, section motion targets, and test-time Lenis control were corrected.
- Pass 2 found the portrait cropping before the subject and small spheres overlapping resume copy. The portrait became a fixed 4:5 crop centered on the subject, and sphere targets moved outside the content columns.
- Pass 3 found hard inner corners and weak color separation in the small cross. The SDF now uses a smooth union and a local-to-screen gradient blend; the corrected mark is also used on project cards.
- Pass 4 removed fixed card aspect ratios and image zoom so every project cover remains fully visible without cropping.
- Pass 5 moved titles into the artwork, added a restrained hover zoom, and reproduced the reference interaction: title lifts, one-line introduction appears, and the colored cross becomes an arrow.
- Post-fix comparison shows no actionable P0, P1, or P2 differences.

## Follow-up Polish

- P3: The source site uses a proprietary sphere shader with a stronger lens-like dimple. The implemented original shader matches the position, scale, palette, flow, and light-spot behavior without copying that proprietary material exactly.

## Verification

- TypeScript, ESLint, Vitest, production build, Sites packaging tests, and Chromium Playwright tests pass.
- Canvas screenshots have non-trivial pixel output on desktop and mobile.
- Primary routes and interactions were tested with browser console error collection enabled.

final result: passed
