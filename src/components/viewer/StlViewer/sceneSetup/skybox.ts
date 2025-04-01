// src/components/viewer/StlViewer/sceneSetup/skybox.ts
import * as THREE from "three";

/**
 * Creates a black skybox for the scene
 *
 * @param scene - The Three.js scene
 */
export function createSkybox(scene: THREE.Scene): void {
  // Simple approach: just set the background color to black
  scene.background = new THREE.Color("#000000");
}

/**
 * Creates a gradient background skybox
 *
 * @param scene - The Three.js scene
 */
export function createGradientSkybox(scene: THREE.Scene): void {
  // Create a canvas for the gradient
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 512;

  const context = canvas.getContext("2d");
  if (context) {
    // Create a gradient from very dark blue to black
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, "#000000"); // Top: pure black
    gradient.addColorStop(1, "#0a0a14"); // Bottom: very dark blue-black

    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 512);

    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
  }
}

/**
 * Creates a starfield background
 *
 * @param scene - The Three.js scene
 * @param starsCount - Number of stars to create
 */
export function createStarfieldSkybox(scene: THREE.Scene, starsCount: number = 1000): void {
  // Create a black background first
  scene.background = new THREE.Color("#000000");

  // Create star particles
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: false,
  });

  // Generate random positions for stars
  const positions = new Float32Array(starsCount * 3);

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 2000;
    positions[i3 + 1] = (Math.random() - 0.5) * 2000;
    positions[i3 + 2] = (Math.random() - 0.5) * 2000;
  }

  starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}
