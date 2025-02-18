// src/weapons/BaseWeapon.js
export default class BaseWeapon {
  constructor(name, player) {
    this.name = name;
    this.player = player;
    this.ammo = Infinity; // or a set amount
    this.cooldown = 0;
    this.cooldownTime = 0.5; // Half second between shots
  }

  // Called every frame
  update(delta) {
    if (this.cooldown > 0) {
      this.cooldown -= delta;
    }
  }

  // Called when the weapon is fired
  fire() {
    if (this.cooldown > 0) return;
    if (this.ammo <= 0) {
      console.log('Out of ammo!');
      return;
    }

    console.log(`${this.name} fired!`);
    this.cooldown = this.cooldownTime;
    if (this.ammo !== Infinity) {
      this.ammo--;
    }
  }

  reload() {
    console.log(`${this.name} reloaded!`);
  }
} 