// src/components/viewer/ThreeJsManager/utils/domManager.ts
/**
 * Safely attaches a renderer's canvas to a container
 * @param container DOM element to attach canvas to
 * @param canvas Canvas element to attach
 */
export function attachRenderer(container: HTMLElement, canvas: HTMLCanvasElement): void {
  try {
    // First make sure the container is empty
    clearContainer(container);

    // Append canvas to container
    container.appendChild(canvas);
  } catch (error) {
    console.error("Error attaching canvas:", error);
  }
}

/**
 * Safely detaches a renderer's canvas from a container
 * @param container DOM element containing the canvas
 * @param canvas Canvas element to detach
 */
export function detachRenderer(container: HTMLElement, canvas: HTMLCanvasElement): void {
  try {
    // Only remove if it's a child of the container
    if (container.contains(canvas)) {
      container.removeChild(canvas);
    }
  } catch (error) {
    console.error("Error detaching canvas:", error);
  }
}

/**
 * Safely clears a container element
 * @param container DOM element to clear
 */
export function clearContainer(container: HTMLElement): void {
  try {
    // Remove all child nodes
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  } catch (error) {
    console.error("Error clearing container:", error);
  }
}

/**
 * Sets CSS styles on an element
 * @param element Element to style
 * @param styles Styles to apply
 */
export function setElementStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  try {
    Object.assign(element.style, styles);
  } catch (error) {
    console.error("Error setting styles:", error);
  }
}

/**
 * Creates a notification overlay on the renderer
 * @param container Container element
 * @param message Message to display
 * @param type Type of notification (info, warning, error)
 * @returns The created notification element
 */
export function createNotification(
  container: HTMLElement,
  message: string,
  type: "info" | "warning" | "error" = "info"
): HTMLElement {
  // Create notification element
  const notification = document.createElement("div");

  // Set styles based on type
  const bgColor =
    type === "error"
      ? "rgba(255,0,0,0.7)"
      : type === "warning"
      ? "rgba(255,165,0,0.7)"
      : "rgba(0,0,255,0.7)";

  // Set styles
  Object.assign(notification.style, {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: bgColor,
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    zIndex: "1000",
    fontFamily: "sans-serif",
    fontSize: "14px",
    textAlign: "center",
    opacity: "0",
    transition: "opacity 0.3s ease",
  });

  // Set message
  notification.innerText = message;

  // Add to container
  container.appendChild(notification);

  // Trigger fade in
  setTimeout(() => {
    notification.style.opacity = "1";
  }, 10);

  // Auto-remove after timeout
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      if (container.contains(notification)) {
        container.removeChild(notification);
      }
    }, 300);
  }, 3000);

  return notification;
}
