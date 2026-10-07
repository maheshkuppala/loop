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

    let width = container.clientWidth || 450;
    let height = container.clientHeight || 450;

    // Check WebGL availability
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
    camera.position.set(0, 0, 8);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x10b981, 3.5, 20);
    pointLight1.position.set(4, 5, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0d9488, 2.8, 20);
    pointLight2.position.set(-4, -4, 3);
    scene.add(pointLight2);

    // Master Loop Group
    const loopGroup = new THREE.Group();
    scene.add(loopGroup);

    // 1. Main Torus (The Looop Ring)
    const torusGeometry = new THREE.TorusGeometry(2.4, 0.28, 32, 100);
    const torusMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      transmission: 0.2,
      opacity: 0.95,
      transparent: true
    });
    const mainTorus = new THREE.Mesh(torusGeometry, torusMaterial);
    loopGroup.add(mainTorus);

    // 2. Secondary Interlocking Accent Ring
    const innerTorusGeometry = new THREE.TorusGeometry(1.8, 0.12, 24, 80);
    const innerTorusMaterial = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      roughness: 0.3,
      metalness: 0.4,
      wireframe: true
    });
    const innerTorus = new THREE.Mesh(innerTorusGeometry, innerTorusMaterial);
    innerTorus.rotation.x = Math.PI / 3;
    innerTorus.rotation.y = Math.PI / 4;
    loopGroup.add(innerTorus);

    // 3. Floating Orb Nodes (Representing Items Circulating in the Loop)
    const nodeCount = 5;
    const nodeMeshes = [];
    const nodeColors = [0x10b981, 0x14b8a6, 0x059669, 0x3b82f6, 0xf59e0b];

    for (let i = 0; i < nodeCount; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.18, 24, 24);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColors[i],
        roughness: 0.1,
        metalness: 0.3,
        emissive: nodeColors[i],
        emissiveIntensity: 0.4
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMeshes.push(nodeMesh);
      loopGroup.add(nodeMesh);
    }

    // 4. Subtle Ambient Flow Particles
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.4 + (Math.random() - 0.5) * 0.8;
      particlePositions[i] = Math.cos(angle) * radius;
      particlePositions[i + 1] = Math.sin(angle) * radius;
      particlePositions[i + 2] = (Math.random() - 0.5) * 0.8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: 0.06,
      transparent: true,
      opacity: 0.8
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    loopGroup.add(particleSystem);

    // Subtle Mouse Tracking
    let targetRotationX = 0.35;
    let targetRotationY = 0.4;
    let isMouseOver = false;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.6;
      targetRotationX = y * 0.5 + 0.3;
      isMouseOver = true;
    };

    const handleMouseLeave = () => {
      isMouseOver = false;
      targetRotationX = 0.35;
      targetRotationY = 0.4;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();
    let isVisible = true;

    // IntersectionObserver to stop rendering when scrolled out of view
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth dampening towards target rotation
      loopGroup.rotation.x += (targetRotationX - loopGroup.rotation.x) * 0.05;
      loopGroup.rotation.y += (targetRotationY - loopGroup.rotation.y) * 0.05;

      // Constant ambient rotation of loop
      mainTorus.rotation.z = elapsedTime * 0.25;
      innerTorus.rotation.z = -elapsedTime * 0.35;
      particleSystem.rotation.z = elapsedTime * 0.15;

      // Move circulating item nodes along the circular path
      nodeMeshes.forEach((mesh, index) => {
        const offset = (index / nodeCount) * Math.PI * 2;
        const currentAngle = elapsedTime * 0.4 + offset;
        const r = 2.4;
        mesh.position.x = Math.cos(currentAngle) * r;
        mesh.position.y = Math.sin(currentAngle) * r;
        mesh.position.z = Math.sin(currentAngle * 2) * 0.35; // gentle vertical wave
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
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
      container.removeEventListener('mouseleave', handleMouseLeave);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    // Graceful CSS Fallback for systems without WebGL or reduced-motion
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '380px',
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
          <div
            style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 15px #10b981',
              top: '10px'
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
        minHeight: '380px',
        maxHeight: '520px',
        position: 'relative',
        cursor: 'grab'
      }}
      aria-label="3D Interactive Circular Reuse Loop"
    />
  );
};

export default LooopHeroCanvas;
