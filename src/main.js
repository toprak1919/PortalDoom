// src/main.js
import * as THREE from 'three';
import Physics from './systems/Physics.js';
import Input from './systems/Input.js';
import Renderer from './systems/Renderer.js';
import Player from './components/Player.js';
import PortalGun from './weapons/PortalGun.js';
import NormalGun from './weapons/NormalGun.js';
import Enemy from './components/Enemy.js';
import MapGenerator from './systems/MapGenerator.js';
import PixelationPass from './systems/PixelationPass.js';

// Game state
let isGameStarted = false;
let lastTime = 0;
let player = null;
let weapons = {};
let activeWeaponIndex = 1;
let enemies = [];
let health = 100;

// UI Elements
const startMenu = document.getElementById('start-menu');
const gameUI = document.getElementById('game-ui');
const healthDisplay = document.getElementById('health');
const ammoDisplay = document.getElementById('ammo');
const weaponSlots = document.querySelectorAll('.weapon-slot');

// Initialize game systems
const pixelationPass = new PixelationPass(4); // 4x pixel size
const mapGenerator = new MapGenerator(Renderer.scene);

function initGame() {
  console.log('Initializing game...');
  
  // Create player
  player = new Player();
  console.log('Player created');

  // Initialize weapons
  weapons = {
    1: new PortalGun(player),
    2: new NormalGun(player)
  };
  weapons[1].activate(); // Start with portal gun
  console.log('Weapons initialized');

  // Generate random map
  const rooms = mapGenerator.generateRandomMap(5);
  console.log('Map generated with', rooms.length, 'rooms');

  // Spawn enemies in random rooms
  rooms.forEach(room => {
    if (Math.random() > 0.5) {
      const x = room.position.x + (Math.random() - 0.5) * 10;
      const z = room.position.z + (Math.random() - 0.5) * 10;
      const enemy = new Enemy(x, 1, z);
      enemies.push(enemy);
      Renderer.scene.add(enemy.mesh);
    }
  });
  console.log('Enemies spawned:', enemies.length);

  // Request pointer lock for FPS controls
  document.body.requestPointerLock = document.body.requestPointerLock || 
                                   document.body.mozRequestPointerLock ||
                                   document.body.webkitRequestPointerLock;
  
  document.body.addEventListener('click', () => {
    if (document.pointerLockElement !== document.body) {
      document.body.requestPointerLock();
    }
  });

  // Bind weapon switching
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key >= '1' && key <= '2') {
      switchWeapon(parseInt(key));
    }
  });

  // Bind weapon slots UI
  weaponSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      const weaponId = parseInt(slot.dataset.weapon);
      switchWeapon(weaponId);
    });
  });

  // Bind shooting
  window.addEventListener('mousedown', (e) => {
    if (document.pointerLockElement !== document.body) return;

    const activeWeapon = weapons[activeWeaponIndex];
    if (activeWeapon) {
      activeWeapon.fire();
      updateHUD();
    }
  });

  // Bind reloading
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') {
      const activeWeapon = weapons[activeWeaponIndex];
      if (activeWeapon) {
        activeWeapon.reload();
        updateHUD();
      }
    }
  });

  // Initialize Input system
  Input.init();
  console.log('Input system initialized');
}

function switchWeapon(index) {
  if (weapons[activeWeaponIndex]) {
    weapons[activeWeaponIndex].deactivate();
  }
  
  activeWeaponIndex = index;
  weapons[activeWeaponIndex].activate();

  // Update UI
  weaponSlots.forEach(slot => {
    const slotIndex = parseInt(slot.dataset.weapon);
    slot.classList.toggle('active', slotIndex === activeWeaponIndex);
  });

  updateHUD();
}

function updateHUD() {
  const activeWeapon = weapons[activeWeaponIndex];
  healthDisplay.textContent = `HEALTH: ${health}`;
  ammoDisplay.textContent = `AMMO: ${activeWeapon.ammo === Infinity ? '∞' : activeWeapon.ammo}`;
}

function startGame() {
  console.log('Starting game...');
  isGameStarted = true;
  startMenu.style.display = 'none';
  gameUI.style.display = 'block';
  
  initGame();
  lastTime = performance.now();
  requestAnimationFrame(animate);
  console.log('Game started!');
}

function animate(time) {
  if (!isGameStarted) return;

  requestAnimationFrame(animate);

  const delta = Math.min((time - lastTime) / 1000, 0.1); // Cap delta at 0.1s to prevent huge jumps
  lastTime = time;

  // Update physics and game state
  Physics.update(delta);
  
  if (player) {
    player.update(delta);
  }

  // Update active weapon
  const activeWeapon = weapons[activeWeaponIndex];
  if (activeWeapon) {
    activeWeapon.update(delta);
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (enemy.health <= 0) {
      // Remove dead enemies
      Renderer.scene.remove(enemy.mesh);
      Physics.world.remove(enemy.body);
      enemies.splice(i, 1);
    } else {
      enemy.update(delta);
    }
  }

  // Render with pixelation effect
  pixelationPass.render(Renderer.renderer, Renderer.scene, Renderer.camera);

  // Update HUD
  updateHUD();
}

// Start menu button handler
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, setting up start button...');
  const startButton = document.getElementById('start-button');
  if (startButton) {
    startButton.addEventListener('click', () => {
      console.log('Start button clicked!');
      startGame();
    });
  } else {
    console.error('Start button not found!');
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  Renderer.onWindowResize();
  pixelationPass.onWindowResize();
}); 