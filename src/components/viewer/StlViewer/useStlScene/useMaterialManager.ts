// src/components/viewer/StlViewer/useStlScene/useMaterialManager.ts
import { useCallback } from "react";
import * as THREE from "three";

interface UseMaterialManagerProps {
  scene: THREE.Scene | null;
  model: THREE.Mesh | null;
  geometry: THREE.BufferGeometry | null;
  modelColor: string;
  wireframe: boolean;
}

/**
 * Hook for managing model materials and appearance
 */
export function useMaterialManager({
  scene,
  model,
  geometry,
  modelColor,
  wireframe,
}: UseMaterialManagerProps) {
  // Update model material based on props
  const updateModelMaterial = useCallback(() => {
    if (!model || !geometry || !scene) return;

    // Remove existing model from scene
    scene.remove(model);

    // Dispose old material to prevent memory leaks
    if (model.material) {
      if (Array.isArray(model.material)) {
        model.material.forEach((m) => m.dispose());
      } else {
        model.material.dispose();
      }
    }

    // Create new material with updated properties
    const material = new THREE.MeshStandardMaterial({
      color: modelColor,
      wireframe: wireframe,
      roughness: 0.7, // Slight roughness for realistic look
      metalness: 0.1, // Slight metalness for shine
      flatShading: false, // Smooth shading
    });

    // Create new mesh with existing geometry and new material
    const mesh = new THREE.Mesh(geometry, material);

    // Setup shadows
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Copy position from old model
    mesh.position.copy(model.position);

    // Add the new mesh to the scene
    scene.add(mesh);

    // Update the external model reference
    // Note: Since we can't update the ref directly from here,
    // we'll need to handle this at the parent hook level
    return mesh;
  }, [scene, model, geometry, modelColor, wireframe]);

  /**
   * Creates a reflective/metallic material for the model
   */
  const createMetallicMaterial = useCallback(() => {
    return new THREE.MeshStandardMaterial({
      color: modelColor,
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.0,
      wireframe: wireframe,
    });
  }, [modelColor, wireframe]);

  /**
   * Creates a matte/plastic material for the model
   */
  const createMatteMaterial = useCallback(() => {
    return new THREE.MeshStandardMaterial({
      color: modelColor,
      metalness: 0.0,
      roughness: 0.9,
      wireframe: wireframe,
    });
  }, [modelColor, wireframe]);

  /**
   * Creates a glossy material for the model
   */
  const createGlossyMaterial = useCallback(() => {
    return new THREE.MeshStandardMaterial({
      color: modelColor,
      metalness: 0.1,
      roughness: 0.2,
      wireframe: wireframe,
    });
  }, [modelColor, wireframe]);

  return {
    updateModelMaterial,
    createMetallicMaterial,
    createMatteMaterial,
    createGlossyMaterial,
  };
}
