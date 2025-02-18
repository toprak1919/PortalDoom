# DOOM-Portal Hybrid Game

A first-person shooter puzzle game that combines the fast-paced action of DOOM with the mind-bending portal mechanics of Portal.

## Project Overview

This MVP will be built using JavaScript and modern web technologies, focusing on core gameplay mechanics while keeping the scope manageable.

### Core Features for MVP

1. First-Person Camera and Movement
   - WASD movement controls
   - Mouse look
   - Basic jumping mechanics
   - Collision detection

2. Portal Mechanics
   - Two-portal system (entry/exit)
   - Portal gun shooting mechanics
   - Basic portal surface detection
   - Portal view rendering
   - Player teleportation between portals

3. Combat Elements
   - Basic weapon system
   - Simple enemy AI
   - Health system
   - Basic combat mechanics

## Technical Stack

- **Engine**: Three.js for 3D rendering
- **Physics**: Cannon.js or Ammo.js for physics calculations
- **Audio**: Howler.js for sound effects
- **Input**: Pointer Lock API for mouse controls
- **Build Tool**: Vite.js for development and building

## Project Structure

```
doom-portal/
├── src/
│   ├── components/
│   │   ├── Player.js
│   │   ├── Portal.js
│   │   ├── Weapon.js
│   │   └── Enemy.js
│   ├── systems/
│   │   ├── Physics.js
│   │   ├── Input.js
│   │   ├── Audio.js
│   │   └── Renderer.js
│   ├── utils/
│   │   ├── MathUtils.js
│   │   └── Constants.js
│   ├── assets/
│   │   ├── models/
│   │   ├── textures/
│   │   └── sounds/
│   └── main.js
├── public/
├── index.html
└── package.json
```

## Development Phases

### Phase 1: Basic Setup and Movement (Week 1)
- [x] Project initialization with Vite.js
- [ ] Three.js scene setup
- [ ] First-person camera implementation
- [ ] Basic WASD movement
- [ ] Mouse look controls
- [ ] Simple test environment

### Phase 2: Portal Mechanics (Week 2-3)
- [ ] Portal gun implementation
- [ ] Portal placement mechanics
- [ ] Portal rendering
- [ ] Portal transport logic
- [ ] Portal surface detection

### Phase 3: Combat System (Week 4)
- [ ] Weapon system
- [ ] Basic enemy AI
- [ ] Health and damage system
- [ ] Simple combat interactions

### Phase 4: Level Design and Polish (Week 5)
- [ ] Basic level design
- [ ] Texture and material implementation
- [ ] Sound effects
- [ ] Basic UI elements
- [ ] Performance optimization

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start development server:
```bash
npm run dev
```

## Dependencies

```json
{
  "dependencies": {
    "three": "^0.160.0",
    "cannon-es": "^0.20.0",
    "howler": "^2.2.4"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

## Controls

- **WASD**: Movement
- **Mouse**: Look around
- **Left Click**: Shoot portal 1
- **Right Click**: Shoot portal 2
- **Space**: Jump
- **E**: Interact
- **R**: Reload
- **1-4**: Switch weapons

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License

## Next Steps After MVP

- Advanced enemy AI
- More weapons and power-ups
- Complex puzzle mechanics
- Multiple levels
- Save/load system
- Multiplayer support
- Advanced graphics and effects
- Custom level editor 