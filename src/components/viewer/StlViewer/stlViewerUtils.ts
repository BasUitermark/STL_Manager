// Add these to your utils file
import * as THREE from "three";

/**
 * Adds a shadow-receiving dark floor beneath the model
 * @param scene - The Three.js scene
 * @param width - Plane width in mm
 * @param depth - Plane depth in mm
 */
export function addFloorPlane(scene: THREE.Scene, width = 218.88, depth = 122.88) {
  const geometry = new THREE.PlaneGeometry(width, depth);
  const material = new THREE.ShadowMaterial({ opacity: 0.3 });
  const floor = new THREE.Mesh(geometry, material);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  return floor;
}

/**
 * Creates a vertical gradient background that transitions from dark grey to black
 */
export function createGradientBackground(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

  gradient.addColorStop(0, "#000000"); // Top (black)
  gradient.addColorStop(0.4, "#1a1a1a"); // Dark grey around mid
  gradient.addColorStop(1, "#2e2e2e"); // Bottom (floor area)

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;

  return texture;
}
