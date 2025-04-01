// src/components/viewer/StlViewer/useStlScene/index.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { UseStlSceneProps, UseStlSceneReturn } from "../stlViewer.types";
import { setupLighting } from "../sceneSetup/lighting";
import { createBuildPlate } from "../sceneSetup/buildPlate";
import { createSkybox } from "../sceneSetup/skybox";

/**
 * Custom hook for managing the Three.js scene for STL viewing
 */
export function useStlScene({
  containerRef,
  modelColor = "#6882AC", // Ensure default value here as well
  wireframe,
  stlUrl,
  onModelLoaded,
}: UseStlSceneProps): UseStlSceneReturn {
  console.log("Model color from props:", modelColor); // Debug log
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Mesh | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Define resetCamera function first to avoid reference before declaration
  const resetCamera = useCallback(() => {
    if (
      !cameraRef.current ||
      !controlsRef.current ||
      !geometryRef.current ||
      !geometryRef.current.boundingBox
    )
      return;

    const bbox = geometryRef.current.boundingBox;
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2));

    // Add padding
    cameraDistance *= 2.0;

    // Position at angle for cinematic view
    const angle = Math.PI / 6; // 30 degrees
    cameraRef.current.position.set(
      cameraDistance * Math.sin(angle),
      cameraDistance * 0.7,
      cameraDistance * Math.cos(angle)
    );

    cameraRef.current.lookAt(0, size.y * 0.4, 0);

    controlsRef.current.target.set(0, size.y * 0.4, 0);
    controlsRef.current.update();
  }, []);

  // Set up the scene
  const setupScene = useCallback(() => {
    if (isInitializedRef.current || !containerRef.current) return;
    isInitializedRef.current = true;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Set background
    createSkybox(scene);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 5, 10);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: "highp",
    });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    containerRef.current.appendChild(renderer.domElement);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add build plate
    createBuildPlate(scene, 218.88, 122.88);

    // Add lighting
    setupLighting(scene);

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

  // Load the STL model
  const loadModel = useCallback(async () => {
    if (!sceneRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const loader = new STLLoader();

      // Load the file
      const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
        loader.load(
          stlUrl,
          (geometry) => resolve(geometry),
          undefined,
          (error) => reject(error)
        );
      });

      // Store geometry
      geometryRef.current = geometry;

      // Remove any previous model
      if (modelRef.current && sceneRef.current) {
        sceneRef.current.remove(modelRef.current);
        if (modelRef.current.material) {
          if (Array.isArray(modelRef.current.material)) {
            modelRef.current.material.forEach((m) => m.dispose());
          } else {
            modelRef.current.material.dispose();
          }
        }
      }

      // Create material with the cinematic blue color
      const material = new THREE.MeshStandardMaterial({
        color: "#6882AC", // Explicitly set to cinematic blue
        wireframe: wireframe,
        roughness: 0.42,
        metalness: 0,
      });

      // Debug log to check material color
      console.log("Material color being applied:", material.color.getHexString());

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      modelRef.current = mesh;
      sceneRef.current.add(mesh);

      // Center the model
      geometry.computeBoundingBox();
      if (geometry.boundingBox) {
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);

        // Place bottom on build plate
        const bottomY = geometry.boundingBox.min.y;
        mesh.position.set(-center.x, -bottomY, -center.z);

        // Calculate stats
        const bbox = geometry.boundingBox;
        const size = bbox.getSize(new THREE.Vector3());

        if (onModelLoaded) {
          onModelLoaded({
            triangleCount: geometry.attributes.position.count / 3,
            dimensions: {
              width: size.x,
              height: size.y,
              depth: size.z,
            },
          });
        }

        // Position camera
        if (cameraRef.current && controlsRef.current) {
          resetCamera();
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading STL:", err);
      setError("Failed to load the STL file. It might be corrupted or inaccessible.");
      setLoading(false);

      if (onModelLoaded) {
        onModelLoaded(null);
      }
    }
  }, [wireframe, stlUrl, onModelLoaded, resetCamera]);

  // Resize handler
  const handleResize = useCallback(() => {
    if (containerRef.current && rendererRef.current && cameraRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
    }
  }, [containerRef]);

  // Initial setup
  useEffect(() => {
    setupScene();
    loadModel();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Clean up resources
      if (modelRef.current) {
        if (modelRef.current.material) {
          if (Array.isArray(modelRef.current.material)) {
            modelRef.current.material.forEach((m) => m.dispose());
          } else {
            modelRef.current.material.dispose();
          }
        }
      }

      if (geometryRef.current) {
        geometryRef.current.dispose();
      }

      if (rendererRef.current && containerRef.current) {
        const rendererDomElement = rendererRef.current.domElement;
        if (rendererDomElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(rendererDomElement);
        }
        rendererRef.current.dispose();
      }

      isInitializedRef.current = false;
    };
  }, [setupScene, loadModel, handleResize, containerRef]);

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    controls: controlsRef.current,
    model: modelRef.current,
    loading,
    error,
    resetCamera,
  };
}
