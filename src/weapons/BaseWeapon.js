// src/weapons/BaseWeapon.js
import * as THREE from 'three';
import Renderer from '../systems/Renderer.js';

class BaseWeapon {
  constructor(name, player) {
    this.name = name;
    this.player = player;
    this.ammo = Infinity;
    this.maxAmmo = Infinity;
    this.cooldown = 0;
    this.cooldownTime = 0.5;
    this.damage = 0;
    this.isActive = false;

    // Base weapon mesh
    this.createWeaponMesh();
  }

  createWeaponMesh() {
    this.gunMesh = new THREE.Group();
    
    // Default weapon appearance - should be overridden by specific weapons
    const gunGeo = new THREE.BoxGeometry(0.2, 0.2, 0.5);
    const gunMat = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const gunBody = new THREE.Mesh(gunGeo, gunMat);
    this.gunMesh.add(gunBody);

    // Add to camera but hide initially
    Renderer.camera.add(this.gunMesh);
    this.gunMesh.position.set(0.5, -0.3, -0.7);
    this.gunMesh.visible = false;
  }

  activate() {
    this.isActive = true;
    this.gunMesh.visible = true;
  }

  deactivate() {
    this.isActive = false;
    this.gunMesh.visible = false;
  }

  update(delta) {
    if (this.cooldown > 0) {
      this.cooldown -= delta;
    }
  }

  fire() {
    // To be implemented by specific weapons
    console.warn('fire() not implemented');
  }

  reload() {
    if (this.ammo === this.maxAmmo) return;
    this.ammo = this.maxAmmo;
    console.log(`${this.name} reloaded. Ammo: ${this.ammo}`);
  }
}

export default BaseWeapon; 