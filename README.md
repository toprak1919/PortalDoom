# DOOM-Portal Hybrid Game

A first-person shooter puzzle game that combines the fast-paced action of DOOM with the mind-bending portal mechanics of Portal, built with Three.js and modern web technologies.

## Features

### Core Mechanics
- **First-Person Controls**
  - WASD movement
  - Mouse look
  - Jumping with physics
  - Collision detection

### Portal System
- Two-portal system (entry/exit)
- Portal gun mechanics
- Surface detection for portal placement
- Real-time portal view rendering
- Seamless teleportation

### Combat System
- Weapon management system
- Multiple weapons support
- Ammo system with reloading
- Enemy health system
- Basic combat mechanics

### Graphics
- 3D rendering with Three.js
- Physics simulation with Cannon.js
- Portal view rendering using render-to-texture
- Basic lighting and materials

## Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)
- A modern web browser with WebGL support

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd PortalDoom
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal)

## Controls

- **WASD**: Movement
- **Mouse**: Look around
- **Space**: Jump
- **Left Click**: Fire weapon
- **Right Click**: Place red portal
- **Left Click**: Place green portal (when in portal mode)
- **1-4**: Switch weapons
- **R**: Reload weapon
- **Esc**: Unlock mouse pointer

## Project Structure

```
doom-portal/
├── src/
│   ├── components/
│   │   ├── Player.js       # Player controls and physics
│   │   ├── Portal.js       # Portal mechanics
│   │   ├── Enemy.js        # Enemy behavior and health
│   │   └── WeaponManager.js # Weapon switching and management
│   ├── weapons/
│   │   ├── BaseWeapon.js   # Base weapon class
│   │   └── Pistol.js       # Pistol implementation
│   ├── systems/
│   │   ├── Physics.js      # Physics world setup
│   │   ├── Input.js        # Input handling
│   │   ├── Renderer.js     # Three.js setup
│   │   ├── PortalRenderer.js # Portal view rendering
│   │   └── Audio.js        # Sound system
│   ├── utils/
│   │   ├── MathUtils.js    # Math helper functions
│   │   └── Constants.js    # Game constants
│   └── main.js             # Entry point
├── public/                 # Static assets
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
└── vite.config.js         # Vite configuration
```

## Technical Details

### Rendering
- Uses Three.js for 3D graphics
- Portal rendering using render-to-texture technique
- Dynamic lighting and materials

### Physics
- Cannon.js (cannon-es) for physics simulation
- Collision detection for portals and combat
- Player movement with proper physics

### Game Systems
- Weapon system with extensible base class
- Enemy system with health and damage
- Portal system with view rendering
- Input system with pointer lock

## Development

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Known Issues

- Portal rendering might have visual artifacts at certain angles
- Physics interactions through portals are simplified
- Enemy AI is currently basic

## Future Enhancements

- [ ] Advanced enemy AI with pathfinding
- [ ] More weapons (Shotgun, Rocket Launcher)
- [ ] Puzzle mechanics (buttons, doors)
- [ ] Level system with multiple maps
- [ ] Save/load system
- [ ] Advanced graphics effects
- [ ] Sound effects and music
- [ ] Multiplayer support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js for 3D rendering
- Cannon.js for physics
- Vite.js for development tooling
- DOOM and Portal for inspiration 