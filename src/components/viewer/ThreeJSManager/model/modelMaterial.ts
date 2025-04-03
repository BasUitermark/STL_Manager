// src/components/viewer/ThreeJsManager/model/modelMaterial.ts
import * as THREE from "three";
import { ViewerConfig } from "../types";

/**
 * Creates a material for the STL model based on configuration
 * @param config Viewer configuration
 * @returns Material for the model
 */
export function createModelMaterial(config: ViewerConfig): THREE.Material {
  return new THREE.MeshStandardMaterial({
    color: config.modelColor || "#6882AC",
    wireframe: config.wireframe || false,
    roughness: 0.5,
    metalness: 0.1,
    side: THREE.DoubleSide, // Render both sides of faces
  });
}

/**
 * Updates the material properties of a model
 * @param model Model to update
 * @param config New configuration
 */
export function updateModelMaterial(model: THREE.Mesh, config: ViewerConfig): void {
  const material = model.material;

  if (Array.isArray(material)) {
    material.forEach((m) => {
      if (m instanceof THREE.MeshStandardMaterial) {
        if (config.modelColor !== undefined) {
          m.color.set(config.modelColor);
        }

        if (config.wireframe !== undefined) {
          m.wireframe = config.wireframe;
        }

        m.needsUpdate = true;
      }
    });
  } else if (material instanceof THREE.MeshStandardMaterial) {
    if (config.modelColor !== undefined) {
      material.color.set(config.modelColor);
    }

    if (config.wireframe !== undefined) {
      material.wireframe = config.wireframe;
    }

    material.needsUpdate = true;
  }
}

/**
 * Creates a wireframe material for model outlining
 * @returns Wireframe material
 */
export function createWireframeMaterial(): THREE.Material {
  return new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
    transparent: true,
    opacity: 0.1,
  });
}

/**
 * Creates a highlight material for selection
 * @returns Highlight material
 */
export function createHighlightMaterial(): THREE.Material {
  return new THREE.MeshBasicMaterial({
    color: 0x44aaff,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
  });
}
