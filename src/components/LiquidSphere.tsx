import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, type ErrorInfo, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { crossMotion, sphereMotion } from "../lib/motion";
import { supportsWebGL2 } from "../lib/webgl";

const RIPPLE_COUNT = 8;
const RIPPLE_LIFETIME = 1.25;

const vertexShader = /* glsl */ `
  precision highp float;
  precision highp int;
  #define RIPPLE_COUNT 8
  uniform float uTime;
  uniform vec3 uPointer;
  uniform vec3 uPointerVelocity;
  uniform float uInteraction;
  uniform float uDrag;
  uniform vec3 uRippleCenters[RIPPLE_COUNT];
  uniform float uRippleAges[RIPPLE_COUNT];
  uniform float uRippleStrengths[RIPPLE_COUNT];
  uniform float uRippleSpeeds[RIPPLE_COUNT];

  varying vec3 vWorldPosition;
  varying vec3 vObjectPosition;
  varying vec3 vWorldNormal;
  varying float vFlow;
  varying float vPointerDistance;
  varying float vRippleEnergy;
  varying float vWake;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int octave = 0; octave < 3; octave += 1) {
      value += snoise(p) * amplitude;
      p = p * 2.03 + vec3(11.7, 3.1, 7.9);
      amplitude *= 0.5;
    }
    return value;
  }

  float sphericalDistance(vec3 first, vec3 second) {
    return sqrt(max(0.0, 2.0 - 2.0 * clamp(dot(normalize(first), normalize(second)), -1.0, 1.0)));
  }

  void main() {
    vec3 baseNormal = normalize(position);
    vec3 drift = vec3(uTime * 0.072, -uTime * 0.048, uTime * 0.055);
    vec3 noisePosition = position * 1.42 + drift;
    vec3 domainWarp = vec3(
      snoise(noisePosition + vec3(4.1, 1.7, 8.3)),
      snoise(noisePosition + vec3(9.2, 3.4, 2.6)),
      snoise(noisePosition + vec3(1.8, 7.4, 5.1))
    ) * 0.11;
    float baseNoise = snoise(noisePosition);
    float broadFlow = fbm(noisePosition + domainWarp);
    float fineFlow = snoise(noisePosition * 2.15 - domainWarp * 0.7 + drift * 0.35);
    float flow = broadFlow * 0.78 + fineFlow * 0.18 + baseNoise * 0.04;
    float breathing = sin(uTime * 0.64 + position.y * 2.4 + position.x * 1.3) * 0.004;

    vec3 pointerNormal = normalize(uPointer);
    float pointerAngle = sphericalDistance(baseNormal, pointerNormal);
    float contact = exp(-pointerAngle * pointerAngle * 34.0) * uInteraction;
    vec3 velocityTangent = uPointerVelocity - baseNormal * dot(uPointerVelocity, baseNormal);
    float velocitySize = clamp(length(velocityTangent), 0.0, 2.2);
    vec3 velocityDirection = normalize(velocityTangent + vec3(0.0003, 0.0002, 0.0001));
    float dragSize = clamp(velocitySize * 0.065, 0.0, 0.16);
    vec3 dragDirection = velocityDirection;
    float dragLobe = smoothstep(-0.2, 0.88, dot(baseNormal, dragDirection));
    float wakeDirection = smoothstep(-0.34, 0.86, dot(normalize(baseNormal - pointerNormal * 0.56), velocityDirection));
    float wake = contact * velocitySize * wakeDirection * 0.46;

    float displacement = flow * 0.046 + breathing;
    displacement -= contact * (0.032 + uDrag * 0.022);
    displacement += contact * dragSize * (0.026 + dragLobe * 0.028);
    displacement += contact * dragLobe * velocitySize * 0.0035;
    float rippleEnergy = 0.0;

    for (int rippleIndex = 0; rippleIndex < RIPPLE_COUNT; rippleIndex += 1) {
      float age = uRippleAges[rippleIndex];
      if (age >= 0.0) {
        float distanceToRipple = sphericalDistance(baseNormal, uRippleCenters[rippleIndex]);
        float radius = age * (0.92 + uRippleSpeeds[rippleIndex] * 0.12);
        float ringDistance = distanceToRipple - radius;
        float ring = sin(ringDistance * 46.0) * exp(-ringDistance * ringDistance * 92.0);
        float impact = exp(-distanceToRipple * distanceToRipple * 70.0) * exp(-age * 3.5);
        float envelope = exp(-distanceToRipple * 2.8) * exp(-age * 1.45);
        float ripple = (ring * 0.82 + impact * 0.54) * envelope * uRippleStrengths[rippleIndex];
        displacement += ripple * 0.48;
        rippleEnergy += abs(ripple);
      }
    }

    vec3 displaced = position + baseNormal * displacement;
    displaced += dragDirection * contact * dragSize * (0.04 + dragLobe * 0.03);
    displaced += velocityDirection * contact * velocitySize * 0.005;
    displaced += velocityDirection * wake * 0.008;

    const float noiseEpsilon = 0.045;
    vec3 flowGradient = vec3(
      (snoise(noisePosition + vec3(noiseEpsilon, 0.0, 0.0)) - baseNoise) / noiseEpsilon,
      (snoise(noisePosition + vec3(0.0, noiseEpsilon, 0.0)) - baseNoise) / noiseEpsilon,
      (snoise(noisePosition + vec3(0.0, 0.0, noiseEpsilon)) - baseNoise) / noiseEpsilon
    );
    vec3 localNormal = normalize(baseNormal - flowGradient * 0.018);
    localNormal = normalize(localNormal + dragDirection * contact * dragSize * 0.08);

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = worldPosition.xyz;
    vObjectPosition = displaced;
    vWorldNormal = normalize(mat3(modelMatrix) * localNormal);
    vFlow = flow;
    vPointerDistance = pointerAngle;
    vRippleEnergy = clamp(rippleEnergy * 3.2, 0.0, 1.0);
    vWake = clamp(wake * 0.16, 0.0, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif
  precision mediump int;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uPointer;
  uniform float uInteraction;
  uniform float uDrag;

  varying vec3 vWorldPosition;
  varying vec3 vObjectPosition;
  varying vec3 vWorldNormal;
  varying float vFlow;
  varying float vPointerDistance;
  varying float vRippleEnergy;
  varying float vWake;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vWorldNormal);
    if (dot(normal, viewDirection) < 0.0) normal *= -1.0;

    float facing = max(dot(normal, viewDirection), 0.0);
    float fresnel = pow(1.0 - facing, 4.1);
    float broadRim = pow(1.0 - facing, 2.0);
    vec3 keyLight = normalize(vec3(-0.48, 0.68, 1.0));
    vec3 fillLight = normalize(vec3(0.72, -0.34, 0.58));
    float diffuse = max(dot(normal, keyLight), 0.0);
    float fill = max(dot(normal, fillLight), 0.0);
    float backScatter = pow(max(dot(-normal, keyLight), 0.0), 2.0);
    vec3 halfVector = normalize(keyLight + viewDirection);
    float broadReflection = pow(max(dot(normal, halfVector), 0.0), 28.0);

    float flow = clamp(vFlow * 0.52 + 0.5 + sin(vObjectPosition.y * 2.6 + uTime * 0.16) * 0.045, 0.0, 1.0);
    vec3 surfacePosition = normalize(vObjectPosition);
    float paletteCycle = 0.5 + 0.5 * sin(uTime * 0.34);
    float paletteDrift = sin(uTime * 0.22 + surfacePosition.y * 2.1 + surfacePosition.x * 1.4) * 0.075;
    vec3 peach = mix(vec3(1.0, 0.46, 0.3), vec3(1.0, 0.56, 0.38), paletteCycle * 0.38);
    vec3 rose = mix(vec3(1.0, 0.38, 0.57), vec3(1.0, 0.48, 0.52), paletteCycle * 0.34);
    vec3 cream = mix(vec3(1.0, 0.9, 0.71), vec3(1.0, 0.82, 0.54), paletteCycle * 0.42);
    vec3 lilacBlue = mix(vec3(0.55, 0.65, 0.82), vec3(0.45, 0.57, 0.86), paletteCycle * 0.34);
    float pinkRegion = smoothstep(0.12, 0.78, dot(surfacePosition, normalize(vec3(-0.62, 0.7, 0.35))) + paletteDrift);
    float creamRegion = smoothstep(0.12, 0.82, dot(surfacePosition, normalize(vec3(0.75, 0.16, 0.58))) - paletteDrift * 0.7);
    float blueRegion = smoothstep(0.22, 0.82, dot(surfacePosition, normalize(vec3(-0.5, -0.72, 0.22))) + paletteDrift * 0.5);
    vec3 color = mix(peach, rose, pinkRegion * 0.72);
    color = mix(color, cream, creamRegion * 0.82);
    color = mix(color, lilacBlue, blueRegion * 0.58);
    color = mix(color, vec3(1.0, 0.62, 0.42), smoothstep(0.28, 0.72, flow) * (0.1 + paletteCycle * 0.045));

    color *= 0.5 + diffuse * 0.5 + fill * 0.12;
    color += backScatter * vec3(0.22, 0.1, 0.15);
    color += broadReflection * vec3(1.0, 0.88, 0.7) * 0.24;

    vec3 rimColor = mix(vec3(1.0, 0.78, 0.84), vec3(1.0, 0.95, 0.76), smoothstep(0.18, 0.76, flow));
    color += rimColor * (fresnel * 0.34 + broadRim * 0.045);
    color += vRippleEnergy * vec3(1.0, 0.4, 0.46) * (0.26 + uDrag * 0.2);
    color += vRippleEnergy * vRippleEnergy * vec3(1.0, 0.72, 0.5) * 0.1;
    color += vWake * vec3(1.0, 0.3, 0.36) * 0.28;

    vec3 surfaceNormal = normalize(vObjectPosition);
    vec3 pointerNormal = normalize(uPointer);
    float pointerAngle = sqrt(max(0.0, 2.0 - 2.0 * clamp(dot(surfaceNormal, pointerNormal), -1.0, 1.0)));
    float pointerField = uInteraction;
    float pointerGlow = exp(-pointerAngle * pointerAngle * 30.0) * pointerField;
    float pointerRingOffset = pointerAngle - 0.115;
    float surfaceRingOffset = vPointerDistance - 0.2;
    float pointerRing = exp(-pointerRingOffset * pointerRingOffset * 310.0) * pointerField;
    float surfaceRing = exp(-surfaceRingOffset * surfaceRingOffset * 190.0) * pointerField;
    color = mix(color, vec3(1.0, 0.34, 0.42), clamp(pointerGlow * (0.26 + uDrag * 0.18), 0.0, 0.48));
    color += pointerRing * vec3(1.0, 0.38, 0.3) * (0.3 + uDrag * 0.18);
    color += surfaceRing * vec3(1.0, 0.54, 0.36) * 0.1;

    gl_FragColor = vec4(color, clamp(uOpacity, 0.0, 1.0));
  }
`;

type Ripple = {
  center: THREE.Vector3;
  age: number;
  strength: number;
  speed: number;
};

function createRipples() {
  return Array.from({ length: RIPPLE_COUNT }, (): Ripple => ({
    center: new THREE.Vector3(0, 0, 1),
    age: -1,
    strength: 0,
    speed: 1,
  }));
}

function SphereMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointerTarget = useRef(new THREE.Vector3(0, 0, 1));
  const pointer = useRef(new THREE.Vector3(0, 0, 1));
  const pointerVelocityTarget = useRef(new THREE.Vector3());
  const pointerVelocity = useRef(new THREE.Vector3());
  const pointerHit = useRef(new THREE.Vector3());
  const pointerDelta = useRef(new THREE.Vector3());
  const tangentDelta = useRef(new THREE.Vector3());
  const pointerNdc = useRef(new THREE.Vector2());
  const pointerCenter = useRef(new THREE.Vector3());
  const pointerScale = useRef(new THREE.Vector3());
  const pointerSphere = useRef(new THREE.Sphere());
  const lastPointerHit = useRef(new THREE.Vector3(0, 0, 1));
  const lastPointerTime = useRef(0);
  const lastRippleTime = useRef(0);
  const hasPointerHit = useRef(false);
  const pointerInside = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const userSelectBeforeDrag = useRef("");
  const selectionLocked = useRef(false);
  const isDragging = useRef(false);
  const interactionTarget = useRef(0);
  const interaction = useRef(0);
  const ripples = useRef(createRipples());
  const rippleCenters = useMemo(() => ripples.current.map((ripple) => ripple.center), []);
  const rippleAges = useMemo(() => ripples.current.map((ripple) => ripple.age), []);
  const rippleStrengths = useMemo(() => ripples.current.map((ripple) => ripple.strength), []);
  const rippleSpeeds = useMemo(() => ripples.current.map((ripple) => ripple.speed), []);
  const { viewport, camera, raycaster, gl, size } = useThree();
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const segments = size.width <= 820 ? 256 : 500;

  const addRipple = useCallback((center: THREE.Vector3, strength: number, speed = 1) => {
    const pool = ripples.current;
    let slot = pool.findIndex((ripple) => ripple.age < 0 || ripple.age > RIPPLE_LIFETIME);
    if (slot < 0) {
      slot = pool.reduce((oldest, ripple, index) => (ripple.age > pool[oldest].age ? index : oldest), 0);
    }
    const ripple = pool[slot];
    ripple.center.copy(center).normalize();
    ripple.age = 0;
    ripple.strength = THREE.MathUtils.clamp(strength, 0.025, 0.22);
    ripple.speed = THREE.MathUtils.clamp(speed, 0.65, 1.65);
  }, []);

  const resolvePointerHit = useCallback((clientX: number, clientY: number) => {
    const mesh = meshRef.current;
    const rect = gl.domElement.getBoundingClientRect();
    if (!mesh || rect.width <= 0 || rect.height <= 0) return false;
    pointerNdc.current.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointerNdc.current, camera);
    const hit = raycaster.intersectObject(mesh, false)[0];
    if (hit) {
      pointerHit.current.copy(hit.point);
      mesh.worldToLocal(pointerHit.current);
      pointerHit.current.normalize();
      return true;
    }

    mesh.getWorldPosition(pointerCenter.current);
    const radius = mesh.getWorldScale(pointerScale.current).x * 1.1;
    pointerSphere.current.set(pointerCenter.current, radius);
    const fallbackHit = raycaster.ray.intersectSphere(pointerSphere.current, pointerHit.current);
    if (!fallbackHit) return false;
    mesh.worldToLocal(pointerHit.current);
    pointerHit.current.normalize();
    return true;
  }, [camera, gl, raycaster]);

  const updatePointer = useCallback((event: PointerEvent, emitImpulse: boolean) => {
    if (activePointerId.current !== null && activePointerId.current !== event.pointerId) return false;
    const hit = resolvePointerHit(event.clientX, event.clientY);
    if (!hit) {
      pointerInside.current = false;
      hasPointerHit.current = false;
      pointerVelocityTarget.current.multiplyScalar(0.25);
      if (!isDragging.current) interactionTarget.current = 0;
      return false;
    }

    pointerInside.current = true;
    interactionTarget.current = 1;
    const now = performance.now();
    if (!hasPointerHit.current) {
      pointerTarget.current.copy(pointerHit.current);
      lastPointerHit.current.copy(pointerHit.current);
      lastPointerTime.current = now;
      hasPointerHit.current = true;
      return true;
    }

    const elapsed = THREE.MathUtils.clamp((now - lastPointerTime.current) / 1000, 0.008, 0.12);
    pointerDelta.current.copy(pointerHit.current).sub(lastPointerHit.current);
    tangentDelta.current.copy(pointerDelta.current);
    tangentDelta.current.addScaledVector(pointerHit.current, -pointerHit.current.dot(pointerDelta.current));
    const angularDistance = tangentDelta.current.length();
    pointerVelocityTarget.current.copy(tangentDelta.current).multiplyScalar(1 / elapsed).clampLength(0, 2.2);
    if (emitImpulse && angularDistance > 0.001) {
      const speed = angularDistance / elapsed;
      if (angularDistance > 0.018 && now - lastRippleTime.current > 60) {
        addRipple(pointerHit.current, 0.035 + Math.min(0.11, angularDistance * 0.9), 0.72 + Math.min(0.52, speed * 0.08));
        lastRippleTime.current = now;
      }
    }
    pointerTarget.current.copy(pointerHit.current);
    lastPointerHit.current.copy(pointerHit.current);
    lastPointerTime.current = now;
    return true;
  }, [addRipple, resolvePointerHit]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerId.current !== null && activePointerId.current !== event.pointerId) return;
      updatePointer(event, true);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest("a, button, input, textarea, select, summary, details, [contenteditable='true']")) return;
      if (!updatePointer(event, false)) return;
      if (event.pointerType !== "touch") {
        event.preventDefault();
        userSelectBeforeDrag.current = document.body.style.userSelect;
        document.body.style.userSelect = "none";
        selectionLocked.current = true;
      }
      activePointerId.current = event.pointerId;
      isDragging.current = true;
      interactionTarget.current = 1;
      lastRippleTime.current = performance.now();
    };
    const releasePointer = (event?: PointerEvent) => {
      if (event && activePointerId.current !== null && activePointerId.current !== event.pointerId) return;
      isDragging.current = false;
      activePointerId.current = null;
      if (selectionLocked.current) {
        document.body.style.userSelect = userSelectBeforeDrag.current;
        selectionLocked.current = false;
      }
      if (!pointerInside.current) interactionTarget.current = 0;
    };
    const handlePointerLeave = () => {
      pointerInside.current = false;
      hasPointerHit.current = false;
      if (!isDragging.current) interactionTarget.current = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: false });
    window.addEventListener("pointerup", releasePointer, { passive: true });
    window.addEventListener("pointercancel", releasePointer, { passive: true });
    const handleWindowBlur = () => {
      releasePointer();
      pointerInside.current = false;
      hasPointerHit.current = false;
      interactionTarget.current = 0;
    };
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("pointerleave", handlePointerLeave);
      if (selectionLocked.current) document.body.style.userSelect = userSelectBeforeDrag.current;
      isDragging.current = false;
      activePointerId.current = null;
    };
  }, [addRipple, updatePointer]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: pointer.current },
      uPointerVelocity: { value: pointerVelocity.current },
      uInteraction: { value: 0 },
      uDrag: { value: 0 },
      uOpacity: { value: 1 },
      uRippleCenters: { value: rippleCenters },
      uRippleAges: { value: rippleAges },
      uRippleStrengths: { value: rippleStrengths },
      uRippleSpeeds: { value: rippleSpeeds },
    }),
    [rippleAges, rippleCenters, rippleSpeeds, rippleStrengths],
  );

  useFrame(({ clock }, rawDelta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;
    const delta = Math.min(rawDelta, 0.05);

    pointer.current.lerp(pointerTarget.current, 1 - Math.exp(-13 * delta));
    pointer.current.normalize();
    pointerVelocity.current.lerp(pointerVelocityTarget.current, 1 - Math.exp(-18 * delta));
    pointerVelocityTarget.current.multiplyScalar(Math.exp(-7.5 * delta));
    interaction.current = THREE.MathUtils.damp(interaction.current, interactionTarget.current, 8.5, delta);

    const rippleList = ripples.current;
    rippleList.forEach((ripple, index) => {
      if (ripple.age < 0) {
        rippleAges[index] = -1;
        rippleStrengths[index] = 0;
        return;
      }
      ripple.age += delta;
      ripple.strength *= Math.exp(-2.6 * delta);
      if (ripple.age > RIPPLE_LIFETIME || ripple.strength < 0.008) {
        ripple.age = -1;
        ripple.strength = 0;
      }
      rippleAges[index] = ripple.age;
      rippleStrengths[index] = ripple.strength;
      rippleSpeeds[index] = ripple.speed;
    });

    material.uniforms.uPointer.value.copy(pointer.current);
    material.uniforms.uPointerVelocity.value.copy(pointerVelocity.current);
    material.uniforms.uInteraction.value = interaction.current;
    material.uniforms.uDrag.value = isDragging.current ? 1 : 0;
    material.uniforms.uOpacity.value = sphereMotion.opacity * (reducedMotion ? 1 : Math.max(0, 1 - crossMotion.progress * 4));
    if (!reducedMotion) material.uniforms.uTime.value = clock.elapsedTime;

    const base = viewport.height * 0.48;
    const targetScale = base * sphereMotion.scale;
    const nextScale = THREE.MathUtils.damp(mesh.scale.x, targetScale, 7.5, delta);
    mesh.scale.setScalar(nextScale);
    mesh.position.x = THREE.MathUtils.damp(mesh.position.x, sphereMotion.x * viewport.width * 0.5, 7.5, delta);
    mesh.position.y = THREE.MathUtils.damp(mesh.position.y, sphereMotion.y * viewport.height * 0.5, 7.5, delta);
  });

  return (
    <mesh ref={meshRef} position={[1.8, 0, 0]}>
      <sphereGeometry args={[1, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function SphereFallback() {
  const assetUrl = (name: string) => (
    typeof document === "undefined" ? `./${name}` : new URL(name, document.baseURI).toString()
  );
  return (
    <picture className="sphere-fallback-wrap">
      <source media="(max-width: 820px)" srcSet={assetUrl("sphere-fallback-mobile.webp")} />
      <img className="sphere-fallback" src={assetUrl("sphere-fallback.webp")} alt="" aria-hidden="true" />
    </picture>
  );
}

class SphereErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void error;
    void info;
    this.props.onError();
  }

  render() {
    return this.state.hasError ? <SphereFallback /> : this.props.children;
  }
}

export default function LiquidSphere() {
  const [available] = useState(supportsWebGL2);
  const [failed, setFailed] = useState(false);

  if (!available || failed) return <SphereFallback />;

  return (
    <SphereErrorBoundary onError={() => setFailed(true)}>
      <div className="sphere-canvas" aria-hidden="true" data-testid="sphere-canvas">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 20 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl: renderer }) => {
            renderer.setClearColor(0x000000, 0);
            renderer.domElement.addEventListener("webglcontextlost", () => setFailed(true), { once: true });
          }}
        >
          <SphereMesh />
        </Canvas>
      </div>
    </SphereErrorBoundary>
  );
}
