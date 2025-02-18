// src/components/Portal.js
import * as THREE from 'three';

export default class Portal {
  constructor(color = 0x0000ff) {
    // Create a plane to visualize portal
    const geometry = new THREE.PlaneGeometry(1, 2);
    const material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide
    });
    this.mesh = new THREE.Mesh(geometry, material);

    // Keep track of active/inactive
    this.active = false;
  }

  setPositionAndNormal(position, normal) {
    this.mesh.position.copy(position);
    // Align the portal plane with the normal
    // Quick hack: rotate plane to face normal
    const up = new THREE.Vector3(0, 0, 1);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
    this.mesh.quaternion.copy(quaternion);

    this.active = true;
  }
} 