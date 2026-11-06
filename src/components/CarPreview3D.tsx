import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { CarId } from '../data/gameContent';
import { buildCarModel3D, createCarEnvironmentTexture } from '../utils/carModel3d';

interface CarPreview3DProps {
  carId: CarId;
  heightClass?: string;
}

export function CarPreview3D({ carId, heightClass = 'h-48' }: CarPreview3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 190;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 1, 500);
    camera.position.set(-58, 28, 56);
    camera.lookAt(0, 9, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const envMap = createCarEnvironmentTexture(renderer);
    scene.environment = envMap;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x27272a, 1.1);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff4e0, 1.5);
    dirLight.position.set(50, 90, 60);
    scene.add(dirLight);

    // Subtle showroom turntable disc
    const discGeo = new THREE.CylinderGeometry(34, 35, 1.2, 40);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.4,
      metalness: 0.3,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = -0.6;
    scene.add(disc);

    const car = buildCarModel3D(carId);
    scene.add(car.root);

    let frameId: number;
    const animate = (now: number) => {
      const rot = now * 0.00075;
      car.root.rotation.y = rot;
      disc.rotation.y = rot;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      envMap.dispose();
      renderer.dispose();
    };
  }, [carId]);

  return <div ref={containerRef} className={`w-full ${heightClass} overflow-hidden rounded-xl`} />;
}
