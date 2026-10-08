import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Gift, Search, MessageSquare, RefreshCw } from 'lucide-react';

const STEPS = [
  { id: 'share', label: 'SHARE', icon: Gift, color: '#10b981', desc: 'Give away, lend or swap your unused item' },
  { id: 'discover', label: 'DISCOVER', icon: Search, color: '#0d9488', desc: 'Find nearby useful items listed by trust score' },
  { id: 'connect', label: 'CONNECT', icon: MessageSquare, color: '#0284c7', desc: 'Chat P2P & arrange secure handover code' },
  { id: 'reuse', label: 'REUSE', labelSuffix: '→ SHARE AGAIN', icon: RefreshCw, color: '#f59e0b', desc: 'Keep products circulating in active community use' }
];

export const LoopOrbit = ({ className = '', style = {} }) => {
  const mountRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setWebglSupported(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 480;
    let height = container.clientHeight || 420;

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
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x10b981, 4, 15);
    pointLight.position.set(3, 4, 3);
    scene.add(pointLight);

    // Master Group
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.x = 0.55; // 3D tilt perspective
    scene.add(orbitGroup);

    // 1. Primary Orbit Ring
    const radius = 2.5;
    const ringGeo = new THREE.TorusGeometry(radius, 0.04, 24, 100);
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
      clearcoat: 1
    });
    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitGroup.add(orbitRing);

    // 2. Outer Dashed/Glow Ring
    const outerRingGeo = new THREE.TorusGeometry(radius + 0.35, 0.015, 16, 80);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    orbitGroup.add(outerRing);

    // 3. Four Node Orbs (representing 4 steps)
    const nodeMeshes = [];
    const nodeColors = [0x10b981, 0x0d9488, 0x0284c7, 0xf59e0b];

    STEPS.forEach((step, i) => {
      const nodeGeo = new THREE.SphereGeometry(0.24, 24, 24);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColors[i],
        emissive: nodeColors[i],
        emissiveIntensity: 0.6,
        roughness: 0.2
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMeshes.push(nodeMesh);
      orbitGroup.add(nodeMesh);
    });

    // 4. Orbiting Glowing Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = (i / 3 / particleCount) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 0.4;
      particlePos[i] = Math.cos(angle) * r;
      particlePos[i + 1] = Math.sin(angle) * r;
      particlePos[i + 2] = (Math.random() - 0.5) * 0.3;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: 0.07,
      transparent: true,
      opacity: 0.75
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    orbitGroup.add(particleSystem);

    // Mouse Interaction
    let targetRotY = 0;
    let targetRotX = 0.55;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.4;
      targetRotX = y * 0.3 + 0.55;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
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

      // Rotation dampening
      orbitGroup.rotation.y += (targetRotY - orbitGroup.rotation.y) * 0.05;
      orbitGroup.rotation.x += (targetRotX - orbitGroup.rotation.x) * 0.05;

      // Orbit rotation
      orbitRing.rotation.z = elapsed * 0.2;
      outerRing.rotation.z = -elapsed * 0.25;
      particleSystem.rotation.z = elapsed * 0.15;

      // Position node spheres along radius
      nodeMeshes.forEach((mesh, index) => {
        const baseAngle = (index / STEPS.length) * Math.PI * 2;
        const currentAngle = baseAngle + elapsed * 0.25;
        mesh.position.x = Math.cos(currentAngle) * radius;
        mesh.position.y = Math.sin(currentAngle) * radius;
        mesh.position.z = Math.sin(currentAngle * 2) * 0.2;

        // Scale up slightly if active step
        const isCurrent = index === activeStep;
        const targetScale = isCurrent ? 1.4 : 1.0;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Auto-cycle active step every 3.5s
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 3500);

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
      clearInterval(stepInterval);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeStep]);

  return (
    <div
      className={`loop-orbit-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {/* WebGL Canvas */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '320px',
          position: 'relative',
          cursor: 'pointer'
        }}
      />

      {/* Interactive Step Buttons Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
          zIndex: 5,
          marginTop: '-20px'
        }}
      >
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeStep;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full, 9999px)',
                backgroundColor: isActive ? step.color : 'rgba(255, 255, 255, 0.85)',
                color: isActive ? '#ffffff' : 'var(--color-slate-800, #1e293b)',
                border: isActive ? `1px solid ${step.color}` : '1px solid rgba(16, 185, 129, 0.25)',
                boxShadow: isActive ? `0 8px 20px -4px ${step.color}66` : '0 4px 12px rgba(0,0,0,0.05)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Icon size={16} />
              <span>0{idx + 1} {step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Highlight Card */}
      <div
        style={{
          marginTop: '1.25rem',
          textAlign: 'center',
          maxWidth: '440px',
          padding: '12px 20px',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.12)'
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: STEPS[activeStep].color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Step 0{activeStep + 1} of 04 · {STEPS[activeStep].label} {STEPS[activeStep].labelSuffix || ''}
        </span>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--color-slate-700, #334155)', fontWeight: 500 }}>
          {STEPS[activeStep].desc}
        </p>
      </div>
    </div>
  );
};

export default LoopOrbit;
