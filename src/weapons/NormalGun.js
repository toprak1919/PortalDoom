// src/weapons/NormalGun.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import BaseWeapon from './BaseWeapon.js';
import Physics from '../systems/Physics.js';
import Renderer from '../systems/Renderer.js';

class NormalGun extends BaseWeapon {
  constructor(player) {
    super('NormalGun', player);
    this.ammo = 30;
    this.maxAmmo = 30;
    this.cooldownTime = 0.2;
    this.damage = 25;
    this.createNormalGunMesh();
  }

  createNormalGunMesh() {
    // Remove default mesh
    Renderer.camera.remove(this.gunMesh);
    this.gunMesh = new THREE.Group();

    // Create a more detailed gun mesh
    const gunBody = new THREE.BoxGeometry(0.3, 0.3, 0.8);
    const gunMat = new THREE.MeshPhongMaterial({ 
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.3
    });
    this.body = new THREE.Mesh(gunBody, gunMat);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
    const barrelMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    this.barrel = new THREE.Mesh(barrelGeo, barrelMat);
    this.barrel.rotation.z = Math.PI / 2;
    this.barrel.position.set(0, 0, -0.6);

    // Muzzle flash
    const flashGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xff9933,
      transparent: true,
      opacity: 0.8
    });
    this.muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlash.position.set(0, 0, -0.8);
    this.muzzleFlash.visible = false;
    this.muzzleFlashTimer = 0;

    // Assemble gun
    this.gunMesh.add(this.body);
    this.gunMesh.add(this.barrel);
    this.gunMesh.add(this.muzzleFlash);

    // Add to camera
    Renderer.camera.add(this.gunMesh);
    this.gunMesh.position.set(0.5, -0.3, -1);
    this.gunMesh.visible = false;

    // Animation properties
    this.defaultPosition = this.gunMesh.position.clone();
    this.recoilAmount = 0.1;
    this.isRecoiling = false;
    this.recoilTimer = 0;
  }

  fire() {
    if (this.cooldown > 0) return;
    if (this.ammo <= 0) {
      console.log('Out of ammo! Press R to reload!');
      return;
    }

    // Raycast for hit detection
    const direction = new THREE.Vector3(0, 0, -1)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.yaw)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.player.pitch);

    const rayFrom = new CANNON.Vec3(
      this.player.body.position.x,
      this.player.body.position.y + 0.5,
      this.player.body.position.z
    );
    const rayTo = new CANNON.Vec3(
      rayFrom.x + direction.x * 100,
      rayFrom.y + direction.y * 100,
      rayFrom.z + direction.z * 100
    );

    const result = Physics.world.rayTest(rayFrom, rayTo);
    if (result.hasHit) {
      const hitBody = result.body;
      if (hitBody.isEnemy) {
        hitBody.enemy.takeDamage(this.damage);
      }
    }

    // Visual and gameplay effects
    this.triggerRecoil();
    this.showMuzzleFlash();
    this.ammo--;
    this.cooldown = this.cooldownTime;
  }

  triggerRecoil() {
    this.gunMesh.position.z = this.defaultPosition.z + this.recoilAmount;
    this.isRecoiling = true;
    this.recoilTimer = 0.1;
  }

  showMuzzleFlash() {
    this.muzzleFlash.visible = true;
    this.muzzleFlashTimer = 0.05;
  }

  update(delta) {
    super.update(delta);

    // Handle recoil animation
    if (this.isRecoiling) {
      this.recoilTimer -= delta;
      if (this.recoilTimer <= 0) {
        this.gunMesh.position.z = this.defaultPosition.z;
        this.isRecoiling = false;
      }
    }

    // Handle muzzle flash
    if (this.muzzleFlash.visible) {
      this.muzzleFlashTimer -= delta;
      if (this.muzzleFlashTimer <= 0) {
        this.muzzleFlash.visible = false;
      }
    }
  }
}

export default NormalGun; 