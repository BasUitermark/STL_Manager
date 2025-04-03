// src/components/viewer/ThreeJsManager/camera/cameraControls.ts
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Configuration for orbit controls
 */
interface ControlsConfig {
  // Enable camera damping (smoother movement)
  enableDamping: boolean;
  // Damping factor (inertia) - lower is less damping
  dampingFactor: number;
  // Minimum distance to target
  minDistance: number;
  // Maximum distance to target
  maxDistance: number;
  // Enable/disable camera panning
  enablePan: boolean;
  // Enable/disable zooming
  enableZoom: boolean;
  // Enable/disable rotation
  enableRotate: boolean;
  // Maximum polar angle (how far you can orbit vertically)
  maxPolarAngle?: number;
  // Minimum polar angle (how far you can orbit vertically)
  minPolarAngle?: number;
}

/**
 * Default controls configuration
 */
const DEFAULT_CONFIG: ControlsConfig = {
  enableDamping: true,
  dampingFactor: 0.05,
  minDistance: 1,
  maxDistance: 100,
  enablePan: true,
  enableZoom: true,
  enableRotate: true,
};

/**
 * Sets up orbit controls for camera movement
 * @param camera The camera to control
 * @param domElement The DOM element to attach controls to
 * @param config Optional configuration
 * @returns Configured OrbitControls
 */
export function setupCameraControls(
  camera: THREE.Camera,
  domElement: HTMLElement,
  config: Partial<ControlsConfig> = {}
): OrbitControls {
  // Merge with default config
  const controlsConfig = { ...DEFAULT_CONFIG, ...config };

  // Create controls
  const controls = new OrbitControls(camera, domElement);

  // Apply configuration
  controls.enableDamping = controlsConfig.enableDamping;
  controls.dampingFactor = controlsConfig.dampingFactor;
  controls.minDistance = controlsConfig.minDistance;
  controls.maxDistance = controlsConfig.maxDistance;
  controls.enablePan = controlsConfig.enablePan;
  controls.enableZoom = controlsConfig.enableZoom;
  controls.enableRotate = controlsConfig.enableRotate;

  // Apply optional config
  if (controlsConfig.maxPolarAngle !== undefined) {
    controls.maxPolarAngle = controlsConfig.maxPolarAngle;
  }

  if (controlsConfig.minPolarAngle !== undefined) {
    controls.minPolarAngle = controlsConfig.minPolarAngle;
  }

  return controls;
}
