// src/components/viewer/ThreeJsManager/types.ts
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Configuration options for the viewer
 */
export interface ViewerConfig {
  /** Background color of the scene */
  backgroundColor?: string;
  /** Color to apply to the model */
  modelColor?: string;
  /** Whether to display the model in wireframe mode */
  wireframe?: boolean;
}

/**
 * Model statistics
 */
export interface ModelStats {
  /** Number of triangles in the model */
  triangleCount: number;
  /** Dimensions of the model in millimeters */
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

/**
 * Camera parameters
 */
export interface CameraParams {
  /** Width of the viewport */
  width: number;
  /** Height of the viewport */
  height: number;
  /** Field of view in degrees */
  fov: number;
  /** Near clipping plane */
  near: number;
  /** Far clipping plane */
  far: number;
  /** Initial camera position */
  position: THREE.Vector3;
}

/**
 * Animation loop state
 */
export interface AnimationState {
  /** Animation frame ID */
  id: number | null;
  /** Whether the animation is running */
  isRunning: boolean;
}

/**
 * Scene state containing all Three.js objects
 */
export interface SceneState {
  /** Three.js scene */
  scene: THREE.Scene | null;
  /** Camera for rendering */
  camera: THREE.PerspectiveCamera | null;
  /** WebGL renderer */
  renderer: THREE.WebGLRenderer | null;
  /** Camera controls */
  controls: OrbitControls | null;
  /** Currently loaded model */
  model: THREE.Mesh | null;
  /** Animation state */
  animation: AnimationState;
  /** Whether the scene is initialized */
  isInitialized: boolean;
  /** Whether the scene is disposed */
  isDisposed: boolean;
}

/**
 * Build plate configuration
 */
export interface BuildPlateConfig {
  /** Width of the build plate in mm */
  width: number;
  /** Depth of the build plate in mm */
  depth: number;
  /** Height of the build plate in mm */
  height: number;
  /** Size of each grid cell in mm */
  gridCellSize: number;
}

/**
 * Lighting configuration
 */
export interface LightingConfig {
  /** Key light intensity */
  keyLightIntensity: number;
  /** Fill light intensity */
  fillLightIntensity: number;
  /** Rim light intensity */
  rimLightIntensity: number;
  /** Ambient light intensity */
  ambientLightIntensity: number;
  /** Key light color */
  keyLightColor: string;
  /** Fill light color */
  fillLightColor: string;
  /** Rim light color */
  rimLightColor: string;
  /** Ambient light color */
  ambientLightColor: string;
}

/**
 * Callbacks for model loading and errors
 */
export interface ViewerCallbacks {
  /** Called when model is loaded */
  onModelLoaded?: (stats: ModelStats | null) => void;
  /** Called when loading state changes */
  onLoading?: (isLoading: boolean) => void;
  /** Called when an error occurs */
  onError?: (message: string) => void;
}
