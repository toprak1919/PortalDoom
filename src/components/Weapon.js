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
    // Create a group for the entire gun
    this.gunMesh = new THREE.Group();

    // Main body - larger box
    const gunBodyGeo = new THREE.BoxGeometry(0.4, 0.4, 1);
    const gunMat = new THREE.MeshPhongMaterial({ 
      color: 0x558855,
      metalness: 0.7,
      roughness: 0.3
    });
    this.gunBody = new THREE.Mesh(gunBodyGeo, gunMat);

    // Barrel - larger cylinder
    const barrelGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.2, 16);
    const barrelMat = new THREE.MeshPhongMaterial({ 
      color: 0x229922,
      metalness: 0.8,
      roughness: 0.2
    });
    this.barrel = new THREE.Mesh(barrelGeo, barrelMat);
    this.barrel.rotation.x = Math.PI / 2;
    this.barrel.position.set(0, 0, -1.1);

    // Energy core - glowing sphere in the middle
    const coreGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.core.position.set(0, 0.2, -0.3);

    // Top detail
    const topDetailGeo = new THREE.BoxGeometry(0.2, 0.1, 0.4);
    const topDetailMat = new THREE.MeshPhongMaterial({ color: 0x444444 });
    this.topDetail = new THREE.Mesh(topDetailGeo, topDetailMat);
    this.topDetail.position.set(0, 0.25, -0.2);

    // Muzzle flash
    const flashGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    this.muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlash.position.set(0, 0, -0.7);
    this.muzzleFlash.visible = false;

    // Assemble gun parts
    this.gunBody.add(this.barrel);
    this.gunBody.add(this.core);
    this.gunBody.add(this.topDetail);
    this.barrel.add(this.muzzleFlash);
    this.gunMesh.add(this.gunBody);

    // Add to camera
    Renderer.camera.add(this.gunMesh);
    this.gunMesh.position.set(0.5, -0.3, -1.2);

    // Animation properties
    this.defaultGunZ = this.gunMesh.position.z;
    this.defaultGunY = this.gunMesh.position.y;
    this.defaultRotationX = 0;
    this.gunMesh.rotation.x = this.defaultRotationX;
    
    // Animation states
    this.isRecoiling = false;
    this.isRotating = false;
    this.recoilTimer = 0;
    this.rotationTimer = 0;
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

    // Enhanced animation
    this.triggerRecoil();
    this.showMuzzleFlash();
    this.triggerRotation();
  }

  triggerRecoil() {
    this.gunMesh.position.z = this.defaultGunZ + 0.3; // Stronger recoil
    this.gunMesh.position.y = this.defaultGunY + 0.1; // Slight upward kick
    this.isRecoiling = true;
    this.recoilTimer = 0.15;
  }

  triggerRotation() {
    this.gunMesh.rotation.x = this.defaultRotationX - 0.3;
    this.isRotating = true;
    this.rotationTimer = 0.15;
  }

  showMuzzleFlash() {
    this.muzzleFlash.visible = true;
    this.muzzleFlashTimer = 0.1;
    
    // Animate core glow
    this.core.material.emissiveIntensity = 1.0;
  }

  update(delta) {
    // Recoil animation
    if (this.isRecoiling) {
      this.recoilTimer -= delta;
      if (this.recoilTimer <= 0) {
        this.gunMesh.position.z = this.defaultGunZ;
        this.gunMesh.position.y = this.defaultGunY;
        this.isRecoiling = false;
      } else {
        // Smooth return
        const t = 1 - (this.recoilTimer / 0.15);
        this.gunMesh.position.z = this.defaultGunZ + 0.3 * (1 - t);
        this.gunMesh.position.y = this.defaultGunY + 0.1 * (1 - t);
      }
    }

    // Rotation animation
    if (this.isRotating) {
      this.rotationTimer -= delta;
      if (this.rotationTimer <= 0) {
        this.gunMesh.rotation.x = this.defaultRotationX;
        this.isRotating = false;
      } else {
        // Smooth return
        const t = 1 - (this.rotationTimer / 0.15);
        this.gunMesh.rotation.x = this.defaultRotationX - 0.3 * (1 - t);
      }
    }

    // Muzzle flash fade
    if (this.muzzleFlash.visible) {
      this.muzzleFlashTimer -= delta;
      if (this.muzzleFlashTimer <= 0) {
        this.muzzleFlash.visible = false;
        this.core.material.emissiveIntensity = 0.5; // Reset core glow
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