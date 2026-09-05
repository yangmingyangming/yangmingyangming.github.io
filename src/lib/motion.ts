export type SphereMotion = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
};

export const sphereMotion: SphereMotion = {
  x: 0.62,
  y: -0.04,
  scale: 1.05,
  opacity: 1,
};

export const crossMotion = {
  progress: 0,
};

export const desktopSphereStates: Record<string, SphereMotion> = {
  hero: { x: 0.62, y: -0.04, scale: 1.05, opacity: 1 },
  about: { x: 1.18, y: -0.38, scale: 0.34, opacity: 0.72 },
  projects: { x: -0.92, y: 0.08, scale: 0.82, opacity: 0.92 },
  internship: { x: 1.24, y: -0.02, scale: 0.23, opacity: 0.54 },
  campus: { x: -1.16, y: 0.28, scale: 0.2, opacity: 0.44 },
  skills: { x: 1.18, y: -0.32, scale: 0.16, opacity: 0.38 },
};

export const mobileSphereStates: Record<string, SphereMotion> = {
  hero: { x: 0.38, y: -0.2, scale: 0.72, opacity: 1 },
  about: { x: 0.9, y: -0.34, scale: 0.23, opacity: 0.62 },
  projects: { x: -0.64, y: 0.24, scale: 0.46, opacity: 0.74 },
  internship: { x: 1.02, y: 0.02, scale: 0.15, opacity: 0.38 },
  campus: { x: -0.92, y: 0.2, scale: 0.14, opacity: 0.32 },
  skills: { x: 0.96, y: -0.28, scale: 0.12, opacity: 0.28 },
};
