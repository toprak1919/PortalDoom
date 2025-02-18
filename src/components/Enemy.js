// src/components/Enemy.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Physics from '../systems/Physics.js';

export default class Enemy {
  constructor(x, y, z) {
    this.health = 100;
    this.maxHealth = 100;
    this.isDead = false;

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial({ color: 0xffaa00 })
    );
    this.mesh.position.set(x, y, z);

    const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    this.body = new CANNON.Body({
      mass: 1,
      shape,
      position: new CANNON.Vec3(x, y, z)
    });

    // Add reference to this enemy instance on the body for weapon raycasting
    this.body.isEnemy = true;
    this.body.enemy = this;

    Physics.world.addBody(this.body);

    this.speed = 2;
    this.direction = 1;
  }

  takeDamage(amount) {
    if (this.isDead) return;

    this.health = Math.max(0, this.health - amount);
    console.log(`Enemy took ${amount} damage. Health: ${this.health}`);

    // Update material color based on health percentage
    const healthPercent = this.health / this.maxHealth;
    this.mesh.material.color.setRGB(
      1,
      healthPercent * 0.7,
      0
    );

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    console.log('Enemy died!');

    // Start death animation or particle effect
    this.mesh.material.transparent = true;
    this.fadeOut();
  }

  fadeOut() {
    if (this.mesh.material.opacity > 0) {
      this.mesh.material.opacity -= 0.05;
      requestAnimationFrame(() => this.fadeOut());
    } else {
      // Remove from scene and physics world
      this.mesh.removeFromParent();
      Physics.world.removeBody(this.body);
    }
  }

  update(delta) {
    if (this.isDead) return;

    // Move left-right
    this.body.position.x += this.direction * this.speed * delta;

    // If we go too far, reverse direction
    if (this.body.position.x > 5) {
      this.direction = -1;
    } else if (this.body.position.x < -5) {
      this.direction = 1;
    }

    // Sync Three.js mesh with Cannon body
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
} 