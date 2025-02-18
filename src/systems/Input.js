// src/systems/Input.js
class Input {
  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    };

    this.mouseMovementX = 0;
    this.mouseMovementY = 0;

    this.setupKeyboard();
    this.setupPointerLock();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW':
          this.keys.forward = true;
          break;
        case 'KeyS':
          this.keys.backward = true;
          break;
        case 'KeyA':
          this.keys.left = true;
          break;
        case 'KeyD':
          this.keys.right = true;
          break;
        case 'Space':
          this.keys.jump = true;
          break;
        default:
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
          this.keys.forward = false;
          break;
        case 'KeyS':
          this.keys.backward = false;
          break;
        case 'KeyA':
          this.keys.left = false;
          break;
        case 'KeyD':
          this.keys.right = false;
          break;
        case 'Space':
          this.keys.jump = false;
          break;
        default:
          break;
      }
    });
  }

  setupPointerLock() {
    const havePointerLock = 
      'pointerLockElement' in document ||
      'mozPointerLockElement' in document ||
      'webkitPointerLockElement' in document;

    if (!havePointerLock) {
      console.warn('Pointer Lock API not supported');
      return;
    }

    document.addEventListener('click', () => {
      document.body.requestPointerLock =
        document.body.requestPointerLock ||
        document.body.mozRequestPointerLock ||
        document.body.webkitRequestPointerLock;

      if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === document.body) {
        this.mouseMovementX = e.movementX;
        this.mouseMovementY = e.movementY;
      }
    });
  }

  resetMouseDeltas() {
    this.mouseMovementX = 0;
    this.mouseMovementY = 0;
  }
}

export default new Input(); 