// src/weapons/Pistol.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import BaseWeapon from './BaseWeapon.js';
import Physics from '../systems/Physics.js';

export default class Pistol extends BaseWeapon {
  constructor(player) {
    super('Pistol', player);
    this.ammo = 12;
    this.maxAmmo = 12;
    this.reloadTime = 1.5;
    this.cooldownTime = 0.25; // 4 shots per second
    this.damage = 20;
  }

  fire() {
    if (this.cooldown > 0) return;
    if (this.ammo <= 0) {
      console.log('Out of ammo! Press R to reload!');
      return;
    }

    // Get player's view direction
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.yaw);
    direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.player.pitch);

    // Create raycast from player position
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

    // Perform raycast
    const result = Physics.world.rayTest(rayFrom, rayTo);

    if (result.hasHit) {
      const hitBody = result.body;
      // Check if we hit an enemy
      if (hitBody.isEnemy) {
        hitBody.enemy.takeDamage(this.damage);
      }
    }

    // Update ammo and cooldown
    this.ammo--;
    this.cooldown = this.cooldownTime;
    console.log('Pistol fired. Ammo left:', this.ammo);
  }

  reload() {
    if (this.ammo === this.maxAmmo) return;
    this.ammo = this.maxAmmo;
    console.log('Pistol reloaded. Ammo:', this.ammo);
  }
} 