// src/components/viewer/ThreeJsManager/scene/setupScene.ts
import * as THREE from "three";

/**
 * Creates and configures a Three.js scene
 * @param backgroundColor Background color for the scene
 * @returns Configured Three.js scene
 */
export function setupScene(backgroundColor: string): THREE.Scene {
  const scene = new THREE.Scene();

  // Set background color
  scene.background = new THREE.Color(backgroundColor);

  // Optional: Add fog for depth perception
  // scene.fog = new THREE.Fog(backgroundColor, 100, 200);

  return scene;
}
