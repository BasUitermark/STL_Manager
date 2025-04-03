// src/components/viewer/ThreeJsManager/camera/setupCamera.ts
import * as THREE from "three";
import { CameraParams } from "../types";

/**
 * Creates and configures a perspective camera for the scene
 * @param params Camera configuration parameters
 * @returns Configured perspective camera
 */
export function setupCamera(params: CameraParams): THREE.PerspectiveCamera {
  // Create camera with the specified parameters
  const camera = new THREE.PerspectiveCamera(
    params.fov,
    params.width / params.height,
    params.near,
    params.far
  );

  // Set initial position
  camera.position.copy(params.position);

  return camera;
}
