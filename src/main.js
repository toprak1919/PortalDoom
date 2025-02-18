// src/main.js
import Physics from './systems/Physics.js';
import Input from './systems/Input.js';
import Renderer from './systems/Renderer.js';
import PortalRenderer from './systems/PortalRenderer.js';

import Player from './components/Player.js';
import WeaponManager from './components/WeaponManager.js';
import Portal from './components/Portal.js';
import Enemy from './components/Enemy.js';

let lastTime = 0;

// Initialize player and weapons
const player = new Player();
const weaponManager = new WeaponManager(player);

// Create portals
const portalA = new Portal(0x00ff00); // Green portal
const portalB = new Portal(0xff0000); // Red portal
Renderer.scene.add(portalA.mesh);
Renderer.scene.add(portalB.mesh);

// Create some enemies
const enemies = [
  new Enemy(3, 1, -5),
  new Enemy(-3, 1, -10),
  new Enemy(0, 1, -15)
];

// Add enemies to the scene
enemies.forEach((enemy) => {
  Renderer.scene.add(enemy.mesh);
});

// Portal placement is now handled entirely in Weapon.js

// Animation loop
function animate(time) {
  requestAnimationFrame(animate);

  const delta = (time - lastTime) / 1000;
  lastTime = time;

  Physics.update(delta);
  player.update(delta);
  weaponManager.update(delta);

  // Update portals
  if (portalA.active && portalB.active) {
    // Check for portal teleportation
    const playerPos = player.body.position;
    const distA = portalA.mesh.position.distanceTo(playerPos);
    const distB = portalB.mesh.position.distanceTo(playerPos);

    const threshold = 1.0;
    if (distA < threshold) {
      player.body.position.copy(portalB.mesh.position);
      player.body.velocity.set(0, 0, 0);
    } else if (distB < threshold) {
      player.body.position.copy(portalA.mesh.position);
      player.body.velocity.set(0, 0, 0);
    }

    // Render portal views
    PortalRenderer.renderPortals(portalA, portalB, player);
  }

  // Update enemies
  enemies.forEach((enemy) => enemy.update(delta));

  Renderer.render();
}

animate(0); 