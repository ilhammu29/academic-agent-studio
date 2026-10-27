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
  const isHoveredRef = useRef<boolean>(false);

  // Use ref for mouse parallax so Three.js scene NEVER re-initializes or glitches on mouse move
  const mouseParallaxRef = useRef<{ x: number; y: number }>(mouseParallax);
  useEffect(() => {
    mouseParallaxRef.current = mouseParallax;
  }, [mouseParallax.x, mouseParallax.y]);

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

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 4.2;

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
      renderer.toneMappingExposure = 1.05;
      container.appendChild(renderer.domElement);
    } catch {
      setWebGLSupported(false);
      return;
    }

    const orbPivot = new THREE.Group();
    scene.add(orbPivot);

    // =========================================================================
    // TEXTURE LOADER FOR THE EXACT REFERENCE GLASS ORB & SPIRAL NORMAL MAP
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    
    // Master high-definition clean orb texture from the reference image
    const orbTexture = textureLoader.load("/hero-orb-final-3d.png");
    orbTexture.generateMipmaps = true;
    orbTexture.minFilter = THREE.LinearMipmapLinearFilter;
    orbTexture.magFilter = THREE.LinearFilter;

    // High-resolution computed 3D Normal map with spiral ridge vectors
    const normalTexture = textureLoader.load("/hero-orb-normal.png");
    normalTexture.generateMipmaps = true;
    normalTexture.minFilter = THREE.LinearMipmapLinearFilter;
    normalTexture.magFilter = THREE.LinearFilter;

    // =========================================================================
    // 1. DYNAMIC 3D VOLUMETRIC GLASS ORB SHADER (100% IDENTICAL REFERENCE)
    // =========================================================================
    const orbVertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      uniform float uTime;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);

        vec3 pos = position;
        // Subtle organic levitation breathing on 3D vertices
        float wave = sin(uTime * 1.6) * 0.015;
        pos += normal * wave;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        vViewPosition = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `;

    const orbFragmentShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      uniform sampler2D uTexture;
      uniform sampler2D uNormalMap;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uHover;

      void main() {
        // Internal fluid caustics wave distortion inside the glass
        vec2 fluidDistortion = vec2(
          sin(vUv.y * 7.0 + uTime * 1.1) * 0.008,
          cos(vUv.x * 6.0 - uTime * 0.9) * 0.008
        );

        // Sample authentic base texture with fluid distortion
        vec4 baseTex = texture2D(uTexture, vUv + fluidDistortion);
        if (baseTex.a < 0.03) discard;

        // Sample computed spiral ridge normal map
        vec4 normSample = texture2D(uNormalMap, vUv);
        vec3 surfaceNormal = normalize(normSample.rgb * 2.0 - 1.0);

        // Combine mesh geometric normal with spiral petal normal map
        vec3 N = normalize(mix(vNormal, surfaceNormal, 0.72));
        vec3 V = normalize(vViewPosition);

        // 3D Directional Key Light responding dynamically to mouse position
        vec3 keyLight = normalize(vec3(-0.9 + uMouse.x * 0.75, 1.3 - uMouse.y * 0.65, 1.4));
        vec3 H1 = normalize(keyLight + V);
        float spec1 = pow(max(dot(N, H1), 0.0), 38.0);
        float specBroad = pow(max(dot(N, H1), 0.0), 10.0) * 0.15;

        // Fill Light: Soft violet glow from bottom-right
        vec3 fillLight = normalize(vec3(1.2, -1.0, 1.1));
        vec3 H2 = normalize(fillLight + V);
        float spec2 = pow(max(dot(N, H2), 0.0), 24.0);

        // Fresnel edge curvature
        float nDotV = max(dot(N, V), 0.0);
        float fresnel = pow(1.0 - nDotV, 2.6);

        // Color composition preserving the authentic reference visual
        vec3 color = baseTex.rgb;

        // Dynamic 3D lighting glints moving across spiral glass ridges
        color += vec3(1.0, 1.0, 1.0) * (spec1 * 0.55 + specBroad);
        color += vec3(0.75, 0.45, 1.0) * (spec2 * 0.35);

        // Soft iridescent rim reflection
        vec3 rimTint = mix(vec3(0.4, 0.75, 1.0), vec3(0.85, 0.45, 0.98), sin(uTime * 0.8 + N.y * 2.5) * 0.5 + 0.5);
        color += rimTint * (fresnel * 0.28);

        // Hover brightness boost
        color += vec3(0.04, 0.06, 0.1) * uHover;

        gl_FragColor = vec4(color, baseTex.a);
      }
    `;

    // 3D Sphere Geometry mapped with high-precision UVs
    const orbGeo = new THREE.SphereGeometry(1.28, 96, 96);
    const orbShaderMat = new THREE.ShaderMaterial({
      vertexShader: orbVertexShader,
      fragmentShader: orbFragmentShader,
      uniforms: {
        uTexture: { value: orbTexture },
        uNormalMap: { value: normalTexture },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uHover: { value: 0 }
      },
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    const orbMesh = new THREE.Mesh(orbGeo, orbShaderMat);
    orbPivot.add(orbMesh);

    // =========================================================================
    // 2. INNER REFRACTIVE BACKDROP WITH CHROMATIC SWIRL
    // =========================================================================
    // An inner slightly offset sphere layer creates internal parallax depth
    const innerGeo = new THREE.SphereGeometry(1.22, 64, 64);
    const innerMat = new THREE.MeshBasicMaterial({
      map: orbTexture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.scale.set(0.96, 0.96, 0.96);
    orbPivot.add(innerMesh);

    // =========================================================================
    // 3. ANIMATION LOOP & PHYSICS
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update uniforms
      orbShaderMat.uniforms.uTime.value = elapsedTime;
      orbShaderMat.uniforms.uMouse.value.set(
        mouseParallaxRef.current.x || 0,
        mouseParallaxRef.current.y || 0
      );

      // Smooth hover interpolation
      const targetHover = isHoveredRef.current ? 1.0 : 0.0;
      orbShaderMat.uniforms.uHover.value = THREE.MathUtils.lerp(
        orbShaderMat.uniforms.uHover.value,
        targetHover,
        0.1
      );

      // Drag inertia physics damping
      if (!isDraggingRef.current) {
        velocityRef.current.x *= 0.94;
        velocityRef.current.y *= 0.94;
        manualRotationRef.current.x += velocityRef.current.x;
        manualRotationRef.current.y += velocityRef.current.y;
      }

      // Smooth continuous multi-axis 3D rotation & floating tilt
      const autoRotateY = elapsedTime * 0.45; // Visible 360-degree continuous revolution
      const autoRotateX = Math.sin(elapsedTime * 0.35) * 0.14;
      const autoRollZ = Math.cos(elapsedTime * 0.25) * 0.08;

      const targetParallaxX = (mouseParallaxRef.current.y || 0) * 0.32;
      const targetParallaxY = (mouseParallaxRef.current.x || 0) * 0.42;

      orbPivot.rotation.x = THREE.MathUtils.lerp(
        orbPivot.rotation.x,
        autoRotateX + manualRotationRef.current.x + targetParallaxX,
        0.08
      );
      orbPivot.rotation.y = THREE.MathUtils.lerp(
        orbPivot.rotation.y,
        autoRotateY + manualRotationRef.current.y + targetParallaxY,
        0.08
      );
      orbPivot.rotation.z = THREE.MathUtils.lerp(
        orbPivot.rotation.z,
        autoRollZ + manualRotationRef.current.y * 0.2,
        0.08
      );

      // Internal layer counter-rotation for rich optical depth
      innerMesh.rotation.y = -elapsedTime * 0.15;
      innerMesh.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;

      // Gentle floating levitation scale
      const floatScale = 1.0 + Math.sin(elapsedTime * 1.5) * 0.025;
      orbPivot.scale.set(floatScale, floatScale, floatScale);

      renderer.render(scene, camera);
    };

    animate();

    // =========================================================================
    // 4. INTERACTIVE MOUSE / TOUCH DRAG ROTATION
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

      const rotSpeed = 0.007;
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
    // 5. RESIZE HANDLER
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

      orbGeo.dispose();
      orbShaderMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      orbTexture.dispose();
      normalTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      className={`relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{ touchAction: "none" }}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
    >
      <div 
        ref={mountRef} 
        className="w-full h-full flex items-center justify-center"
        title="Interactive 3D Glass Hologram Orb — Click & Drag to Rotate"
      />

      {!webGLSupported && (
        <img 
          src="/hero-orb-final-3d.png" 
          alt="Academic Agent Studio Glass Holographic Orb" 
          className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl select-none pointer-events-none rounded-full"
        />
      )}
    </div>
  );
};
