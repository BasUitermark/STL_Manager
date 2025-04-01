// src/components/metadata/MetadataEditor/PrintSettingsForm.tsx
import React from "react";
import { PrintSettings } from "../metadata.types";

interface PrintSettingsFormProps {
  resin: string;
  layerHeight?: number;
  supportsNeeded: boolean;
  printSettings?: PrintSettings;
  onChange: <T>(field: string, value: T) => void;
  onPrintSettingsChange: <T>(field: string, value: T) => void;
}

export function PrintSettingsForm({
  resin,
  layerHeight,
  supportsNeeded,
  printSettings = {},
  onChange,
  onPrintSettingsChange,
}: PrintSettingsFormProps) {
  // Create handler for print settings fields
  const handlePrintSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    // Handle number inputs
    if (type === "number") {
      onPrintSettingsChange(name, value === "" ? undefined : parseFloat(value));
      return;
    }

    onPrintSettingsChange(name, value);
  };

  return (
    <div className="space-y-6">
      {/* Basic Print Settings */}
      <div className="border-b border-main-700 pb-6">
        <h3 className="text-sm font-medium text-main-200 mb-4">Basic Settings</h3>

        {/* Resin */}
        <div className="mb-4">
          <label htmlFor="resin" className="block text-sm font-medium text-main-300 mb-1">
            Resin Type
          </label>
          <input
            type="text"
            id="resin"
            name="resin"
            value={resin}
            onChange={(e) => onChange("resin", e.target.value)}
            placeholder="e.g., Standard Grey, Water Washable Clear, etc."
            className="w-full p-3 bg-main-800/80 text-main-100 border border-main-700 rounded-lg focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>

        {/* Layer Height */}
        <div className="mb-4">
          <label htmlFor="layerHeight" className="block text-sm font-medium text-main-300 mb-1">
            Layer Height (microns)
          </label>
          <input
            type="number"
            id="layerHeight"
            name="layerHeight"
            min="0"
            step="1"
            value={layerHeight !== undefined ? layerHeight : ""}
            onChange={(e) => {
              const value = e.target.value;
              onChange("layerHeight", value === "" ? undefined : parseFloat(value));
            }}
            placeholder="e.g., 50"
            className="w-full p-3 bg-main-800/80 text-main-100 border border-main-700 rounded-lg focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>

        {/* Supports Needed */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="supportsNeeded"
            name="supportsNeeded"
            checked={supportsNeeded}
            onChange={(e) => onChange("supportsNeeded", e.target.checked)}
            className="h-5 w-5 rounded border-main-600 text-highlight-600 focus:ring-highlight-500"
          />
          <label htmlFor="supportsNeeded" className="ml-3 block text-sm text-main-300">
            Requires supports
          </label>
        </div>
      </div>

      {/* Advanced Print Settings */}
      <div>
        <h3 className="text-sm font-medium text-main-200 mb-4">Advanced Settings</h3>

        {/* Exposure Times */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="exposureTime" className="block text-sm font-medium text-main-300 mb-1">
              Exposure Time (sec)
            </label>
            <input
              type="number"
              id="exposureTime"
              name="exposureTime"
              min="0"
              step="0.1"
              value={printSettings.exposureTime !== undefined ? printSettings.exposureTime : ""}
              onChange={handlePrintSettingChange}
              placeholder="e.g., 2.5"
              className="w-full p-3 bg-main-800/80 text-main-100 border border-main-700 rounded-lg focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
          <div>
            <label
              htmlFor="bottomExposureTime"
              className="block text-sm font-medium text-main-300 mb-1"
            >
              Bottom Exposure (sec)
            </label>
            <input
              type="number"
              id="bottomExposureTime"
              name="bottomExposureTime"
              min="0"
              step="0.1"
              value={
                printSettings.bottomExposureTime !== undefined
                  ? printSettings.bottomExposureTime
                  : ""
              }
              onChange={handlePrintSettingChange}
              placeholder="e.g., 30"
              className="w-full p-3 bg-main-800/80 text-main-100 border border-main-700 rounded-lg focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Bottom Layers */}
        <div className="mb-4">
          <label htmlFor="bottomLayers" className="block text-sm font-medium text-main-300 mb-1">
            Bottom Layers
          </label>
          <input
            type="number"
            id="bottomLayers"
            name="bottomLayers"
            min="0"
            step="1"
            value={printSettings.bottomLayers !== undefined ? printSettings.bottomLayers : ""}
            onChange={handlePrintSettingChange}
            placeholder="e.g., 6"
            className="w-full p-3 bg-main-800/80 text-main-100 border border-main-700 rounded-lg focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>

        {/* Light Off Delays */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lightOffDelay" className="block text-sm font-medium text-main-300 mb-1">
              Light Off Delay (sec)
            </label>
            <input
              type="number"
              id="lightOffDelay"
              name="lightOffDelay"
              min="0"
              step="0.1"
              value={printSettings.lightOffDelay !== undefined ? printSettings.lightOffDelay : ""}
              onChange={handlePrintSettingChange}
              placeholder="e.g., 0.5"
              className="w-full p-3 bg-main-800/80 text-main-100 border border-main-700 rounded-lg focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
          <div>
            <label
              htmlFor="bottomLightOffDelay"
              className="block text-sm font-medium text-main-300 mb-1"
            >
              Bottom Light Off (sec)
            </label>
            <input
              type="number"
              id="bottomLightOffDelay"
              name="bottomLightOffDelay"
              min="0"
              step="0.1"
              value={
                printSettings.bottomLightOffDelay !== undefined
                  ? printSettings.bottomLightOffDelay
                  : ""
              }
              onChange={handlePrintSettingChange}
              placeholder="e.g., 0.5"
              className="w-full p-3 bg-main-800/80 text-main-100 border border-main-700 rounded-lg focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
