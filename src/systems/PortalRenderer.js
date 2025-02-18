// src/systems/PortalRenderer.js
import * as THREE from 'three';
import Renderer from './Renderer.js';

class PortalRenderer {
  constructor() {
    // One render target per portal
    this.renderTargetA = new THREE.WebGLRenderTarget(1024, 1024);
    this.renderTargetB = new THREE.WebGLRenderTarget(1024, 1024);

    // Secondary cameras for each portal
    this.portalCameraA = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.portalCameraB = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
  }

  renderPortals(portalA, portalB, player) {
    const mainRenderer = Renderer.renderer;
    const scene = Renderer.scene;

    // If either portal is inactive, skip
    if (!portalA.active || !portalB.active) return;

    // 1. Position & orient portalCameraA at portalB's position/orientation
    //    so it "looks out" from Portal B to the scene.
    this._positionPortalCamera(portalA, portalB, this.portalCameraA, player);

    // Render scene from that camera
    mainRenderer.setRenderTarget(this.renderTargetA);
    mainRenderer.render(scene, this.portalCameraA);
    portalA.mesh.material.map = this.renderTargetA.texture;

    // 2. Position & orient portalCameraB at portalA's position/orientation
    this._positionPortalCamera(portalB, portalA, this.portalCameraB, player);

    // Render scene from that camera
    mainRenderer.setRenderTarget(this.renderTargetB);
    mainRenderer.render(scene, this.portalCameraB);
    portalB.mesh.material.map = this.renderTargetB.texture;

    // Reset main renderer
    mainRenderer.setRenderTarget(null);
  }

  _positionPortalCamera(sourcePortal, targetPortal, portalCam, player) {
    // The simplest approach is to place the portalCam exactly where the targetPortal is,
    // and orient it similarly. You can also offset it by the player's relative position.
    portalCam.position.copy(targetPortal.mesh.position);

    // For orientation, we assume the portal is a plane facing outward.
    // If you want to "match" the player's viewpoint, you can compute an offset rotation.
    portalCam.quaternion.copy(targetPortal.mesh.quaternion);

    // Example: rotate 180 degrees if you want it to look "out" from the plane instead of in
    // Let's say our plane geometry faces the local +Z direction:
    const flip = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));
    portalCam.quaternion.multiply(flip);

    // Alternatively, you might want to replicate the player's orientation relative to the portals.
    // This gets complicated quickly; the approach depends on your desired "portal logic".
    portalCam.updateProjectionMatrix();
  }
}

export default new PortalRenderer(); 