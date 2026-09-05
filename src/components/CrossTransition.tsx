import { Canvas, useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { crossMotion } from "../lib/motion";
import { supportsWebGL2 } from "../lib/webgl";

gsap.registerPlugin(ScrollTrigger);

const crossVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const crossFragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform vec2 uResolution;
  varying vec2 vUv;

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  float smoothUnion(float first, float second, float radius) {
    float blend = clamp(0.5 + 0.5 * (second - first) / radius, 0.0, 1.0);
    return mix(second, first, blend) - radius * blend * (1.0 - blend);
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= uResolution.x / max(uResolution.y, 1.0);
    float eased = smoothstep(0.0, 1.0, uProgress);
    float scale = mix(0.13, 18.0, eased * eased);
    p = rotate2d(mix(-0.74, 0.04, eased)) * p / scale;

    float horizontal = roundedBox(p, vec2(0.5, 0.105), 0.07);
    float vertical = roundedBox(p, vec2(0.105, 0.5), 0.07);
    float shape = smoothUnion(horizontal, vertical, 0.13);
    float alpha = 1.0 - smoothstep(-0.004, 0.004, shape);

    vec3 blue = vec3(0.66, 0.9, 0.98);
    vec3 pink = vec3(0.93, 0.42, 0.72);
    vec3 orange = vec3(1.0, 0.48, 0.24);
    vec3 yellow = vec3(0.96, 0.82, 0.3);
    vec3 localColor = mix(blue, pink, smoothstep(-0.45, 0.2, p.x));
    localColor = mix(localColor, yellow, smoothstep(-0.15, 0.46, p.y + p.x * 0.25));
    vec3 screenColor = mix(blue, pink, smoothstep(0.18, 0.64, vUv.x));
    screenColor = mix(screenColor, orange, smoothstep(0.58, 0.88, vUv.x));
    screenColor = mix(screenColor, yellow, smoothstep(0.42, 0.95, vUv.y + vUv.x * 0.25));
    vec3 color = mix(localColor, screenColor, smoothstep(0.34, 0.78, eased));
    color += sin((vUv.x + vUv.y) * 8.0) * 0.015;

    gl_FragColor = vec4(color, alpha);
  }
`;

function CrossPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    }),
    [],
  );

  useFrame(({ size }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uProgress.value = crossMotion.progress;
    materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={crossVertexShader}
        fragmentShader={crossFragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function CrossTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [available] = useState(supportsWebGL2);

  useLayoutEffect(() => {
    if (!sectionRef.current || !stickyRef.current) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      crossMotion.progress = 1;
      stickyRef.current.style.setProperty("--cross-progress", "1");
      return () => {
        crossMotion.progress = 0;
      };
    }

    const tween = gsap.to(crossMotion, {
      progress: 1,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.75,
        onUpdate: ({ progress }) => {
          stickyRef.current?.style.setProperty("--cross-progress", progress.toFixed(4));
        },
      },
    });

    return () => {
      tween.kill();
      crossMotion.progress = 0;
    };
  }, []);

  return (
    <section ref={sectionRef} className="cross-section" aria-label="进入联系区域">
      <div ref={stickyRef} className="cross-sticky" data-testid="cross-transition">
        {available ? (
          <Canvas
            className="cross-canvas"
            orthographic
            camera={{ position: [0, 0, 1], zoom: 1 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            aria-hidden="true"
          >
            <CrossPlane />
          </Canvas>
        ) : (
          <div className="cross-fallback" aria-hidden="true" />
        )}
        <p className="cross-copy">LET&apos;S MAKE SOMETHING TO+GETHER.</p>
      </div>
    </section>
  );
}
