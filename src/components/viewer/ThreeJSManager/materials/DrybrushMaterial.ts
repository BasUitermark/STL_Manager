// src/components/viewer/ThreeJsManager/materials/DrybrushMaterial.ts

import * as THREE from "three";

/**
 * Creates a custom drybrush shader material
 */
export function createDrybrushMaterial(options: {
  baseColor: string;
  highlightColor: string;
  intensity: number;
  wireframe: boolean;
}): THREE.ShaderMaterial {
  // Convert colors to THREE.Color objects
  const baseColorObj = new THREE.Color(options.baseColor);
  const highlightColorObj = new THREE.Color(options.highlightColor);

  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: baseColorObj },
      highlightColor: { value: highlightColorObj },
      intensity: { value: options.intensity },
      // Used for edge detection
      edgeWidth: { value: 1.0 },
    },
    vertexShader: `
      // Vertex normal in view space (will be used in fragment shader)
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      void main() {
        // Pass the normal to the fragment shader
        vNormal = normalMatrix * normal;
        
        // Transform position to clip space
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz; // View direction
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform vec3 highlightColor;
      uniform float intensity;
      uniform float edgeWidth;
      
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      void main() {
        // Normalize the vertex normal
        vec3 normal = normalize(vNormal);
        
        // Compute view direction
        vec3 viewDir = normalize(vViewPosition);
        
        // Compute the dot product between normal and view direction
        float dotNV = abs(dot(normal, viewDir));
        
        // Fresnel-like effect (edges get more highlight)
        float fresnel = pow(1.0 - dotNV, 3.0) * intensity;
        
        // Mix between base color and highlight color based on fresnel factor
        vec3 color = mix(baseColor, highlightColor, fresnel);
        
        // Output the final color
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    wireframe: options.wireframe,
  });
}
