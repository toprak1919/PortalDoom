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

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('mousedown', (e) => {
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
    const result = new Physics.world.rayTestClosest(fromCannon, toCannon);

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
  }

  // Teleport check logic: if player's bounding sphere intersects with a portal, teleport to the other one.
  update() {
    if (!this.portalA.active || !this.portalB.active) return;
    // Distance from player to each portal
    const playerPos = this.player.body.position;
    const distA = this.portalA.mesh.position.distanceTo(playerPos);
    const distB = this.portalB.mesh.position.distanceTo(playerPos);

    // Arbitrary small threshold to detect overlap
    const threshold = 1.0;

    if (distA < threshold) {
      // Teleport from A to B
      this.teleport(this.portalA, this.portalB);
    } else if (distB < threshold) {
      // Teleport from B to A
      this.teleport(this.portalB, this.portalA);
    }
  }

  teleport(fromPortal, toPortal) {
    // Move player position
    this.player.body.position.copy(toPortal.mesh.position);
    // Adjust velocity
    this.player.body.velocity.set(0, 0, 0);

    // Attempt to preserve orientation. A full solution would
    // require adjusting yaw/pitch to match portal normal angles.
  }
}

export default Weapon; 