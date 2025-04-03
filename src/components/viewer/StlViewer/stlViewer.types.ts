// src/components/viewer/StlViewer/stlViewer.types.ts
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Props for the StlViewer component
 */
export interface StlViewerProps {
  /** URL to the STL file */
  stlUrl: string;
  /** Width of the viewer (CSS value) */
  width?: string | number;
  /** Height of the viewer (CSS value) */
  height?: string | number;
  /** Background color of the scene */
  backgroundColor?: string;
  /** Color to apply to the model */
  modelColor?: string;
  /** Whether to display the model in wireframe mode */
  wireframe?: boolean;
  /** Callback fired when model is loaded */
  onModelLoaded?: (stats: ModelStats | null) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Model statistics returned after loading an STL
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
 * Reference methods exposed by the StlViewer component
 */
export interface StlViewerRef {
  /** Reset camera to default position */
  resetCamera: () => void;
  /** Set camera to front view */
  setFrontView?: () => void;
  /** Set camera to top view */
  setTopView?: () => void;
  /** Set camera to side view */
  setSideView?: () => void;
}

/**
 * Scene configuration for Three.js
 */
export interface SceneConfig {
  /** Width of the build plate in mm */
  buildPlateWidth: number;
  /** Depth of the build plate in mm */
  buildPlateDepth: number;
  /** Grid cell size in mm */
  gridCellSize: number;
}

/**
 * Scene objects required for Three.js rendering
 */
export interface SceneObjects {
  /** Main Three.js scene */
  scene: THREE.Scene;
  /** Camera for rendering the scene */
  camera: THREE.PerspectiveCamera;
  /** WebGL renderer */
  renderer: THREE.WebGLRenderer;
  /** Orbit controls for user interaction */
  controls: OrbitControls;
  /** Currently loaded model mesh (if any) */
  model: THREE.Mesh | null;
}

/**
 * State of the StlViewer
 */
export interface ViewerState {
  /** Whether the viewer is currently loading */
  loading: boolean;
  /** Error message, if any */
  error: string | null;
  /** Whether the scene has been initialized */
  isSceneInitialized: boolean;
  /** Whether a model has been loaded */
  isModelLoaded: boolean;
}
