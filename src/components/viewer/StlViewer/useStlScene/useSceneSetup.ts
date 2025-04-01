// src/components/viewer/StlViewer/useStlScene/useSceneSetup.ts
import { useCallback, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { setupLighting, createBuildPlate, createSkybox } from "../sceneSetup";

/**
 * Hook for setting up and managing the Three.js scene, camera, and renderer
 */
export function useSceneSetup(containerRef: React.RefObject<HTMLDivElement>) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lightsRef = useRef<THREE.Light[]>([]);
  const buildPlateRef = useRef<THREE.Mesh | null>(null);

  // Set up the Three.js scene
  const setupScene = useCallback(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create skybox/background
    createSkybox(scene);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50, // Narrower FOV for more cinematic look
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 5, 10);

    // Create renderer with shadows enabled
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: "highp",
    });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Enable shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add output tone mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    containerRef.current.appendChild(renderer.domElement);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.7;
    controls.minDistance = 2;
    controls.maxDistance = 50;

    // Create the build plate (218.88 x 122.88 mm)
    buildPlateRef.current = createBuildPlate(scene, 218.88, 122.88);

    // Setup three-point lighting system
    lightsRef.current = setupLighting(scene);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();
  }, [containerRef]);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (containerRef.current && rendererRef.current && cameraRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
    }
  }, [containerRef]);

  // Cleanup function
  const cleanupScene = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (rendererRef.current && containerRef.current) {
      const rendererDomElement = rendererRef.current.domElement;
      if (rendererDomElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(rendererDomElement);
      }
      rendererRef.current.dispose();
    }
  }, [containerRef]);

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    controls: controlsRef.current,
    handleResize,
    setupScene,
    cleanupScene,
  };
}
