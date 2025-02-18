import * as THREE from 'three';

class PixelationPass {
  constructor(resolution = 4) {
    this.resolution = resolution;
    this.pixelSize = 1 / resolution;

    // Create render targets
    this.setupRenderTargets();
    this.setupFinalPass();
  }

  setupRenderTargets() {
    const pixelWidth = Math.floor(window.innerWidth / this.resolution);
    const pixelHeight = Math.floor(window.innerHeight / this.resolution);

    this.renderTarget = new THREE.WebGLRenderTarget(pixelWidth, pixelHeight, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat
    });
  }

  setupFinalPass() {
    this.finalScene = new THREE.Scene();
    this.finalCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Create a full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({
      map: this.renderTarget.texture,
      transparent: true
    });

    this.finalQuad = new THREE.Mesh(geometry, material);
    this.finalScene.add(this.finalQuad);
  }

  onWindowResize() {
    const pixelWidth = Math.floor(window.innerWidth / this.resolution);
    const pixelHeight = Math.floor(window.innerHeight / this.resolution);
    this.renderTarget.setSize(pixelWidth, pixelHeight);
  }

  render(renderer, scene, camera) {
    // First render the scene at low resolution
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(scene, camera);

    // Then render the pixelated result to the screen
    renderer.setRenderTarget(null);
    renderer.render(this.finalScene, this.finalCamera);
  }
}

export default PixelationPass; 