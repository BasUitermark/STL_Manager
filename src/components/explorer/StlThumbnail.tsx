// src/components/explorer/StlThumbnail.tsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface StlThumbnailProps {
  stlUrl: string;
  className?: string;
}

export function StlThumbnail({ stlUrl, className = "" }: StlThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    model: THREE.Mesh | null;
    animationFrameId: number | null;
  }>({
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(),
    renderer: new THREE.WebGLRenderer(),
    controls: {} as OrbitControls, // Will be initialized later
    model: null,
    animationFrameId: null,
  });

  // Setup Three.js scene and clean up on unmount
  useEffect(() => {
    if (!containerRef.current || mountedRef.current) return;
    mountedRef.current = true;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1a1e21"); // Dark background matching your theme

    // Setup camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Setup renderer with antialias for better quality
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    // Add orbit controls for preview rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Disable zoom for thumbnails
    controls.autoRotate = true; // Auto-rotate for a nice preview effect
    controls.autoRotateSpeed = 1.5;

    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      model: null,
      animationFrameId: null,
    };

    // Animation loop
    const animate = () => {
      const currentScene = sceneRef.current;
      currentScene.animationFrameId = requestAnimationFrame(animate);
      currentScene.controls.update();
      currentScene.renderer.render(currentScene.scene, currentScene.camera);
    };

    animate();

    // Cleanup function
    return () => {
      // Cancel animation frame
      if (sceneRef.current.animationFrameId !== null) {
        cancelAnimationFrame(sceneRef.current.animationFrameId);
      }

      // Dispose of Three.js resources
      if (sceneRef.current.model) {
        scene.remove(sceneRef.current.model);
        if (sceneRef.current.model.geometry) {
          sceneRef.current.model.geometry.dispose();
        }
        if (sceneRef.current.model.material) {
          if (Array.isArray(sceneRef.current.model.material)) {
            sceneRef.current.model.material.forEach((m) => m.dispose());
          } else {
            sceneRef.current.model.material.dispose();
          }
        }
      }

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      mountedRef.current = false;
    };
  }, []);

  // Load STL file
  useEffect(() => {
    if (!mountedRef.current || !stlUrl) return;

    const loader = new STLLoader();

    // Wrap in try/catch to handle loading errors gracefully
    try {
      loader.load(
        stlUrl,
        (geometry) => {
          // Remove any existing model
          if (sceneRef.current.model) {
            sceneRef.current.scene.remove(sceneRef.current.model);
            if (sceneRef.current.model.geometry) {
              sceneRef.current.model.geometry.dispose();
            }
            if (sceneRef.current.model.material) {
              if (Array.isArray(sceneRef.current.model.material)) {
                sceneRef.current.model.material.forEach((m) => m.dispose());
              } else {
                sceneRef.current.model.material.dispose();
              }
            }
          }

          // Create material - use the highlight color from your theme
          const material = new THREE.MeshStandardMaterial({
            color: "#f3ca3c", // Highlight color
            metalness: 0.1,
            roughness: 0.5,
          });

          // Create mesh
          const mesh = new THREE.Mesh(geometry, material);
          sceneRef.current.model = mesh;
          sceneRef.current.scene.add(mesh);

          // Center model
          geometry.computeBoundingBox();
          if (geometry.boundingBox) {
            const center = new THREE.Vector3();
            geometry.boundingBox.getCenter(center);
            mesh.position.set(-center.x, -center.y, -center.z);

            // Auto position camera to fit model
            const bbox = geometry.boundingBox;
            const size = bbox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = sceneRef.current.camera.fov * (Math.PI / 180);
            let cameraDistance = maxDim / (2 * Math.tan(fov / 2));

            // Add padding
            cameraDistance *= 1.5;

            // Position camera
            sceneRef.current.camera.position.set(0, 0, cameraDistance);
            sceneRef.current.camera.lookAt(0, 0, 0);

            // Reset controls
            sceneRef.current.controls.target.set(0, 0, 0);
            sceneRef.current.controls.update();
          }
        },
        undefined,
        (error) => {
          console.error("Error loading STL thumbnail:", error);
        }
      );
    } catch (error) {
      console.error("Exception loading STL thumbnail:", error);
    }
  }, [stlUrl]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ minHeight: "100%" }}
    />
  );
}
