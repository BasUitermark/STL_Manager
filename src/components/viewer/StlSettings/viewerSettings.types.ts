// src/components/viewer/ViewerSettings/viewerSettings.types.ts
/**
 * Props for the ViewerSettings component
 */
export interface ViewerSettingsProps {
  /** Whether to display the model in wireframe mode */
  wireframe: boolean;
  /** Function to toggle wireframe mode */
  setWireframe: (value: boolean) => void;
  /** Background color of the scene */
  backgroundColor: string;
  /** Function to change background color */
  setBackgroundColor: (value: string) => void;
  /** Color applied to the model */
  modelColor: string;
  /** Function to change model color */
  setModelColor: (value: string) => void;
  /** Function to reset camera to default view */
  resetCamera: () => void;
  /** Function to download the STL file */
  downloadStl: () => void;
}
