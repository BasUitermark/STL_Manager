// src/components/viewer/StlViewer/useStlScene/useModelLoader.ts
import { useCallback, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { ModelStats } from "../stlViewer.types";

interface UseModelLoaderProps {
  scene: THREE.Scene | null;
  stlUrl: string;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  onModelLoaded?: (stats: ModelStats | null) => void;
}

/**
 * Hook for loading and managing STL models
 */
export function useModelLoader({
  scene,
  stlUrl,
  setLoading,
  setError,
  onModelLoaded,
}: UseModelLoaderProps) {
  // Refs for model and geometry
  const modelRef = useRef<THREE.Mesh | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  // Load the STL file
  const loadModel = useCallback(async () => {
    if (!scene) return;

    try {
      setLoading(true);
      setError(null);

      // Create STL loader
      const loader = new STLLoader();

      // Load the STL file
      const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
        loader.load(
          stlUrl,
          (geometry: THREE.BufferGeometry) => resolve(geometry),
          undefined,
          (error: unknown) => reject(error)
        );
      });

      // Store geometry for later material updates
      geometryRef.current = geometry;

      // Remove any previous model
      if (modelRef.current && scene) {
        scene.remove(modelRef.current);
        if (modelRef.current.material) {
          if (Array.isArray(modelRef.current.material)) {
            modelRef.current.material.forEach((m) => m.dispose());
          } else {
            modelRef.current.material.dispose();
          }
        }
      }

      // Create default material
      const material = new THREE.MeshStandardMaterial({
        color: "#6882AC", // Default cinematic blue color
        wireframe: false,
        roughness: 0.7,
        metalness: 0.1,
        flatShading: false,
      });

      // Create mesh and add to scene
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      modelRef.current = mesh;
      scene.add(mesh);

      // Center the model on the build plate
      geometry.computeBoundingBox();
      if (geometry.boundingBox) {
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);

        // Get the min Y value to place object on the build plate
        const bottomY = geometry.boundingBox.min.y;

        // Position to center X/Z and place bottom on build plate (Y=0)
        mesh.position.set(-center.x, -bottomY, -center.z);

        // Calculate model stats
        const bbox = geometry.boundingBox;
        const size = bbox.getSize(new THREE.Vector3());

        // Triangle count
        const triangleCount = geometry.attributes.position.count / 3;

        // Model dimensions
        const dimensions = {
          width: size.x,
          height: size.y,
          depth: size.z,
        };

        // Report stats back to parent - only once
        if (onModelLoaded) {
          const modelStats: ModelStats = {
            triangleCount,
            dimensions,
          };
          onModelLoaded(modelStats);
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
  }, [stlUrl, scene, setLoading, setError, onModelLoaded]);

  // Cleanup model resources
  const cleanupModel = useCallback(() => {
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
  }, []);

  return {
    model: modelRef.current,
    geometry: geometryRef.current,
    loadModel,
    cleanupModel,
  };
}
