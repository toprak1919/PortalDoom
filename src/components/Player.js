// src/components/Player.js
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import Physics from '../systems/Physics.js';
import Input from '../systems/Input.js';
import Renderer from '../systems/Renderer.js';
import { PLAYER_SPEED, JUMP_FORCE } from '../utils/Constants.js';

class Player {
  constructor() {
    // Create a physics body (capsule or sphere)
    const shape = new CANNON.Sphere(0.5);
    this.body = new CANNON.Body({
      mass: 1,
      shape,
      position: new CANNON.Vec3(0, 2, 0),
    });
    Physics.world.addBody(this.body);

    // We'll rotate the camera in code, so store orientation separately.
    this.pitch = 0;
    this.yaw = 0;

    this.canJump = false;

    // Listen for collisions with ground
    this.body.addEventListener('collide', (e) => {
      // Rough check if colliding with ground
      if (Math.abs(this.body.velocity.y) > 1) {
        this.canJump = true;
      }
    });
  }

  update(delta) {
    // Rotate camera based on mouse
    this.yaw -= Input.mouseMovementX * 0.002;
    this.pitch -= Input.mouseMovementY * 0.002;
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

    // Apply rotation to the camera
    Renderer.camera.rotation.x = this.pitch;
    Renderer.camera.rotation.y = this.yaw;

    // Movement vector in local space
    const forwardVector = new THREE.Vector3(0, 0, -1);
    const rightVector = new THREE.Vector3(1, 0, 0);

    // Rotate them by yaw
    forwardVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    let moveX = 0;
    let moveZ = 0;

    if (Input.keys.forward) moveZ += 1;
    if (Input.keys.backward) moveZ -= 1;
    if (Input.keys.left) moveX -= 1;
    if (Input.keys.right) moveX += 1;

    const moveSpeed = PLAYER_SPEED * delta;
    const velocity = this.body.velocity;

    // Project old velocity onto the movement plane
    // to preserve some inertia
    const vel = new THREE.Vector3(velocity.x, velocity.y, velocity.z);

    // Calculate the movement direction
    const moveDir = new THREE.Vector3();
    moveDir.addScaledVector(forwardVector, moveZ);
    moveDir.addScaledVector(rightVector, moveX);
    moveDir.normalize();

    // Set horizontal velocity (ignore y)
    vel.x = moveDir.x * moveSpeed * 50;
    vel.z = moveDir.z * moveSpeed * 50;

    if (Input.keys.jump && this.canJump) {
      vel.y = JUMP_FORCE;
      this.canJump = false;
    }

    this.body.velocity.set(vel.x, vel.y, vel.z);

    // Update camera position to match the physics body
    Renderer.camera.position.set(
      this.body.position.x,
      this.body.position.y + 0.5, // offset
      this.body.position.z
    );

    // Reset mouse deltas after using them
    Input.resetMouseDeltas();
  }
}

export default Player; 