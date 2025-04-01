// src/components/viewer/StlViewer/useStlScene/useCameraControls.ts
import { useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface UseCameraControlsProps {
  camera: THREE.PerspectiveCamera | null;
  controls: OrbitControls | null;
  geometry: THREE.BufferGeometry | null;
}

/**
 * Hook for managing camera controls and positioning
 */
export function useCameraControls({ camera, controls, geometry }: UseCameraControlsProps) {
  // Reset camera to default cinematic position
  const resetCamera = useCallback(() => {
    if (!camera || !controls || !geometry || !geometry.boundingBox) return;

    const bbox = geometry.boundingBox;
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2));

    // Add padding for cinematic view
    cameraDistance *= 2.0;

    // Position at 30 degree angle for cinematic view
    const angle = Math.PI / 6; // 30 degrees
    camera.position.set(
      cameraDistance * Math.sin(angle),
      cameraDistance * 0.7,
      cameraDistance * Math.cos(angle)
    );

    // Look at model center, slightly higher
    camera.lookAt(0, size.y * 0.4, 0);

    // Reset controls
    controls.target.set(0, size.y * 0.4, 0);
    controls.update();
  }, [camera, controls, geometry]);

  // Move camera to front view
  const setCameraFrontView = useCallback(() => {
    if (!camera || !controls || !geometry || !geometry.boundingBox) return;

    const bbox = geometry.boundingBox;
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
    cameraDistance *= 1.5;

    camera.position.set(0, size.y * 0.5, cameraDistance);
    camera.lookAt(0, size.y * 0.5, 0);
    controls.target.set(0, size.y * 0.5, 0);
    controls.update();
  }, [camera, controls, geometry]);

  // Move camera to top view
  const setCameraTopView = useCallback(() => {
    if (!camera || !controls || !geometry || !geometry.boundingBox) return;

    const bbox = geometry.boundingBox;
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.z); // Using X and Z for top view
    const fov = camera.fov * (Math.PI / 180);
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
    cameraDistance *= 1.5;

    camera.position.set(0, cameraDistance, 0);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [camera, controls, geometry]);

  // Move camera to side view
  const setCameraSideView = useCallback(() => {
    if (!camera || !controls || !geometry || !geometry.boundingBox) return;

    const bbox = geometry.boundingBox;
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
    cameraDistance *= 1.5;

    camera.position.set(cameraDistance, size.y * 0.5, 0);
    camera.lookAt(0, size.y * 0.5, 0);
    controls.target.set(0, size.y * 0.5, 0);
    controls.update();
  }, [camera, controls, geometry]);

  return {
    resetCamera,
    setCameraFrontView,
    setCameraTopView,
    setCameraSideView,
  };
}
