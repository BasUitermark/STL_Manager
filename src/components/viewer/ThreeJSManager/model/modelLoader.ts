// src/components/viewer/ThreeJsManager/model/modelLoader.ts
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { SceneState, ModelStats, ViewerConfig } from "../types";
import { createModelMaterial } from "./modelMaterial";

/**
 * Loads an STL model from a URL
 * @param url URL of the STL file to load
 * @param state Current scene state
 * @param config Viewer configuration
 * @param onSuccess Callback when model loads successfully
 * @param onError Callback when model fails to load
 */
export function loadModel(
  url: string,
  state: SceneState,
  config: ViewerConfig,
  onSuccess: (stats: ModelStats) => void,
  onError: (error: string) => void
): void {
  // Check if scene is ready
  if (!state.scene) {
    onError("Scene not initialized");
    return;
  }

  // Remove any existing model
  if (state.model && state.scene) {
    removeModel(state.scene, state.model);
    state.model = null;
  }

  // Create STL loader
  const loader = new STLLoader();

  // Load the STL
  loader.load(
    url,
    (geometry) => {
      try {
        // Create material based on config
        const material = createModelMaterial(config);

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Center model on build plate
        centerModel(mesh, geometry);

        // Add to scene
        if (state.scene) {
          state.scene.add(mesh);
          state.model = mesh;
        }

        // Calculate and report stats
        const stats = calculateModelStats(geometry);
        onSuccess(stats);
      } catch (error) {
        console.error("Error creating model:", error);
        onError("Failed to process model");
      }
    },
    // Progress callback (not used)
    undefined,
    // Error callback
    (error) => {
      console.error("Error loading STL:", error);
      onError("Failed to load model");
    }
  );
}

/**
 * Removes a model from the scene and disposes its resources
 * @param scene Scene containing the model
 * @param model Model to remove
 */
export function removeModel(scene: THREE.Scene, model: THREE.Mesh): void {
  // Remove from scene
  scene.remove(model);

  // Dispose materials
  if (model.material) {
    if (Array.isArray(model.material)) {
      model.material.forEach((m) => m.dispose());
    } else {
      model.material.dispose();
    }
  }

  // Dispose geometry
  if (model.geometry) {
    model.geometry.dispose();
  }
}

/**
 * Centers a model on the build plate
 * @param mesh Mesh to center
 * @param geometry Geometry of the mesh
 */
export function centerModel(mesh: THREE.Mesh, geometry: THREE.BufferGeometry): void {
  // Compute bounding box
  geometry.computeBoundingBox();
  if (!geometry.boundingBox) return;

  // Get center
  const center = new THREE.Vector3();
  geometry.boundingBox.getCenter(center);

  // Position model so bottom is on build plate (y=0)
  const bottomY = geometry.boundingBox.min.y;
  mesh.position.set(-center.x, -bottomY, -center.z);
}

/**
 * Calculates statistics for a model
 * @param geometry Geometry to calculate stats for
 * @returns Model statistics
 */
export function calculateModelStats(geometry: THREE.BufferGeometry): ModelStats {
  // Ensure bounding box is calculated
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }

  // Get size from bounding box
  const size = new THREE.Vector3();
  geometry.boundingBox!.getSize(size);

  return {
    triangleCount: geometry.attributes.position.count / 3,
    dimensions: {
      width: size.x,
      height: size.y,
      depth: size.z,
    },
  };
}
