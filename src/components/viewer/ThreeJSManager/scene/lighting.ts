// src/components/viewer/ThreeJsManager/scene/lighting.ts
import * as THREE from "three";
import { LightingConfig } from "../types";

/**
 * Default lighting configuration
 */
const DEFAULT_LIGHTING: LightingConfig = {
  keyLightIntensity: 1,
  fillLightIntensity: 0.3,
  rimLightIntensity: 0.4,
  ambientLightIntensity: 0.2,
  keyLightColor: "#ffffff",
  fillLightColor: "#e6e6ff",
  rimLightColor: "#FFCC8B",
  ambientLightColor: "#222233",
};

/**
 * Sets up a comprehensive lighting system for the 3D scene
 * @param scene The Three.js scene to add lights to
 * @param config Optional lighting configuration
 * @returns Array of lights added to the scene
 */
export function setupLighting(
  scene: THREE.Scene,
  config: Partial<LightingConfig> = {}
): THREE.Light[] {
  // Merge with default config
  const lightConfig = { ...DEFAULT_LIGHTING, ...config };

  const lights: THREE.Light[] = [];

  // 1. Key Light (main directional light)
  const keyLight = createKeyLight(lightConfig);
  scene.add(keyLight);
  lights.push(keyLight);

  // 2. Fill Light (softer, from opposite side)
  const fillLight = createFillLight(lightConfig);
  scene.add(fillLight);
  lights.push(fillLight);

  // 3. Rim Light (back light for edge highlighting)
  const rimLight = createRimLight(lightConfig);
  scene.add(rimLight);
  lights.push(rimLight);

  // 4. Ambient light (soft overall illumination)
  const ambientLight = createAmbientLight(lightConfig);
  scene.add(ambientLight);
  lights.push(ambientLight);

  return lights;
}

/**
 * Creates the main directional light for the scene
 */
function createKeyLight(config: LightingConfig): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(config.keyLightColor, config.keyLightIntensity);

  light.position.set(5, 8, 4);
  light.castShadow = true;

  // Shadow quality settings
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 50;
  light.shadow.camera.left = -10;
  light.shadow.camera.right = 10;
  light.shadow.camera.top = 10;
  light.shadow.camera.bottom = -10;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.bias = -0.0005;

  return light;
}

/**
 * Creates a fill light to soften shadows
 */
function createFillLight(config: LightingConfig): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(config.fillLightColor, config.fillLightIntensity);

  light.position.set(-6, 3, 1);
  light.castShadow = true;

  return light;
}

/**
 * Creates a rim light to highlight edges
 */
function createRimLight(config: LightingConfig): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(config.rimLightColor, config.rimLightIntensity);

  light.position.set(0, 5, -7);
  light.castShadow = true;

  return light;
}

/**
 * Creates ambient light for overall scene illumination
 */
function createAmbientLight(config: LightingConfig): THREE.AmbientLight {
  const light = new THREE.AmbientLight(config.ambientLightColor, config.ambientLightIntensity);

  return light;
}
