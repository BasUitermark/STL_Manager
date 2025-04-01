// src/components/viewer/StlViewer/stlViewer.types.ts
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface StlViewerProps {
  stlUrl: string;
  width?: number | string;
  height?: number | string;
  backgroundColor?: string;
  modelColor?: string;
  wireframe?: boolean;
  onModelLoaded?: (stats: ModelStats | null) => void;
}

export interface ModelStats {
  triangleCount: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

export interface StlViewerRef {
  resetCamera: () => void;
}

export interface SceneObjects {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  model: THREE.Mesh | null;
}

export interface UseStlSceneProps {
  containerRef: React.RefObject<HTMLDivElement>;
  backgroundColor: string;
  modelColor: string;
  wireframe: boolean;
  stlUrl: string;
  onModelLoaded?: (stats: ModelStats | null) => void;
}

export interface UseStlSceneReturn {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  controls: OrbitControls | null;
  model: THREE.Mesh | null;
  loading: boolean;
  error: string | null;
  resetCamera: () => void;
}
