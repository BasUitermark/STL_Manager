// src/components/viewer/ViewerInfo/viewerInfo.types.ts
/**
 * Props for the ViewerInfo component
 */
export interface ViewerInfoProps {
  /** Name of the file */
  fileName: string;
  /** Size of the file in bytes */
  fileSize: number;
  /** Modified date of the file */
  modified: string;
  /** Number of triangles in the model */
  triangleCount?: number;
  /** Dimensions of the model in millimeters */
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
}
