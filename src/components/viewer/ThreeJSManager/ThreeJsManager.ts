// src/components/viewer/ThreeJsManager/ThreeJsManager.ts
import * as THREE from "three";
import { ViewerConfig, ModelStats, SceneState, CameraParams, AnimationState } from "./types";
import { setupScene } from "./scene/setupScene";
import { setupLighting } from "./scene/lighting";
import { createBuildPlate } from "./scene/buildPlate";
import { loadModel, removeModel } from "./model/modelLoader";
import { updateModelMaterial } from "./model/modelMaterial";
import { setupCamera } from "./camera/setupCamera";
import { setupCameraControls } from "./camera/cameraControls";
import { resetCameraView, setFrontView, setTopView, setSideView } from "./camera/cameraViews";
import { startAnimationLoop, stopAnimationLoop } from "./utils/animation";
import { attachRenderer, detachRenderer } from "./utils/domManager";
import { disposeResources } from "./utils/resourceCleanup";

/**
 * Self-contained class to manage Three.js rendering of STL files
 * This approach completely isolates Three.js from React's lifecycle
 */
export class StlViewerManager {
  // DOM elements
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;

  // Scene state
  private state: SceneState = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    model: null,
    animation: {
      id: null,
      isRunning: false,
    },
    isInitialized: false,
    isDisposed: false,
  };

  // Configuration
  private config: Required<ViewerConfig> = {
    backgroundColor: "#1a1e21",
    modelColor: "#6882AC",
    wireframe: false,
  };

  // Callbacks
  private onModelLoadedCallback: ((stats: ModelStats | null) => void) | null = null;
  private onLoadingCallback: ((isLoading: boolean) => void) | null = null;
  private onErrorCallback: ((message: string) => void) | null = null;

  /**
   * Create a new StlViewerManager
   */
  constructor() {}

  /**
   * Initialize the viewer with a container element
   * @param container The DOM element to render into
   * @param config Optional configuration options
   */
  public initialize(container: HTMLElement, config?: ViewerConfig): boolean {
    // Prevent re-initialization
    if (this.state.isInitialized) {
      return false;
    }

    // Store container and update config
    this.container = container;
    this.updateConfig(config || {});

    try {
      // Initialize scene
      this.state.scene = setupScene(this.config.backgroundColor);

      // Initialize camera with container dimensions
      const cameraParams: CameraParams = {
        width: container.clientWidth,
        height: container.clientHeight,
        fov: 45,
        near: 0.1,
        far: 1000,
        position: new THREE.Vector3(0, 10, 20),
      };

      this.state.camera = setupCamera(cameraParams);

      // Initialize renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });

      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.state.renderer = renderer;
      this.canvas = renderer.domElement;

      // Attach renderer to container
      attachRenderer(container, renderer.domElement);

      // Set up camera controls
      if (this.state.camera && this.canvas) {
        this.state.controls = setupCameraControls(this.state.camera, this.canvas);
      }

      // Add lighting to scene
      if (this.state.scene) {
        setupLighting(this.state.scene);
        createBuildPlate(this.state.scene);
      }

      // Start animation loop
      const animationState: AnimationState = {
        id: null,
        isRunning: false,
      };

      this.state.animation = animationState;
      startAnimationLoop(this.state);

      // Mark as initialized
      this.state.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize STL viewer:", error);
      this.handleError("Failed to initialize viewer");
      this.dispose();
      return false;
    }
  }

  /**
   * Update the viewer configuration
   * @param config New configuration options
   */
  public updateConfig(config: Partial<ViewerConfig>): void {
    // Update config
    this.config = {
      ...this.config,
      ...config,
    };

    // Apply background color if renderer exists
    if (this.state.scene && config.backgroundColor) {
      this.state.scene.background = new THREE.Color(this.config.backgroundColor);
    }

    // Apply model color and wireframe if model exists
    if (this.state.model && (config.modelColor || config.wireframe !== undefined)) {
      updateModelMaterial(this.state.model, this.config);
    }
  }

  /**
   * Load an STL model from a URL
   * @param url URL of the STL file to load
   */
  public loadModel(url: string): void {
    // Signal loading start
    this.handleLoading(true);

    // Load the model
    loadModel(
      url,
      this.state,
      this.config,
      (stats) => {
        // Call the model loaded callback
        if (this.onModelLoadedCallback) {
          this.onModelLoadedCallback(stats);
        }

        // Reset camera to show the model
        this.resetCameraView();

        // Signal loading complete
        this.handleLoading(false);
      },
      (error) => {
        // Handle error
        this.handleError(error);
        this.handleLoading(false);
      }
    );
  }

  /**
   * Reset the camera to the default view
   */
  public resetCameraView(): void {
    resetCameraView(this.state);
  }

  /**
   * Set front view camera position
   */
  public setFrontView(): void {
    setFrontView(this.state);
  }

  /**
   * Set top view camera position
   */
  public setTopView(): void {
    setTopView(this.state);
  }

  /**
   * Set side view camera position
   */
  public setSideView(): void {
    setSideView(this.state);
  }

  /**
   * Handle window resize
   */
  public handleResize(): void {
    if (!this.container || !this.state.camera || !this.state.renderer) return;

    // Get new dimensions
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // Update camera
    this.state.camera.aspect = width / height;
    this.state.camera.updateProjectionMatrix();

    // Update renderer
    this.state.renderer.setSize(width, height);
  }

  /**
   * Clean up all resources
   */
  public dispose(): void {
    // Prevent double disposal
    if (this.state.isDisposed) return;

    // Stop animation loop
    stopAnimationLoop(this.state.animation);

    // Remove model
    if (this.state.scene && this.state.model) {
      removeModel(this.state.scene, this.state.model);
      this.state.model = null;
    }

    // Dispose all resources
    disposeResources(this.state);

    // Remove canvas from DOM
    if (this.canvas && this.container) {
      detachRenderer(this.container, this.canvas);
    }

    // Clear references
    this.canvas = null;
    this.container = null;

    // Mark as disposed and uninitialized
    this.state.isDisposed = true;
    this.state.isInitialized = false;
  }

  /**
   * Set the callback for model loading completion
   */
  public onModelLoaded(callback: (stats: ModelStats | null) => void): void {
    this.onModelLoadedCallback = callback;
  }

  /**
   * Set the callback for loading state changes
   */
  public onLoading(callback: (isLoading: boolean) => void): void {
    this.onLoadingCallback = callback;
  }

  /**
   * Set the callback for errors
   */
  public onError(callback: (message: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Handle loading state changes
   */
  private handleLoading(isLoading: boolean): void {
    if (this.onLoadingCallback) {
      this.onLoadingCallback(isLoading);
    }
  }

  /**
   * Handle errors
   */
  private handleError(message: string): void {
    if (this.onErrorCallback) {
      this.onErrorCallback(message);
    }
  }
}
