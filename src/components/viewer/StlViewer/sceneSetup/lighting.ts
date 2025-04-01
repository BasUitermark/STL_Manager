// src/components/viewer/StlViewer/sceneSetup/lighting.ts
import * as THREE from "three";

/**
 * Creates a three-point lighting setup for cinematic model viewing
 *
 * @param scene - The Three.js scene
 * @returns Array of lights added to the scene
 */
export function setupLighting(scene: THREE.Scene): THREE.Light[] {
  const lights: THREE.Light[] = [];

  // 1. Key Light (main light) - bright, positioned front-right and higher
  const keyLight = new THREE.DirectionalLight("#ffffff", 1.2);
  keyLight.position.set(5, 8, 4);
  keyLight.castShadow = true;

  // Improve shadow quality
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 50;
  keyLight.shadow.camera.left = -10;
  keyLight.shadow.camera.right = 10;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -10;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.bias = -0.0005;

  scene.add(keyLight);
  lights.push(keyLight);

  // 2. Fill Light - softer, positioned opposite to key light
  const fillLight = new THREE.DirectionalLight("#e6e6ff", 0.3);
  fillLight.position.set(-6, 3, 1);
  fillLight.castShadow = true;
  scene.add(fillLight);
  lights.push(fillLight);

  // 3. Rim Light (Back Light) - positioned behind to highlight edges
  const rimLight = new THREE.DirectionalLight("#FFCC8B", 0.4);
  rimLight.position.set(0, 5, -7);
  rimLight.castShadow = true;
  scene.add(rimLight);
  lights.push(rimLight);

  // 4. Ambient light - soft overall illumination
  const ambientLight = new THREE.AmbientLight("#222233", 0.2);
  ambientLight.castShadow = true;
  scene.add(ambientLight);
  lights.push(ambientLight);

  // 5. Bottom fill - subtle light from below for edge detail
  const bottomFill = new THREE.DirectionalLight("#293350", 0.1);
  bottomFill.position.set(0, -3, 0);
  scene.add(bottomFill);
  lights.push(bottomFill);

  return lights;
}
