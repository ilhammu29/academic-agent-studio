"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Hero3DOrbProps {
  className?: string;
  mouseParallax?: { x: number; y: number };
}

export const Hero3DOrb: React.FC<Hero3DOrbProps> = ({ 
  className = "",
  mouseParallax = { x: 0, y: 0 } 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const manualRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability safely
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    // Scene, Camera, Renderer
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.8;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
    } catch {
      setWebGLSupported(false);
      return;
    }

    // Orb Main Pivot Group
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // =========================================================================
    // 1. INNER SWIRLING 3D HOLOGRAPHIC RIBBON (Torus Knot Core)
    // =========================================================================
    // Custom Shader for the inner fluid iridescent ribbon
    const ribbonVertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      uniform float uTime;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        // Slight organic wave breathing
        vec3 pos = position;
        float wave = sin(pos.x * 2.5 + uTime * 1.5) * cos(pos.y * 2.5 + uTime * 1.2) * 0.05;
        pos += normal * wave;

        vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const ribbonFragmentShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      uniform float uTime;

      // Color Palette Function
      vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
        return a + b * cos( 6.28318 * ( c * t + d ) );
      }

      void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(-vPosition);
        
        // Surface angle & Fresnel
        float fresnel = pow(1.0 - max(dot(V, N), 0.0), 2.2);

        // Fluid color wave based on uv and time
        float wave = sin(vUv.x * 8.0 + uTime * 0.8) * 0.5 + 0.5;
        float wave2 = cos(vUv.y * 6.0 - uTime * 0.6) * 0.5 + 0.5;
        float t = (wave + wave2 * 0.5 + fresnel * 0.6);

        // Iridescent Vibrant Academic Spectrum (Blue, Indigo, Violet, Cyan, Soft Pink)
        vec3 a = vec3(0.55, 0.52, 0.85);
        vec3 b = vec3(0.45, 0.48, 0.55);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.62, 0.38, 0.88);
        vec3 ribbonColor = palette(t, a, b, c, d);

        // Specular sheen on ribbon
        vec3 lightDir = normalize(vec3(1.0, 1.4, 1.2));
        vec3 H = normalize(lightDir + V);
        float spec = pow(max(dot(N, H), 0.0), 32.0);

        vec3 finalColor = ribbonColor + vec3(spec * 0.65);
        gl_FragColor = vec4(finalColor, 0.95);
      }
    `;

    const ribbonGeo = new THREE.TorusKnotGeometry(0.76, 0.23, 160, 36, 2, 3);
    const ribbonMat = new THREE.ShaderMaterial({
      vertexShader: ribbonVertexShader,
      fragmentShader: ribbonFragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: true,
    });
    const innerRibbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    orbGroup.add(innerRibbon);

    // =========================================================================
    // 2. INNER FLOATING NEBULA PARTICLES (Stardust inside sphere)
    // =========================================================================
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Distribute particles inside sphere radius ~ 1.05
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 0.95;

      const sinPhi = Math.sin(phi);
      particlePos[i * 3] = r * sinPhi * Math.cos(theta);
      particlePos[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      particlePos[i * 3 + 2] = r * Math.cos(phi);

      // Color variation: blues, cyans, magentas
      const cChoice = Math.random();
      if (cChoice < 0.4) {
        // Cyan / Light Blue
        particleColors[i * 3] = 0.38;
        particleColors[i * 3 + 1] = 0.74;
        particleColors[i * 3 + 2] = 0.98;
      } else if (cChoice < 0.75) {
        // Purple / Indigo
        particleColors[i * 3] = 0.65;
        particleColors[i * 3 + 1] = 0.45;
        particleColors[i * 3 + 2] = 0.98;
      } else {
        // Soft White Pink
        particleColors[i * 3] = 0.95;
        particleColors[i * 3 + 1] = 0.85;
        particleColors[i * 3 + 2] = 1.0;
      }
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    orbGroup.add(particles);

    // =========================================================================
    // 3. OUTER REFRACTIVE GLASS SPHERE SHELL (Crystal Holographic Surface)
    // =========================================================================
    const glassVertexShader = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const glassFragmentShader = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;
      uniform float uTime;

      void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vViewPosition);

        // Fresnel reflection at boundary
        float nDotV = max(dot(N, V), 0.0);
        float fresnel = pow(1.0 - nDotV, 2.8);
        float rimGlow = pow(1.0 - nDotV, 5.0);

        // Key light 1: Upper-left crisp white/cyan highlight
        vec3 light1 = normalize(vec3(-1.2, 1.6, 1.8));
        vec3 H1 = normalize(light1 + V);
        float spec1 = pow(max(dot(N, H1), 0.0), 64.0);
        float spec1Broad = pow(max(dot(N, H1), 0.0), 12.0) * 0.15;

        // Key light 2: Lower-right soft violet reflection
        vec3 light2 = normalize(vec3(1.3, -1.0, 1.2));
        vec3 H2 = normalize(light2 + V);
        float spec2 = pow(max(dot(N, H2), 0.0), 36.0);

        // Chromatic dispersion tint on edges
        vec3 rimColor = mix(
          vec3(0.38, 0.65, 1.0), // sky blue
          vec3(0.85, 0.45, 0.98), // vivid purple
          sin(uTime * 0.5 + N.y * 3.0) * 0.5 + 0.5
        );

        // Glass transparency base with soft sky tone
        vec3 glassBase = vec3(0.92, 0.95, 1.0) * 0.08;
        vec3 finalColor = glassBase 
          + rimColor * (fresnel * 0.75 + rimGlow * 0.8)
          + vec3(1.0, 1.0, 1.0) * (spec1 * 1.2 + spec1Broad)
          + vec3(0.82, 0.65, 1.0) * (spec2 * 0.45);

        // Alpha transparency: mostly clear in center, opaque at grazing rim
        float alpha = clamp(0.12 + fresnel * 0.65 + spec1 * 0.9, 0.0, 0.92);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const glassGeo = new THREE.SphereGeometry(1.26, 64, 64);
    const glassMat = new THREE.ShaderMaterial({
      vertexShader: glassVertexShader,
      fragmentShader: glassFragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      side: THREE.FrontSide
    });
    const glassSphere = new THREE.Mesh(glassGeo, glassMat);
    orbGroup.add(glassSphere);

    // =========================================================================
    // 4. ANIMATION LOOP & ROTATION PHYSICS
    // =========================================================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update shader uniforms
      ribbonMat.uniforms.uTime.value = elapsedTime;
      glassMat.uniforms.uTime.value = elapsedTime;

      // Independent multi-axis rotation of inner ribbons for dynamic depth
      innerRibbon.rotation.x = elapsedTime * 0.45 + manualRotationRef.current.x * 0.5;
      innerRibbon.rotation.y = elapsedTime * 0.65 + manualRotationRef.current.y * 0.5;
      innerRibbon.rotation.z = Math.sin(elapsedTime * 0.3) * 0.25;

      // Particles orbit slowly
      particles.rotation.y = elapsedTime * 0.15;
      particles.rotation.x = Math.cos(elapsedTime * 0.12) * 0.1;

      // Glass sphere rotates slowly with manual drag inertia
      if (!isDraggingRef.current) {
        // Damping velocity
        velocityRef.current.x *= 0.92;
        velocityRef.current.y *= 0.92;
        manualRotationRef.current.x += velocityRef.current.x;
        manualRotationRef.current.y += velocityRef.current.y;
      }

      // Base auto rotation + manual rotation
      const baseAutoY = elapsedTime * 0.25;
      const baseAutoX = Math.sin(elapsedTime * 0.3) * 0.1;

      // Smooth Parallax tilt from mouse movement across the hero section
      const targetParallaxX = (mouseParallax.y || 0) * 0.35;
      const targetParallaxY = (mouseParallax.x || 0) * 0.45;

      orbGroup.rotation.x = THREE.MathUtils.lerp(
        orbGroup.rotation.x,
        baseAutoX + manualRotationRef.current.x + targetParallaxX,
        0.08
      );
      orbGroup.rotation.y = THREE.MathUtils.lerp(
        orbGroup.rotation.y,
        baseAutoY + manualRotationRef.current.y + targetParallaxY,
        0.08
      );

      // Subtle breathing float scale
      const breathScale = 1.0 + Math.sin(elapsedTime * 1.5) * 0.02;
      orbGroup.scale.set(breathScale, breathScale, breathScale);

      renderer.render(scene, camera);
    };

    animate();

    // =========================================================================
    // 5. INTERACTIVE MOUSE / TOUCH DRAG EVENT LISTENERS
    // =========================================================================
    const handlePointerDown = (clientX: number, clientY: number) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: clientX, y: clientY };
      velocityRef.current = { x: 0, y: 0 };
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      const deltaX = clientX - prevMousePosRef.current.x;
      const deltaY = clientY - prevMousePosRef.current.y;

      const rotSpeed = 0.006;
      const vx = deltaY * rotSpeed;
      const vy = deltaX * rotSpeed;

      manualRotationRef.current.x += vx;
      manualRotationRef.current.y += vy;

      velocityRef.current = { x: vx, y: vy };
      prevMousePosRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    // DOM events on container
    const onMouseDown = (e: MouseEvent) => {
      handlePointerDown(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      handlePointerUp();
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      handlePointerUp();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    domEl.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // =========================================================================
    // 6. RESIZE HANDLER
    // =========================================================================
    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth || 320;
      const newH = container.clientHeight || 320;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      domEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      domEl.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }

      // Dispose Three.js objects to avoid memory leaks
      ribbonGeo.dispose();
      ribbonMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      glassGeo.dispose();
      glassMat.dispose();
      renderer.dispose();
    };
  }, [mouseParallax.x, mouseParallax.y]);

  return (
    <div 
      className={`relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{ touchAction: "none" }}
    >
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full flex items-center justify-center"
        title="Interactive 3D Glass Hologram Orb — Click & Drag to Rotate"
      />

      {/* Fallback image if WebGL is disabled */}
      {!webGLSupported && (
        <img 
          src="/hero-orb.png" 
          alt="Academic Agent Studio Glass Holographic Orb" 
          className="w-full h-full object-contain drop-shadow-2xl select-none pointer-events-none"
        />
      )}
    </div>
  );
};
