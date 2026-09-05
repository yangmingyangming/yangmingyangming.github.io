let webgl2Support: boolean | null = null;

export function supportsWebGL2() {
  if (webgl2Support !== null) return webgl2Support;
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    webgl2Support = Boolean(context);
  } catch {
    webgl2Support = false;
  }

  return webgl2Support;
}
