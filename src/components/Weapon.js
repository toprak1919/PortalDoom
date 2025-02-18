// src/components/Weapon.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Renderer from '../systems/Renderer.js';
import Portal from './Portal.js';
import Physics from '../systems/Physics.js';
import { PORTAL_DISTANCE } from '../utils/Constants.js';

class Weapon {
  constructor(player) {
    this.player = player;

    this.portalA = new Portal(0x00ff00);
    this.portalB = new Portal(0xff0000);

    Renderer.scene.add(this.portalA.mesh);
    Renderer.scene.add(this.portalB.mesh);

    this.portalA.active = false;
    this.portalB.active = false;

    // Create portal gun mesh and muzzle flash
    this.createPortalGunMesh();

    this.bindEvents();
  }

  createPortalGunMesh() {
    // Create gun body
    const gunGeo = new THREE.BoxGeometry(0.2, 0.2, 0.5);
    const gunMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
    this.gunMesh = new THREE.Mesh(gunGeo, gunMat);

    // Add gun to camera
    Renderer.camera.add(this.gunMesh);

    // Position gun in camera space
    this.gunMesh.position.set(0.5, -0.3, -0.7);

    // Store original Z for recoil
    this.defaultGunZ = this.gunMesh.position.z;
    this.isRecoiling = false;
    this.recoilTimer = 0;

    // Create muzzle flash
    const flashGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.muzzleFlash = new THREE.Mesh(flashGeo, flashMat);

    // Add muzzle flash to gun tip
    this.gunMesh.add(this.muzzleFlash);
    this.muzzleFlash.position.set(0, 0, -0.3);
    this.muzzleFlash.visible = false;
    this.muzzleFlashTimer = 0;
  }

  bindEvents() {
    window.addEventListener('mousedown', (e) => {
      if (document.pointerLockElement !== document.body) return;

      // Left click = 0, Right click = 2
      if (e.button === 0) {
        this.shootPortal(this.portalA);
      } else if (e.button === 2) {
        this.shootPortal(this.portalB);
      }
    });
  }

  shootPortal(portal) {
    // Raycast from camera to find collision point in 3D
    const rayFrom = new THREE.Vector3(
      this.player.body.position.x,
      this.player.body.position.y + 0.5,
      this.player.body.position.z
    );
    const cameraDirection = new THREE.Vector3(0, 0, -1)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.yaw)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.player.pitch);

    // Convert to Cannon Vec3
    const fromCannon = new CANNON.Vec3(rayFrom.x, rayFrom.y, rayFrom.z);
    const toCannon = new CANNON.Vec3(
      rayFrom.x + cameraDirection.x * PORTAL_DISTANCE,
      rayFrom.y + cameraDirection.y * PORTAL_DISTANCE,
      rayFrom.z + cameraDirection.z * PORTAL_DISTANCE
    );

    // Use Cannon raycast
    const result = Physics.world.rayTestClosest(fromCannon, toCannon);

    if (result.hasHit) {
      // Position the portal
      const hitPoint = new THREE.Vector3(
        result.hitPointWorld.x,
        result.hitPointWorld.y,
        result.hitPointWorld.z
      );
      const normal = new THREE.Vector3(
        result.hitNormalWorld.x,
        result.hitNormalWorld.y,
        result.hitNormalWorld.z
      );
      portal.setPositionAndNormal(hitPoint, normal);
    }

    // Trigger recoil and muzzle flash
    this.triggerRecoil();
    this.showMuzzleFlash();
  }

  triggerRecoil() {
    this.gunMesh.position.z = this.defaultGunZ - 0.1;
    this.isRecoiling = true;
    this.recoilTimer = 0.1; // Recoil lasts 0.1 seconds
  }

  showMuzzleFlash() {
    this.muzzleFlash.visible = true;
    this.muzzleFlashTimer = 0.05; // Flash for 0.05 seconds
  }

  update(delta) {
    // Update recoil
    if (this.isRecoiling) {
      this.recoilTimer -= delta;
      if (this.recoilTimer <= 0) {
        this.gunMesh.position.z = this.defaultGunZ;
        this.isRecoiling = false;
      }
    }

    // Update muzzle flash
    if (this.muzzleFlash.visible) {
      this.muzzleFlashTimer -= delta;
      if (this.muzzleFlashTimer <= 0) {
        this.muzzleFlash.visible = false;
      }
    }

    // Portal teleport logic
    if (!this.portalA.active || !this.portalB.active) return;

    const playerPos = this.player.body.position;
    const distA = this.portalA.mesh.position.distanceTo(playerPos);
    const distB = this.portalB.mesh.position.distanceTo(playerPos);

    const threshold = 1.0;
    if (distA < threshold) {
      this.teleport(this.portalA, this.portalB);
    } else if (distB < threshold) {
      this.teleport(this.portalB, this.portalA);
    }
  }

  teleport(fromPortal, toPortal) {
    this.player.body.position.copy(toPortal.mesh.position);
    this.player.body.velocity.set(0, 0, 0);
  }
}

export default Weapon; 