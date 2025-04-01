// src/components/viewer/StlViewer/index.ts
// Export main component
export { StlViewer } from "./StlViewer";

// Export types
export type { StlViewerProps, StlViewerRef, ModelStats } from "./stlViewer.types";

// Export hooks for advanced usage
export { useStlScene } from "./useStlScene";

// Re-export scene setup utilities
export {
  setupLighting,
  createBuildPlate,
  createSmallBuildPlate,
  createLargeBuildPlate,
  createSkybox,
  createGradientSkybox,
  createStarfieldSkybox,
  createDrybrushMaterial,
} from "./sceneSetup";
