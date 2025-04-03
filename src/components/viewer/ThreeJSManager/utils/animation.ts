// src/components/viewer/ThreeJsManager/utils/animation.ts
import { SceneState, AnimationState } from "../types";

/**
 * Starts the animation loop for rendering
 * @param state Scene state
 */
export function startAnimationLoop(state: SceneState): void {
  // Skip if animation is already running
  if (state.animation.isRunning) return;

  // Mark as running
  state.animation.isRunning = true;

  // Animation function
  const animate = () => {
    // Check if we should stop
    if (!state.animation.isRunning) return;

    // Request next frame
    state.animation.id = requestAnimationFrame(animate);

    // Update controls if they exist
    if (state.controls) {
      state.controls.update();
    }

    // Render the scene
    if (state.renderer && state.scene && state.camera) {
      state.renderer.render(state.scene, state.camera);
    }
  };

  // Start the animation loop
  animate();
}

/**
 * Stops the animation loop
 * @param animation Animation state
 */
export function stopAnimationLoop(animation: AnimationState): void {
  // Mark as not running
  animation.isRunning = false;

  // Cancel the animation frame if it exists
  if (animation.id !== null) {
    cancelAnimationFrame(animation.id);
    animation.id = null;
  }
}

/**
 * Pauses the animation loop (can be restarted)
 * @param animation Animation state
 */
export function pauseAnimationLoop(animation: AnimationState): void {
  animation.isRunning = false;

  if (animation.id !== null) {
    cancelAnimationFrame(animation.id);
    // Don't null out the ID so we know it was paused, not stopped
  }
}

/**
 * Forces a single frame render
 * @param state Scene state
 */
export function renderSingleFrame(state: SceneState): void {
  if (state.renderer && state.scene && state.camera) {
    state.renderer.render(state.scene, state.camera);
  }
}
