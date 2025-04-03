// src/components/viewer/ThreeJsManager/camera/cameraViews.ts
import * as THREE from "three";
import { SceneState } from "../types";

/**
 * Calculates the bounding box of the current model
 * @param state Scene state with model
 * @returns Bounding box and center of the model, or null if no model
 */
function getModelBounds(state: SceneState): {
  boundingBox: THREE.Box3;
  center: THREE.Vector3;
  size: THREE.Vector3;
} | null {
  if (!state.model) return null;

  // Create bounding box from the model
  const boundingBox = new THREE.Box3().setFromObject(state.model);

  // Calculate center and size
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);

  const size = new THREE.Vector3();
  boundingBox.getSize(size);

  return { boundingBox, center, size };
}

/**
 * Calculates appropriate camera distance based on model size and camera FOV
 * @param size Model size
 * @param camera Camera to calculate for
 * @param padding Additional padding factor (1.0 = exact fit)
 * @returns Appropriate camera distance
 */
function calculateCameraDistance(
  size: THREE.Vector3,
  camera: THREE.PerspectiveCamera,
  dimensionMultiplier: number[] = [1, 1, 1],
  padding: number = 1.5
): number {
  // Get the weighted maximum dimension
  const weightedSize = new THREE.Vector3(
    size.x * dimensionMultiplier[0],
    size.y * dimensionMultiplier[1],
    size.z * dimensionMultiplier[2]
  );

  const maxDim = Math.max(weightedSize.x, weightedSize.y, weightedSize.z);

  // Calculate distance based on FOV
  const fov = camera.fov * (Math.PI / 180);
  const distance = maxDim / (2 * Math.tan(fov / 2));

  // Add padding for better view
  return distance * padding;
}

/**
 * Resets the camera to show the entire model in a default view
 * @param state Scene state
 */
export function resetCameraView(state: SceneState): void {
  if (!state.camera || !state.controls) return;

  const bounds = getModelBounds(state);
  if (!bounds) return;

  const { center, size } = bounds;

  // Calculate appropriate distance
  const distance = calculateCameraDistance(size, state.camera);

  // Position camera at a 30-degree angle for cinematic view
  const angle = Math.PI / 6; // 30 degrees
  state.camera.position.set(
    center.x + distance * Math.sin(angle),
    center.y + distance * 0.7,
    center.z + distance * Math.cos(angle)
  );

  // Look at the center of the model
  state.camera.lookAt(center);

  // Update orbit controls target
  state.controls.target.copy(center);
  state.controls.update();
}

/**
 * Sets the camera to front view
 * @param state Scene state
 */
export function setFrontView(state: SceneState): void {
  if (!state.camera || !state.controls) return;

  const bounds = getModelBounds(state);
  if (!bounds) return;

  const { center, size } = bounds;

  // Calculate appropriate distance (prioritize width and height)
  const distance = calculateCameraDistance(
    size,
    state.camera,
    [1, 1, 0] // Ignore depth for front view
  );

  // Position camera for front view (looking at model from z-axis)
  state.camera.position.set(center.x, center.y, center.z + distance);

  // Look at the center of the model
  state.camera.lookAt(center);

  // Update orbit controls target
  state.controls.target.copy(center);
  state.controls.update();
}

/**
 * Sets the camera to top view
 * @param state Scene state
 */
export function setTopView(state: SceneState): void {
  if (!state.camera || !state.controls) return;

  const bounds = getModelBounds(state);
  if (!bounds) return;

  const { center, size } = bounds;

  // Calculate appropriate distance (prioritize width and depth)
  const distance = calculateCameraDistance(
    size,
    state.camera,
    [1, 0, 1] // Ignore height for top view
  );

  // Position camera for top view (looking at model from y-axis)
  state.camera.position.set(center.x, center.y + distance, center.z);

  // Look at the center of the model
  state.camera.lookAt(center);

  // Update orbit controls target
  state.controls.target.copy(center);
  state.controls.update();
}

/**
 * Sets the camera to side view
 * @param state Scene state
 */
export function setSideView(state: SceneState): void {
  if (!state.camera || !state.controls) return;

  const bounds = getModelBounds(state);
  if (!bounds) return;

  const { center, size } = bounds;

  // Calculate appropriate distance (prioritize height and depth)
  const distance = calculateCameraDistance(
    size,
    state.camera,
    [0, 1, 1] // Ignore width for side view
  );

  // Position camera for side view (looking at model from x-axis)
  state.camera.position.set(center.x + distance, center.y, center.z);

  // Look at the center of the model
  state.camera.lookAt(center);

  // Update orbit controls target
  state.controls.target.copy(center);
  state.controls.update();
}
