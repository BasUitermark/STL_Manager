// src/components/metadata/metadata.types.ts
import { FileType } from "@/lib/metadata/fileTypes";

export interface PrintSettings {
  exposureTime?: number;
  bottomExposureTime?: number;
  bottomLayers?: number;
  liftHeight?: number;
  liftSpeed?: number;
  // Add other print settings as needed
}

export interface FileMetadata {
  id: number;
  filePath: string;
  fileName: string;
  fileType?: FileType;
  parentFolderId?: number;
  description?: string;
  dateAdded: string;
  lastModified: string;
  tags: string[];
  resin?: string;
  layerHeight?: number;
  supportsNeeded: boolean;
  notes?: string;
  printSettings?: PrintSettings;
}

// Modified to match the dateAdded and lastModified fields we're using
export interface MetadataInput {
  filePath: string;
  fileName: string;
  fileType?: FileType;
  parentFolderId?: number;
  description?: string;
  tags: string[];
  resin?: string;
  layerHeight?: number;
  supportsNeeded?: boolean;
  notes?: string;
  printSettings?: PrintSettings;
  // These fields should be optional since they're often set internally
  dateAdded?: string;
  lastModified?: string;
}

export interface MetadataQueryOptions {
  tags?: string[];
  fileType?: FileType;
  search?: string;
  parentFolder?: string;
}

export interface PrintSettingsFilter {
  resin?: string;
  layerHeight?: number;
  supportsNeeded?: boolean;
  exposureTime?: number;
  bottomExposureTime?: number;
  bottomLayers?: number;
}
