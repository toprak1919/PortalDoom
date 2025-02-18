// src/components/WeaponManager.js
import Pistol from '../weapons/Pistol.js';

class WeaponManager {
  constructor(player) {
    // Create multiple weapons
    this.weapons = {
      1: new Pistol(player),
      // Add more weapons here as they're implemented
    };
    this.activeWeaponKey = 1;

    // Bind input events
    this.bindWeaponSwitch();
    this.bindFireEvents();
  }

  bindWeaponSwitch() {
    window.addEventListener('keydown', (e) => {
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
        const weaponKey = parseInt(e.code.replace('Digit', ''), 10);
        if (this.weapons[weaponKey]) {
          this.activeWeaponKey = weaponKey;
          console.log(`Switched to ${this.getActiveWeapon().name}`);
        }
      }
      if (e.code === 'KeyR') {
        this.getActiveWeapon().reload();
      }
    });
  }

  bindFireEvents() {
    // Left-click to fire
    window.addEventListener('mousedown', (e) => {
      // Only if pointer locked
      if (document.pointerLockElement !== document.body) return;
      if (e.button === 0) {
        this.getActiveWeapon().fire();
      }
    });
  }

  getActiveWeapon() {
    const weapon = this.weapons[this.activeWeaponKey];
    return weapon || this.weapons[1]; // Default to first weapon if invalid key
  }

  update(delta) {
    this.getActiveWeapon().update(delta);
  }
}

export default WeaponManager; 