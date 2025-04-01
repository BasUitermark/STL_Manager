// src/components/metadata/MetadataPanel/MetadataPrintSettings.tsx
import React, { useState } from "react";
import { Printer, ChevronDown, ChevronUp } from "lucide-react";
import { PrintSettings } from "../metadata.types";

interface MetadataPrintSettingsProps {
  resin?: string;
  layerHeight?: number;
  supportsNeeded?: boolean;
  printSettings?: PrintSettings;
}

export function MetadataPrintSettings({
  resin,
  layerHeight,
  supportsNeeded,
  printSettings,
}: MetadataPrintSettingsProps) {
  const [expanded, setExpanded] = useState(false);

  // Check if we have any print settings to show
  const hasPrintSettings =
    resin ||
    layerHeight !== undefined ||
    supportsNeeded !== undefined ||
    (printSettings && Object.keys(printSettings).length > 0);

  if (!hasPrintSettings) {
    return null;
  }

  return (
    <div className="py-3">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex items-center">
          <Printer className="h-4 w-4 text-main-400 mr-2" />
          <h4 className="text-sm font-medium text-main-200">Print Settings</h4>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-main-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-main-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {resin && (
            <div>
              <p className="text-xs text-main-400">Resin Type</p>
              <p className="text-sm text-main-50">{resin}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {layerHeight !== undefined && (
              <div>
                <p className="text-xs text-main-400">Layer Height</p>
                <p className="text-sm text-main-50">{layerHeight} microns</p>
              </div>
            )}

            {supportsNeeded !== undefined && (
              <div>
                <p className="text-xs text-main-400">Supports Needed</p>
                <p className="text-sm text-main-50">{supportsNeeded ? "Yes" : "No"}</p>
              </div>
            )}
          </div>

          {printSettings && (
            <>
              {printSettings.exposureTime !== undefined && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-main-400">Exposure Time</p>
                    <p className="text-sm text-main-50">{printSettings.exposureTime} sec</p>
                  </div>
                  {printSettings.bottomExposureTime !== undefined && (
                    <div>
                      <p className="text-xs text-main-400">Bottom Exposure</p>
                      <p className="text-sm text-main-50">{printSettings.bottomExposureTime} sec</p>
                    </div>
                  )}
                </div>
              )}

              {printSettings.bottomLayers !== undefined && (
                <div>
                  <p className="text-xs text-main-400">Bottom Layers</p>
                  <p className="text-sm text-main-50">{printSettings.bottomLayers}</p>
                </div>
              )}

              {printSettings.lightOffDelay !== undefined && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-main-400">Light Off Delay</p>
                    <p className="text-sm text-main-50">{printSettings.lightOffDelay} sec</p>
                  </div>
                  {printSettings.bottomLightOffDelay !== undefined && (
                    <div>
                      <p className="text-xs text-main-400">Bottom Light Off</p>
                      <p className="text-sm text-main-50">
                        {printSettings.bottomLightOffDelay} sec
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
