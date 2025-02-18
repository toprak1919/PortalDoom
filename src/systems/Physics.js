// src/systems/Physics.js
import * as CANNON from 'cannon-es';
import { GRAVITY } from '../utils/Constants.js';

class Physics {
  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, GRAVITY, 0);
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;

    this.fixedTimeStep = 1 / 60;
    this.maxSubSteps = 3;

    this.initGround();
  }

  initGround() {
    // Create a simple ground plane
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
    });
    // Rotate plane so it is horizontal
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);
  }

  update(delta) {
    this.world.step(this.fixedTimeStep, delta, this.maxSubSteps);
  }
}

export default new Physics(); 