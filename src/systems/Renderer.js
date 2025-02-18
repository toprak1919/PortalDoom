// src/systems/Renderer.js
import * as THREE from 'three';

class Renderer {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x300000); // Dark red DOOM-like

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.8, 5);

    // Add camera to scene so we can parent objects to it
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Basic lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    this.scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambient);

    // === DOOM-LIKE FLOOR & WALLS ===
    const textureLoader = new THREE.TextureLoader();
    
    // Floor setup
    const floorTexture = textureLoader.load('/textures/doom_floor.jpg');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(20, 20);

    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshPhongMaterial({ 
      map: floorTexture,
      roughness: 0.8,
      metalness: 0.2
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // Wall setup
    const wallTexture = textureLoader.load('/textures/doom_wall.jpg');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(5, 2);

    const wallMat = new THREE.MeshPhongMaterial({ 
      map: wallTexture,
      roughness: 0.7,
      metalness: 0.3
    });

    const createWall = (width, height, depth, x, y, z, rotY = 0) => {
      const geo = new THREE.BoxGeometry(width, height, depth);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(x, y, z);
      mesh.rotation.y = rotY;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      return mesh;
    };

    // Four walls around player (like a DOOM room)
    this.walls = {
      back: createWall(50, 10, 1, 0, 5, -25, 0),
      front: createWall(50, 10, 1, 0, 5, 25, Math.PI),
      left: createWall(1, 10, 50, -25, 5, 0, -Math.PI/2),
      right: createWall(1, 10, 50, 25, 5, 0, Math.PI/2)
    };

    // Enable shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    light.castShadow = true;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export default new Renderer(); 