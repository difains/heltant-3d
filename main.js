/**
 * Dragon Raja: Heltant 3D - Main Application Entrypoint
 * Orchestrates Three.js scene, lighting, buildings, physics, lore, and audio loop.
 */
import * as THREE from 'three';
import { LightingManager } from './js/lighting.js';
import { BuildingBuilder } from './js/buildings.js';
import { WorldManager } from './js/world.js';
import { PlayerAvatar } from './js/player.js';
import { PlayerController } from './js/controller.js';
import { LoreManager } from './js/lore.js';
import { Minimap } from './js/minimap.js';
import { sound } from './js/audio.js';

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');

    // 1. Scene, Camera & Renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 2. Lighting & Atmosphere (3dviz-pro-max rig)
    this.lighting = new LightingManager(this.scene);

    // 3. Buildings & Landmarks
    this.builder = new BuildingBuilder(this.scene, this.lighting);

    // Build the 7 iconic landmarks of Heltant
    this.builder.buildCentralWell(0, 0);
    this.builder.buildHoochWorkshop(18, -10);
    this.builder.buildKarlManor(0, -36);
    this.builder.buildTavern(-22, 15);
    this.builder.buildSmithyAndBarracks(16, 22);
    this.builder.buildWesternWatchtower(-38, -8);
    this.builder.buildWatermill(32, 8);

    // Crossroads Braziers
    this.builder.createBrazier(8, 0, 7);
    this.builder.createBrazier(-12, 0, -4);
    this.builder.createBrazier(22, 0, 4);

    // 4. World Environment (Terrain, roads, river, trees, particles)
    this.world = new WorldManager(this.scene, this.builder.colliders);

    // 5. Player Avatar & Controller
    this.avatar = new PlayerAvatar(this.scene);
    this.controller = new PlayerController(
      this.camera,
      this.renderer.domElement,
      this.builder.colliders,
      this.avatar
    );

    // 6. Lore & Interaction Manager
    this.lore = new LoreManager(this.controller, this.lighting, this.avatar);

    // 7. Minimap Radar
    this.minimap = new Minimap('minimap-canvas', this.controller, this.lore.landmarks);

    // 8. Clock & Timing
    this.clock = new THREE.Clock();

    // 9. Window Resizing
    window.addEventListener('resize', () => this.onWindowResize());

    // 10. Start Screen Handler
    this.initStartScreen();

    // Begin Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initStartScreen() {
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');

    startBtn?.addEventListener('click', () => {
      sound.init();
      sound.resume();
      startScreen?.classList.add('hidden');
      this.renderer.domElement.requestPointerLock?.();
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // Update subsystems
    this.controller.update(delta);
    this.builder.update(delta);
    this.world.update(delta, time);
    this.lighting.update(time);
    this.lore.update();
    this.minimap.update();

    // Render 3D Frame
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize Application once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.__heltantApp = new App();
});
