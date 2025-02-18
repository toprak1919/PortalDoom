import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Physics from './Physics.js';

class MapGenerator {
  constructor(scene) {
    this.scene = scene;
    this.textureLoader = new THREE.TextureLoader();
    this.wallMaterial = null;
    this.floorMaterial = null;
    this.loadTextures();
  }

  loadTextures() {
    // Load and set up textures
    const wallTexture = this.textureLoader.load('/textures/doom_wall.jpg');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2);

    const floorTexture = this.textureLoader.load('/textures/doom_floor.jpg');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);

    this.wallMaterial = new THREE.MeshPhongMaterial({ 
      map: wallTexture,
      roughness: 0.7,
      metalness: 0.3
    });

    this.floorMaterial = new THREE.MeshPhongMaterial({ 
      map: floorTexture,
      roughness: 0.8,
      metalness: 0.2
    });
  }

  generateRoom(width, height, depth, position = { x: 0, y: 0, z: 0 }) {
    const room = new THREE.Group();

    // Floor
    const floorGeo = new THREE.PlaneGeometry(width, depth);
    const floor = new THREE.Mesh(floorGeo, this.floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(position.x, position.y, position.z);
    room.add(floor);

    // Add floor physics
    const floorShape = new CANNON.Box(new CANNON.Vec3(width/2, 0.1, depth/2));
    const floorBody = new CANNON.Body({ mass: 0 });
    floorBody.addShape(floorShape);
    floorBody.position.set(position.x, position.y, position.z);
    Physics.world.addBody(floorBody);

    // Walls
    const createWall = (w, h, d, x, y, z, rotY = 0) => {
      const wallGeo = new THREE.BoxGeometry(w, h, d);
      const wall = new THREE.Mesh(wallGeo, this.wallMaterial);
      wall.position.set(x, y + h/2, z);
      wall.rotation.y = rotY;
      room.add(wall);

      // Add wall physics
      const wallShape = new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2));
      const wallBody = new CANNON.Body({ mass: 0 });
      wallBody.addShape(wallShape);
      wallBody.position.set(x, y + h/2, z);
      wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotY);
      Physics.world.addBody(wallBody);
    };

    // Create four walls
    createWall(width, height, 1, position.x, position.y, position.z + depth/2); // Front
    createWall(width, height, 1, position.x, position.y, position.z - depth/2); // Back
    createWall(1, height, depth, position.x - width/2, position.y, position.z, Math.PI/2); // Left
    createWall(1, height, depth, position.x + width/2, position.y, position.z, -Math.PI/2); // Right

    this.scene.add(room);
    return room;
  }

  generateCorridor(length, width, height, position = { x: 0, y: 0, z: 0 }, rotation = 0) {
    const corridor = new THREE.Group();

    // Floor
    const floorGeo = new THREE.PlaneGeometry(width, length);
    const floor = new THREE.Mesh(floorGeo, this.floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(position.x, position.y, position.z);
    corridor.add(floor);

    // Walls
    const wallLeft = new THREE.Mesh(
      new THREE.BoxGeometry(1, height, length),
      this.wallMaterial
    );
    wallLeft.position.set(position.x - width/2, position.y + height/2, position.z);
    corridor.add(wallLeft);

    const wallRight = new THREE.Mesh(
      new THREE.BoxGeometry(1, height, length),
      this.wallMaterial
    );
    wallRight.position.set(position.x + width/2, position.y + height/2, position.z);
    corridor.add(wallRight);

    corridor.rotation.y = rotation;
    this.scene.add(corridor);
    return corridor;
  }

  generateRandomMap(numRooms = 5) {
    const rooms = [];
    const roomSize = { width: 20, height: 10, depth: 20 };
    const spacing = 25;

    for (let i = 0; i < numRooms; i++) {
      const x = (Math.random() - 0.5) * spacing * numRooms;
      const z = (Math.random() - 0.5) * spacing * numRooms;
      
      const room = this.generateRoom(
        roomSize.width,
        roomSize.height,
        roomSize.depth,
        { x, y: 0, z }
      );
      rooms.push(room);

      // Add some random obstacles in the room
      this.addRandomObstacles(x, z, roomSize);
    }

    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
      const prevRoom = rooms[i - 1];
      const currentRoom = rooms[i];
      
      const startX = prevRoom.position.x;
      const startZ = prevRoom.position.z;
      const endX = currentRoom.position.x;
      const endZ = currentRoom.position.z;
      
      this.generateCorridor(
        Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endZ - startZ, 2)),
        5,
        roomSize.height,
        {
          x: (startX + endX) / 2,
          y: 0,
          z: (startZ + endZ) / 2
        },
        Math.atan2(endZ - startZ, endX - startX)
      );
    }

    return rooms;
  }

  addRandomObstacles(roomX, roomZ, roomSize) {
    const numObstacles = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 0; i < numObstacles; i++) {
      const x = roomX + (Math.random() - 0.5) * (roomSize.width - 4);
      const z = roomZ + (Math.random() - 0.5) * (roomSize.depth - 4);
      
      // Create either a column or a box
      if (Math.random() > 0.5) {
        this.createColumn(x, 0, z, 3);
      } else {
        this.createBox(x, 0, z);
      }
    }
  }

  createColumn(x, y, z, height = 3) {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, height, 8);
    const mesh = new THREE.Mesh(geometry, this.wallMaterial);
    mesh.position.set(x, y + height/2, z);
    this.scene.add(mesh);

    // Add physics
    const shape = new CANNON.Cylinder(0.5, 0.5, height, 8);
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    body.position.set(x, y + height/2, z);
    Physics.world.addBody(body);
  }

  createBox(x, y, z) {
    const size = { width: 2, height: 2, depth: 2 };
    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const mesh = new THREE.Mesh(geometry, this.wallMaterial);
    mesh.position.set(x, y + size.height/2, z);
    this.scene.add(mesh);

    // Add physics
    const shape = new CANNON.Box(new CANNON.Vec3(size.width/2, size.height/2, size.depth/2));
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    body.position.set(x, y + size.height/2, z);
    Physics.world.addBody(body);
  }
}

export default MapGenerator; 