import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const LooopHeroCanvas = () => {
  const mountRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    // Respect reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setWebglSupported(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 520;
    let height = container.clientHeight || 520;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      setWebglSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x10b981, 4.5, 25);
    pointLight1.position.set(5, 6, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0d9488, 3.5, 25);
    pointLight2.position.set(-5, -5, 4);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x34d399, 2.5, 20);
    pointLight3.position.set(0, 0, 6);
    scene.add(pointLight3);

    // Master Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // =========================================================================
    // 1. MAIN INTERLOCKING LOOOP TORUS RINGS
    // =========================================================================
    const torusGroup = new THREE.Group();
    masterGroup.add(torusGroup);

    // Outer Main Ring
    const mainTorusGeo = new THREE.TorusGeometry(2.3, 0.26, 32, 100);
    const mainTorusMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      transmission: 0.35,
      opacity: 0.95,
      transparent: true
    });
    const mainTorus = new THREE.Mesh(mainTorusGeo, mainTorusMat);
    torusGroup.add(mainTorus);

    // Interlocking Inner Ring
    const innerTorusGeo = new THREE.TorusGeometry(1.65, 0.14, 24, 80);
    const innerTorusMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      roughness: 0.3,
      metalness: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    const innerTorus = new THREE.Mesh(innerTorusGeo, innerTorusMat);
    innerTorus.rotation.x = Math.PI / 3;
    innerTorus.rotation.y = Math.PI / 4;
    torusGroup.add(innerTorus);

    // Glowing Central Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xa7f3d0,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    torusGroup.add(coreMesh);

    // =========================================================================
    // 2. FLOATING 3D PRODUCT REPRESENTATIONS SYSTEM (6 ORGANIC OBJECTS)
    // =========================================================================
    const floatingObjects = [];

    // Helper to create floating container
    const createFloatingObject = (mesh, initialPos, rotSpeed, floatSpeed, phaseOffset) => {
      const pivot = new THREE.Group();
      pivot.position.set(...initialPos);
      pivot.add(mesh);
      masterGroup.add(pivot);
      floatingObjects.push({
        pivot,
        mesh,
        rotSpeed,
        floatSpeed,
        phaseOffset,
        basePos: [...initialPos]
      });
    };

    // Object 1: 3D Textbook / Book (Top-Left)
    const bookGroup = new THREE.Group();
    const coverGeo = new THREE.BoxGeometry(0.7, 0.9, 0.14);
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3 });
    const coverMesh = new THREE.Mesh(coverGeo, coverMat);
    bookGroup.add(coverMesh);
    const pagesGeo = new THREE.BoxGeometry(0.66, 0.86, 0.12);
    const pagesMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
    const pagesMesh = new THREE.Mesh(pagesGeo, pagesMat);
    pagesMesh.position.x = 0.02;
    bookGroup.add(pagesMesh);
    createFloatingObject(bookGroup, [-3.2, 2.2, 0.8], { x: 0.008, y: 0.012, z: 0.005 }, 1.2, 0);

    // Object 2: 3D Shirt / Apparel Token (Top-Right)
    const shirtGroup = new THREE.Group();
    const shirtBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.45, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, metalness: 0.1 })
    );
    shirtGroup.add(shirtBody);
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.05, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0x93c5fd })
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.3;
    shirtGroup.add(collar);
    createFloatingObject(shirtGroup, [3.2, 2.0, 0.5], { x: 0.01, y: 0.015, z: 0.008 }, 1.4, 1.2);

    // Object 3: 3D Calculator (Mid-Left)
    const calcGroup = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.8, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.4 })
    );
    calcGroup.add(body);
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.2, 0.13),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.5 })
    );
    screen.position.set(0, 0.22, 0.01);
    calcGroup.add(screen);
    createFloatingObject(calcGroup, [-3.6, -0.6, 1.2], { x: 0.015, y: 0.008, z: 0.01 }, 1.1, 2.4);

    // Object 4: 3D Headphones (Mid-Right)
    const phoneGroup = new THREE.Group();
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.05, 12, 30, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.5 })
    );
    phoneGroup.add(band);
    const cupLeft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    cupLeft.position.set(-0.42, 0, 0);
    cupLeft.rotation.z = Math.PI / 2;
    phoneGroup.add(cupLeft);
    const cupRight = cupLeft.clone();
    cupRight.position.set(0.42, 0, 0);
    phoneGroup.add(cupRight);
    createFloatingObject(phoneGroup, [3.5, -0.5, 0.9], { x: 0.012, y: 0.018, z: 0.006 }, 1.3, 3.6);

    // Object 5: 3D Plant Pot / Green Living (Bottom-Left)
    const plantGroup = new THREE.Group();
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.25, 0.45, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
    );
    plantGroup.add(pot);
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 })
    );
    leaf.position.y = 0.4;
    plantGroup.add(leaf);
    createFloatingObject(plantGroup, [-2.6, -2.4, 0.6], { x: 0.006, y: 0.012, z: 0.01 }, 0.9, 4.8);

    // Object 6: 3D Wrench / Tool (Bottom-Right)
    const toolGroup = new THREE.Group();
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.7, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 })
    );
    toolGroup.add(handle);
    const head = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.06, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 })
    );
    head.position.y = 0.35;
    toolGroup.add(head);
    createFloatingObject(toolGroup, [2.8, -2.3, 0.7], { x: 0.018, y: 0.01, z: 0.014 }, 1.5, 5.5);

    // =========================================================================
    // 3. AMBIENT PARTICLES
    // =========================================================================
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.4 + (Math.random() - 0.5) * 1.2;
      particlePos[i] = Math.cos(angle) * radius;
      particlePos[i + 1] = Math.sin(angle) * radius;
      particlePos[i + 2] = (Math.random() - 0.5) * 1.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: 0.06,
      transparent: true,
      opacity: 0.85
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particleSystem);

    // =========================================================================
    // 4. MOUSE PARALLAX & ANIMATION LOOP
    // =========================================================================
    let targetRotX = 0.25;
    let targetRotY = 0.35;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.5;
      targetRotX = y * 0.4 + 0.25;
    };

    container.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    let clock = new THREE.Clock();
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      // Smooth mouse rotation dampening
      masterGroup.rotation.x += (targetRotX - masterGroup.rotation.x) * 0.05;
      masterGroup.rotation.y += (targetRotY - masterGroup.rotation.y) * 0.05;

      // Central Torus continuous rotation
      mainTorus.rotation.z = elapsed * 0.25;
      innerTorus.rotation.z = -elapsed * 0.35;
      particleSystem.rotation.z = elapsed * 0.12;

      // Organic floating & rotation for each 3D product object
      floatingObjects.forEach((obj) => {
        const { pivot, mesh, rotSpeed, floatSpeed, phaseOffset, basePos } = obj;

        // Rotation
        mesh.rotation.x += rotSpeed.x;
        mesh.rotation.y += rotSpeed.y;
        mesh.rotation.z += rotSpeed.z;

        // X/Y/Z Floating sine wave movement
        const floatY = Math.sin(elapsed * floatSpeed + phaseOffset) * 0.25;
        const floatX = Math.cos(elapsed * floatSpeed * 0.7 + phaseOffset) * 0.12;
        const floatZ = Math.sin(elapsed * floatSpeed * 0.5 + phaseOffset) * 0.15;

        pivot.position.set(
          basePos[0] + floatX,
          basePos[1] + floatY,
          basePos[2] + floatZ
        );
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            border: '18px solid var(--color-primary-500)',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '190px',
              height: '190px',
              borderRadius: '50%',
              border: '10px dashed var(--color-accent-500)',
              animation: 'spin 20s linear infinite'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '420px',
        maxHeight: '560px',
        position: 'relative',
        cursor: 'grab'
      }}
      aria-label="3D Interactive Circular Reuse Loop with Floating Product Objects"
    />
  );
};

export default LooopHeroCanvas;
