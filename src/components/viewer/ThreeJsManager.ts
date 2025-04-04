// src/components/viewer/ThreeJsManager.ts
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

// Define the model stats interface
export interface ModelStats {
  triangleCount: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

// Config options for the viewer
export interface ViewerConfig {
  backgroundColor?: string;
  modelColor?: string;
  wireframe?: boolean;
}

/**
 * Self-contained class to manage Three.js rendering of STL files
 * This approach completely isolates Three.js from React's lifecycle
 */
export class StlViewerManager {
  // DOM elements
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;

  // Three.js objects
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private model: THREE.Mesh | null = null;

  // State
  private animationId: number | null = null;
  private isInitialized = false;
  private isDisposed = false;

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
    if (this.isInitialized) {
      return false;
    }

    // Store container and update config
    this.container = container;
    this.updateConfig(config || {});

    try {
      // Set up Three.js scene
      this.setupScene();
      this.setupCamera();
      this.setupRenderer();
      this.setupLighting();
      this.setupControls();
      this.setupBuiltPlate();

      // Start animation loop
      this.startAnimationLoop();

      // Mark as initialized
      this.isInitialized = true;
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
    if (this.model && (config.modelColor || config.wireframe !== undefined)) {
      this.updateModelMaterial();
    }

    // Apply model color and wireframe if model exists
    if (this.model && (config.modelColor !== undefined || config.wireframe !== undefined)) {
      this.updateModelMaterial();
    }
  }

  /**
   * Load an STL model from a URL
   * @param url URL of the STL file to load
   */
  public loadModel(url: string): void {
    // Check initialization
    if (!this.isInitialized || !this.scene) {
      this.handleError("Viewer not initialized");
      return;
    }

    // Signal loading start
    this.handleLoading(true);

    // Remove any existing model
    this.removeCurrentModel();

    // Create loader
    const loader = new STLLoader();

    // Load the STL
    loader.load(
      url,
      (geometry) => {
        try {
          // Create material
          const material = new THREE.MeshStandardMaterial({
            color: this.config.modelColor,
            wireframe: this.config.wireframe,
            roughness: 0.5,
            metalness: 0.1,
          });

          // Create mesh
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Center model on build plate
          this.centerModel(mesh, geometry);

          // Add to scene
          if (this.scene) {
            this.scene.add(mesh);
            this.model = mesh;
          }

          // Calculate and report stats
          if (geometry.boundingBox) {
            const stats = this.calculateModelStats(geometry);
            if (this.onModelLoadedCallback) {
              this.onModelLoadedCallback(stats);
            }
          }

          // Reset camera view
          this.resetCameraView();

          // Signal loading complete
          this.handleLoading(false);
        } catch (error) {
          console.error("Error creating model:", error);
          this.handleError("Failed to process model");
          this.handleLoading(false);
        }
      },
      // Progress callback (not used)
      undefined,
      // Error callback
      (error) => {
        console.error("Error loading STL:", error);
        this.handleError("Failed to load model");
        this.handleLoading(false);
      }
    );
  }

  /**
   * Reset the camera to the default view
   */
  public resetCameraView(): void {
    if (!this.camera || !this.controls || !this.model) return;

    // Get model bounding box
    const boundingBox = new THREE.Box3().setFromObject(this.model);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Get model size
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    // Calculate appropriate distance
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
    cameraDistance *= 1.5; // Add some padding

    // Position camera
    const angle = Math.PI / 6; // 30 degrees
    this.camera.position.set(
      cameraDistance * Math.sin(angle),
      cameraDistance * 0.7,
      cameraDistance * Math.cos(angle)
    );

    // Look at center
    this.camera.lookAt(center);

    // Update controls
    this.controls.target.copy(center);
    this.controls.update();
  }

  /**
   * Set front view camera position
   */
  public setFrontView(): void {
    if (!this.camera || !this.controls || !this.model) return;

    // Get model bounding box
    const boundingBox = new THREE.Box3().setFromObject(this.model);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Get model size
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    // Calculate appropriate distance
    const maxDim = Math.max(size.x, size.y);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
    cameraDistance *= 1.5;

    // Position camera
    this.camera.position.set(0, center.y, center.z + cameraDistance);
    this.camera.lookAt(center);

    // Update controls
    this.controls.target.copy(center);
    this.controls.update();
  }

  /**
   * Set top view camera position
   */
  public setTopView(): void {
    if (!this.camera || !this.controls || !this.model) return;

    // Get model bounding box
    const boundingBox = new THREE.Box3().setFromObject(this.model);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Get model size
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    // Calculate appropriate distance
    const maxDim = Math.max(size.x, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
    cameraDistance *= 1.5;

    // Position camera
    this.camera.position.set(center.x, center.y + cameraDistance, center.z);
    this.camera.lookAt(center);

    // Update controls
    this.controls.target.copy(center);
    this.controls.update();
  }

  /**
   * Set side view camera position
   */
  public setSideView(): void {
    if (!this.camera || !this.controls || !this.model) return;

    // Get model bounding box
    const boundingBox = new THREE.Box3().setFromObject(this.model);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Get model size
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    // Calculate appropriate distance
    const maxDim = Math.max(size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
    cameraDistance *= 1.5;

    // Position camera
    this.camera.position.set(center.x + cameraDistance, center.y, center.z);
    this.camera.lookAt(center);

    // Update controls
    this.controls.target.copy(center);
    this.controls.update();
  }

  /**
   * Handle window resize
   */
  public handleResize(): void {
    if (!this.container || !this.camera || !this.renderer) return;

    // Get new dimensions
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // Update camera
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(width, height);
  }

  /**
   * Clean up all resources
   */
  public dispose(): void {
    // Prevent double disposal
    if (this.isDisposed) return;

    // Stop animation loop
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Dispose controls
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    // Remove model
    this.removeCurrentModel();

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();

      // Remove canvas from DOM
      if (this.canvas && this.canvas.parentNode) {
        try {
          this.canvas.parentNode.removeChild(this.canvas);
        } catch (e) {
          console.warn("Error removing canvas:", e);
        }
      }

      this.renderer = null;
      this.canvas = null;
    }

    // Clear scene
    if (this.scene) {
      while (this.scene.children.length > 0) {
        const obj = this.scene.children[0];
        this.scene.remove(obj);
      }
      this.scene = null;
    }

    // Clear camera
    this.camera = null;

    // Clear container reference
    this.container = null;

    // Mark as disposed and uninitialized
    this.isDisposed = true;
    this.isInitialized = false;
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

  // PRIVATE METHODS

  /**
   * Set up the Three.js scene
   */
  private setupScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);
  }

  /**
   * Set up the camera
   */
  private setupCamera(): void {
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 10, 20);
  }

  /**
   * Set up the renderer
   */
  private setupRenderer(): void {
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Store canvas reference
    this.canvas = this.renderer.domElement;

    // Add canvas to container
    this.container.appendChild(this.canvas);
  }

  /**
   * Set up the lighting
   */
  private setupLighting(): void {
    if (!this.scene) return;

    // Key light (main directional light)
    const keyLight = new THREE.DirectionalLight("#ffffff", 1);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = true;

    // Improve shadow map quality
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;

    // These parameters are critical for self-shadows:
    keyLight.shadow.bias = -0.0003; // Slightly reduced from -0.0005
    keyLight.shadow.normalBias = 0.02; // Add this to improve shadow quality on sloped surfaces

    // Higher resolution shadow maps for finer detail
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;

    this.scene.add(keyLight);

    // Second directional light to soften shadows
    const fillLight = new THREE.DirectionalLight("#e6e6ff", 0.3);
    fillLight.position.set(-6, 3, 1);
    // Make the fill light cast softer shadows
    fillLight.castShadow = true;
    fillLight.shadow.mapSize.width = 1024;
    fillLight.shadow.mapSize.height = 1024;
    fillLight.shadow.camera.near = 0.1;
    fillLight.shadow.camera.far = 30;
    fillLight.shadow.camera.left = -10;
    fillLight.shadow.camera.right = 10;
    fillLight.shadow.camera.top = 10;
    fillLight.shadow.camera.bottom = -10;
    fillLight.shadow.bias = -0.0002;

    this.scene.add(fillLight);

    // Keep ambient light low for better shadow contrast
    const ambientLight = new THREE.AmbientLight("#222233", 0.15); // Even lower
    this.scene.add(ambientLight);
  }

  /**
   * Set up camera controls
   */
  private setupControls(): void {
    if (!this.camera || !this.canvas) return;

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 800;
  }

  /**
   * Set up the build plate with a see-through bottom
   */
  private setupBuiltPlate(): void {
    if (!this.scene) return;

    // Build plate dimensions
    const width = 200;
    const depth = 120;

    // Create build plate (using a plane instead of a box)
    const geometry = new THREE.PlaneGeometry(width, depth);

    // Rotate the plane to be horizontal (facing up)
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
      color: "#222222",
      roughness: 0.9,
      metalness: 0.1,
      // Only render the top side of the plane
      side: THREE.FrontSide,
      transparent: true,
      opacity: 0.9, // Slightly transparent to see through a bit
    });

    const buildPlate = new THREE.Mesh(geometry, material);

    // Position at y=0 (no need for -1 offset since it's just a plane)
    buildPlate.position.set(0, 0, 0);
    buildPlate.receiveShadow = true;

    this.scene.add(buildPlate);

    // Add grid
    this.addGrid(width, depth);
  }

  /**
   * Add a grid to the build plate with square cells that fits within the boundaries
   */
  private addGrid(width: number, depth: number): void {
    if (!this.scene) return;

    // Create a group to hold all grid lines
    const gridGroup = new THREE.Group();

    // Grid cell size (in mm)
    const cellSize = 10;

    // Calculate number of cells that fit within the dimensions
    const widthCells = Math.floor(width / cellSize);
    const depthCells = Math.floor(depth / cellSize);

    // Line material for the grid
    const gridMaterial = new THREE.LineBasicMaterial({
      color: "#444444",
      transparent: true,
      opacity: 0.5,
    });

    // Half dimensions for easier calculations
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    const y = 0.05; // Slightly above build plate

    // Create lines along the X axis (width)
    for (let i = 0; i <= depthCells; i++) {
      // Calculate position
      const z = i * cellSize - halfDepth;

      // Skip if outside build plate
      if (z > halfDepth) continue;

      // Create line geometry
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-halfWidth, y, z),
        new THREE.Vector3(halfWidth, y, z),
      ]);

      // Create line and add to group
      const line = new THREE.Line(geometry, gridMaterial);
      gridGroup.add(line);
    }

    // Create lines along the Z axis (depth)
    for (let i = 0; i <= widthCells; i++) {
      // Calculate position
      const x = i * cellSize - halfWidth;

      // Skip if outside build plate
      if (x > halfWidth) continue;

      // Create line geometry
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, -halfDepth),
        new THREE.Vector3(x, y, halfDepth),
      ]);

      // Create line and add to group
      const line = new THREE.Line(geometry, gridMaterial);
      gridGroup.add(line);
    }

    // Add grid group to scene
    this.scene.add(gridGroup);

    // Edge outline
    const outlineMaterial = new THREE.LineBasicMaterial({
      color: "#4a88c7",
      linewidth: 2,
    });

    const outlineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfWidth, y, -halfDepth),
      new THREE.Vector3(halfWidth, y, -halfDepth),
      new THREE.Vector3(halfWidth, y, halfDepth),
      new THREE.Vector3(-halfWidth, y, halfDepth),
      new THREE.Vector3(-halfWidth, y, -halfDepth),
    ]);

    const outline = new THREE.Line(outlineGeometry, outlineMaterial);
    this.scene.add(outline);
  }

  /**
   * Start the animation loop
   */
  private startAnimationLoop(): void {
    // Make sure we have the necessary objects
    if (!this.scene || !this.camera || !this.renderer) return;

    // Store references for use in the animation loop
    const scene = this.scene;
    const camera = this.camera;
    const renderer = this.renderer;
    const controls = this.controls;

    // Animation loop function
    const animate = () => {
      // Check if disposed
      if (this.isDisposed) return;

      // Request next frame
      this.animationId = requestAnimationFrame(animate);

      // Update controls
      if (controls) {
        controls.update();
      }

      // Render
      renderer.render(scene, camera);
    };

    // Start the loop
    animate();
  }

  /**
   * Remove the current model
   */
  private removeCurrentModel(): void {
    if (!this.scene || !this.model) return;

    // Remove from scene
    this.scene.remove(this.model);

    // Dispose materials
    if (this.model.material) {
      if (Array.isArray(this.model.material)) {
        this.model.material.forEach((m) => m.dispose());
      } else {
        this.model.material.dispose();
      }
    }

    // Dispose geometry
    if (this.model.geometry) {
      this.model.geometry.dispose();
    }

    // Clear reference
    this.model = null;
  }

  /**
   * Center the model on the build plate
   */
  private centerModel(mesh: THREE.Mesh, geometry: THREE.BufferGeometry): void {
    // Compute bounding box
    geometry.computeBoundingBox();
    if (!geometry.boundingBox) return;

    // Get center
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);

    // Position model so bottom is on build plate (y=0)
    const bottomY = geometry.boundingBox.min.y;
    mesh.position.set(-center.x, -bottomY, -center.z);
  }

  /**
   * Calculate model statistics
   */
  private calculateModelStats(geometry: THREE.BufferGeometry): ModelStats {
    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }

    const size = new THREE.Vector3();
    geometry.boundingBox!.getSize(size);

    return {
      triangleCount: geometry.attributes.position.count / 3,
      dimensions: {
        width: size.x,
        height: size.y,
        depth: size.z,
      },
    };
  }

  /**
   * Update the model material
   */
  private updateModelMaterial(): void {
    if (!this.model) return;

    const material = this.model.material;

    if (Array.isArray(material)) {
      material.forEach((m) => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.color.set(this.config.modelColor);
          m.wireframe = this.config.wireframe;
          m.needsUpdate = true;
        } else if (
          m instanceof THREE.MeshBasicMaterial ||
          m instanceof THREE.MeshPhongMaterial ||
          m instanceof THREE.MeshLambertMaterial
        ) {
          m.wireframe = this.config.wireframe;
          if ("color" in m) m.color.set(this.config.modelColor);
          m.needsUpdate = true;
        }
      });
    } else if (material instanceof THREE.MeshStandardMaterial) {
      material.color.set(this.config.modelColor);
      material.wireframe = this.config.wireframe;
      material.needsUpdate = true;
    } else if (
      material instanceof THREE.MeshBasicMaterial ||
      material instanceof THREE.MeshPhongMaterial ||
      material instanceof THREE.MeshLambertMaterial
    ) {
      material.wireframe = this.config.wireframe;
      if ("color" in material) material.color.set(this.config.modelColor);
      material.needsUpdate = true;
    }
  }

  // Add to src/components/viewer/ThreeJsManager.ts
  public forceWireframeUpdate(wireframeEnabled: boolean): void {
    if (!this.model) return;

    console.log("Forcing wireframe update:", wireframeEnabled);

    const material = this.model.material;

    if (Array.isArray(material)) {
      material.forEach((m) => {
        if (
          m instanceof THREE.MeshBasicMaterial ||
          m instanceof THREE.MeshStandardMaterial ||
          m instanceof THREE.MeshPhongMaterial ||
          m instanceof THREE.MeshLambertMaterial
        ) {
          m.wireframe = wireframeEnabled;
          m.needsUpdate = true;
        }
      });
    } else if (
      material instanceof THREE.MeshBasicMaterial ||
      material instanceof THREE.MeshStandardMaterial ||
      material instanceof THREE.MeshPhongMaterial ||
      material instanceof THREE.MeshLambertMaterial
    ) {
      material.wireframe = wireframeEnabled;
      material.needsUpdate = true;
    }
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
