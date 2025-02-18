// src/main.js
import * as THREE from 'three';
import Physics from './systems/Physics.js';
import Input from './systems/Input.js';
import Renderer from './systems/Renderer.js';
import PortalRenderer from './systems/PortalRenderer.js';

import Player from './components/Player.js';
import WeaponManager from './components/WeaponManager.js';
import Portal from './components/Portal.js';
import Enemy from './components/Enemy.js';
import Weapon from './components/Weapon.js';

let lastTime = 0;

// Initialize player and weapons
const player = new Player();
const weaponManager = new WeaponManager(player);
const weapon = new Weapon(player);

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

// === MINI-MAP SETUP ===
const miniMapSize = { width: 200, height: 200 };
const miniMapCam = new THREE.OrthographicCamera(
  -25, 25, 25, -25, 0.1, 200
);
miniMapCam.position.set(0, 50, 0);
miniMapCam.lookAt(0, 0, 0);
Renderer.scene.add(miniMapCam);

// === HUD SETUP ===
const setupHUD = () => {
  const hud = document.createElement('div');
  hud.id = 'doom-hud';
  hud.innerHTML = `
    <div id="doom-stats">
      <div id="doom-health">HEALTH: 100</div>
      <div id="doom-ammo">AMMO: ∞</div>
    </div>
    <div id="doom-minimap"></div>
  `;
  document.body.appendChild(hud);

  // Style the HUD
  const style = document.createElement('style');
  style.textContent = `
    #doom-hud {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      pointer-events: none;
      font-family: "Impact", sans-serif;
      color: #ff0000;
      text-shadow: 2px 2px 2px #000;
    }
    #doom-stats {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 2rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid #ff0000;
      font-size: 24px;
    }
    #doom-minimap {
      position: absolute;
      top: 20px;
      left: 20px;
      width: ${miniMapSize.width}px;
      height: ${miniMapSize.height}px;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid #ff0000;
    }
  `;
  document.head.appendChild(style);
};

setupHUD();

// Game state
let health = 100;
const updateHUD = () => {
  document.getElementById('doom-health').textContent = `HEALTH: ${health}`;
  document.getElementById('doom-ammo').textContent = 'AMMO: ∞';
};

function animate(time) {
  requestAnimationFrame(animate);

  const delta = (time - lastTime) / 1000;
  lastTime = time;

  Physics.update(delta);
  player.update(delta);
  weaponManager.update(delta);
  weapon.update(delta);

  // Main scene render
  Renderer.render();

  // Mini-map render
  Renderer.renderer.setViewport(20, window.innerHeight - miniMapSize.height - 20, 
    miniMapSize.width, miniMapSize.height);
  Renderer.renderer.setScissor(20, window.innerHeight - miniMapSize.height - 20,
    miniMapSize.width, miniMapSize.height);
  Renderer.renderer.setScissorTest(true);

  // Update minimap camera position
  miniMapCam.position.x = player.body.position.x;
  miniMapCam.position.z = player.body.position.z;
  miniMapCam.updateProjectionMatrix();

  // Render minimap
  Renderer.renderer.render(Renderer.scene, miniMapCam);

  // Reset to main viewport
  Renderer.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  Renderer.renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
  Renderer.renderer.setScissorTest(false);

  // Update HUD
  updateHUD();

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
}

animate(0);

// Handle window resize
window.addEventListener('resize', () => {
  Renderer.onWindowResize();
}); 