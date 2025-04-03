// src/components/viewer/ThreeJsManager/scene/buildPlate.ts
import * as THREE from "three";
import { BuildPlateConfig } from "../types";

/**
 * Default build plate configuration
 */
const DEFAULT_BUILD_PLATE: BuildPlateConfig = {
  width: 200,
  depth: 120,
  height: 2,
  gridCellSize: 10,
};

/**
 * Creates a build plate with grid for the 3D model
 * @param scene The Three.js scene to add the build plate to
 * @param config Optional build plate configuration
 * @returns The build plate mesh
 */
export function createBuildPlate(
  scene: THREE.Scene,
  config: Partial<BuildPlateConfig> = {}
): THREE.Group {
  // Merge with default config
  const plateConfig = { ...DEFAULT_BUILD_PLATE, ...config };

  // Create a group to hold all build plate elements
  const buildPlateGroup = new THREE.Group();

  // Add the base plate
  const plate = createPlateMesh(plateConfig);
  buildPlateGroup.add(plate);

  // Add grid
  const grid = createGrid(plateConfig);
  buildPlateGroup.add(grid);

  // Add edge outline
  const outline = createPlateOutline(plateConfig);
  buildPlateGroup.add(outline);

  // Add group to scene
  scene.add(buildPlateGroup);

  return buildPlateGroup;
}

/**
 * Creates the main build plate mesh
 */
function createPlateMesh(config: BuildPlateConfig): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(config.width, config.height, config.depth);

  const material = new THREE.MeshStandardMaterial({
    color: "#222222",
    roughness: 0.9,
    metalness: 0.1,
  });

  const buildPlate = new THREE.Mesh(geometry, material);
  buildPlate.position.set(0, -config.height / 2, 0); // Top surface at y=0
  buildPlate.receiveShadow = true;

  return buildPlate;
}

/**
 * Creates a highlighted outline for the build plate edges
 */
function createPlateOutline(config: BuildPlateConfig): THREE.Line {
  const outlineMaterial = new THREE.LineBasicMaterial({
    color: "#4a88c7", // Highlight blue color
    linewidth: 2,
  });

  // Create the outer rectangle (all 4 edges)
  const halfWidth = config.width / 2;
  const halfDepth = config.depth / 2;
  const y = 0.05; // Slightly above build plate

  const outlineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-halfWidth, y, -halfDepth),
    new THREE.Vector3(halfWidth, y, -halfDepth),
    new THREE.Vector3(halfWidth, y, halfDepth),
    new THREE.Vector3(-halfWidth, y, halfDepth),
    new THREE.Vector3(-halfWidth, y, -halfDepth),
  ]);

  return new THREE.Line(outlineGeometry, outlineMaterial);
}

/**
 * Creates a grid on the build plate with consistent square cells
 */
function createGrid(config: BuildPlateConfig): THREE.Group {
  const gridGroup = new THREE.Group();
  const lineMaterial = new THREE.LineBasicMaterial({
    color: "#444444",
    transparent: true,
    opacity: 0.5,
  });

  const halfWidth = config.width / 2;
  const halfDepth = config.depth / 2;
  const y = 0.1; // Slightly above build plate

  // Calculate number of lines needed
  const widthLines = Math.floor(config.depth / config.gridCellSize) + 1;
  const depthLines = Math.floor(config.width / config.gridCellSize) + 1;

  // Create lines along width (X axis)
  for (let i = 0; i < widthLines; i++) {
    const z = i * config.gridCellSize - halfDepth;

    // Skip if outside the build plate
    if (z > halfDepth) continue;

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfWidth, y, z),
      new THREE.Vector3(halfWidth, y, z),
    ]);

    const line = new THREE.Line(geometry, lineMaterial);
    gridGroup.add(line);
  }

  // Create lines along depth (Z axis)
  for (let i = 0; i < depthLines; i++) {
    const x = i * config.gridCellSize - halfWidth;

    // Skip if outside the build plate
    if (x > halfWidth) continue;

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y, -halfDepth),
      new THREE.Vector3(x, y, halfDepth),
    ]);

    const line = new THREE.Line(geometry, lineMaterial);
    gridGroup.add(line);
  }

  return gridGroup;
}
