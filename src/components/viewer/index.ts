// src/components/viewer/index.ts
export { StlViewer } from "./StlViewer";
export type { StlViewerProps, StlViewerRef, ModelStats } from "./StlViewer";

export { ViewerSettings } from "./ViewerSettings";
export type { ViewerSettingsProps } from "./ViewerSettings";

export { ViewerInfo } from "./ViewerInfo";
export type { ViewerInfoProps } from "./ViewerInfo";

// Export types
// Export hooks for advanced usage
export { useStlScene } from "./StlViewer/useStlScene";

// Re-export scene setup utilities
export {
  setupLighting,
  createBuildPlate,
  createSmallBuildPlate,
  createLargeBuildPlate,
  createSkybox,
  createGradientSkybox,
  createStarfieldSkybox,
} from "./StlViewer/sceneSetup";
