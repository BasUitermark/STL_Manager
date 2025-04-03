// src/components/viewer/ThreeJsManager/utils/resourceCleanup.ts
import * as THREE from "three";
import { SceneState } from "../types";

/**
 * Disposes of all Three.js resources to prevent memory leaks
 * @param state Scene state containing resources to dispose
 */
export function disposeResources(state: SceneState): void {
  // Dispose model resources
  disposeModel(state);

  // Dispose scene resources
  disposeScene(state);

  // Dispose controls
  if (state.controls) {
    state.controls.dispose();
    state.controls = null;
  }

  // Dispose renderer
  if (state.renderer) {
    state.renderer.dispose();
    state.renderer.forceContextLoss();
    state.renderer = null;
  }

  // Clear camera reference
  state.camera = null;
}

/**
 * Disposes of model resources
 * @param state Scene state
 */
function disposeModel(state: SceneState): void {
  if (!state.model) return;

  // Dispose materials
  if (state.model.material) {
    if (Array.isArray(state.model.material)) {
      state.model.material.forEach((material) => {
        material.dispose();
      });
    } else {
      state.model.material.dispose();
    }
  }

  // Dispose geometry
  if (state.model.geometry) {
    state.model.geometry.dispose();
  }

  // Remove from scene
  if (state.scene && state.model) {
    state.scene.remove(state.model);
  }

  // Clear reference
  state.model = null;
}

/**
 * Disposes of scene resources
 * @param state Scene state
 */
function disposeScene(state: SceneState): void {
  if (!state.scene) return;

  // Dispose all scene objects
  state.scene.traverse((object) => {
    // Dispose meshes
    if (object instanceof THREE.Mesh) {
      // Dispose geometry
      if (object.geometry) {
        object.geometry.dispose();
      }

      // Dispose materials
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => {
            disposeMaterialTextures(material);
            material.dispose();
          });
        } else {
          disposeMaterialTextures(object.material);
          object.material.dispose();
        }
      }
    }
  });

  // Clear all objects from scene
  while (state.scene.children.length > 0) {
    state.scene.remove(state.scene.children[0]);
  }

  // Clear reference
  state.scene = null;
}

/**
 * Disposes of textures in a material
 * @param material Material containing textures
 */
function disposeMaterialTextures(material: THREE.Material): void {
  // Skip non-standard materials
  if (
    !(material instanceof THREE.MeshStandardMaterial) &&
    !(material instanceof THREE.MeshBasicMaterial) &&
    !(material instanceof THREE.MeshPhongMaterial)
  ) {
    return;
  }

  // Dispose each texture property
  const textureProperties = [
    "map",
    "alphaMap",
    "aoMap",
    "bumpMap",
    "displacementMap",
    "emissiveMap",
    "envMap",
    "lightMap",
    "metalnessMap",
    "normalMap",
    "roughnessMap",
    "specularMap",
  ];

  for (const prop of textureProperties) {
    if ((material as any)[prop]) {
      (material as any)[prop].dispose();
    }
  }
}
