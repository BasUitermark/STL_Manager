// src/components/viewer/StlViewer/sceneSetup/buildPlate.ts
import * as THREE from "three";

/**
 * Creates a build plate with dimensions matching a standard resin printer build plate
 *
 * @param scene - The Three.js scene
 * @param width - Plate width in mm (default: 218.88)
 * @param depth - Plate depth in mm (default: 122.88)
 * @returns The build plate mesh
 */
export function createBuildPlate(
  scene: THREE.Scene,
  width: number = 218.88,
  depth: number = 122.88
): THREE.Mesh {
  // Create a build plate geometry
  const geometry = new THREE.BoxGeometry(width, 3, depth);

  // Create a matte dark grey material
  const material = new THREE.MeshStandardMaterial({
    color: "#222222",
    roughness: 0.9,
    metalness: 0.1,
  });

  const buildPlate = new THREE.Mesh(geometry, material);

  // Position just below the model (Y = -1.5 puts the top surface at Y=0)
  buildPlate.position.set(0, -1.5, 0);

  // Make it receive shadows
  buildPlate.receiveShadow = true;

  scene.add(buildPlate);

  // Add grid lines on top of build plate for reference
  addBuildPlateGrid(scene, width, depth);

  return buildPlate;
}

/**
 * Adds a grid to the build plate for better spatial reference
 */
function addBuildPlateGrid(scene: THREE.Scene, width: number, depth: number): void {
  // Create a grid helper and position it just above the build plate
  const grid = new THREE.GridHelper(Math.max(width, depth), 20, "#444444", "#333333");

  // Rotate grid to be on XZ plane
  //   grid.rotation.x = Math.PI / 2;

  // Position at the top of the build plate
  grid.position.set(0, 0.01, 0); // Just slightly above build plate

  scene.add(grid);
}

/**
 * Creates a smaller build plate for detailed models
 */
export function createSmallBuildPlate(scene: THREE.Scene): THREE.Mesh {
  return createBuildPlate(scene, 120, 68);
}

/**
 * Creates a larger build plate for oversized models
 */
export function createLargeBuildPlate(scene: THREE.Scene): THREE.Mesh {
  return createBuildPlate(scene, 300, 200);
}
