/**
 * Dragon Raja: Heltant 3D - Main Application (Seijaku-Grade Cinematic Pipeline)
 * Orchestrates UnrealBloomPass, ACES Filmic tonemapping, IBL reflections,
 * Cinematic Camera Tour mode, and audio equalizer sync.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

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

    // 1. Scene & Renderer Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15; // Calibrated for Bloom
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 2. Lighting & IBL Environment Manager
    this.lighting = new LightingManager(this.scene, this.renderer);

    // 3. Post-Processing Pipeline (Seijaku-Grade UnrealBloom)
    this.initPostProcessing();

    // 4. Buildings & Landmarks (Dream Target Level)
    this.builder = new BuildingBuilder(this.scene, this.lighting);
    this.builder.buildCentralWell(0, 0);
    this.builder.buildHoochWorkshop(18, -10);
    this.builder.buildKarlManor(0, -36);
    this.builder.buildTavern(-22, 15);
    this.builder.buildSmithyAndBarracks(16, 22);
    this.builder.buildWesternWatchtower(-38, -8);
    this.builder.buildWatermill(32, 8);

    // Street Braziers at Crossroads
    this.builder.createBrazier(8, 0, 7);
    this.builder.createBrazier(-12, 0, -4);
    this.builder.createBrazier(22, 0, 4);

    // 5. World Environment (Wet Cobblestones, Stream, God Rays, Amstatus Dragon)
    this.world = new WorldManager(this.scene, this.builder.colliders);

    // 6. Player Avatar & Controller
    this.avatar = new PlayerAvatar(this.scene);
    this.controller = new PlayerController(
      this.camera,
      this.renderer.domElement,
      this.builder.colliders,
      this.avatar
    );

    // 7. Lore & Interaction Manager
    this.lore = new LoreManager(this.controller, this.lighting, this.avatar);

    // 8. Minimap Radar
    this.minimap = new Minimap('minimap-canvas', this.controller, this.lore.landmarks);

    // 9. Cinematic Camera Tour System
    this.initCinematicTour();

    // 10. Clock & Window Events
    this.clock = new THREE.Clock();
    window.addEventListener('resize', () => this.onWindowResize());

    // 11. Start Screen & Ambience UI
    this.initStartScreen();
    this.initAmbienceUI();

    // Begin Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initPostProcessing() {
    this.renderPass = new RenderPass(this.scene, this.camera);

    // Selective Bloom (Glow from lanterns, candles, sunset, and windows)
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.82, // strength
      0.45, // radius
      0.72  // threshold
    );

    this.outputPass = new OutputPass();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(this.outputPass);
  }

  initCinematicTour() {
    this.isTourActive = false;
    this.tourProgress = 0;
    this.tourWaypoints = [
      // 1. Village Plaza looking North at Karl's Manor
      { pos: new THREE.Vector3(0, 4.5, 14), target: new THREE.Vector3(0, 3.5, -20), duration: 8 },
      // 2. West Watchtower & Sunset with Amstatus Dragon
      { pos: new THREE.Vector3(-14, 5.0, 4), target: new THREE.Vector3(-85, 30, -15), duration: 10 },
      // 3. Hooch's Candle Workshop & glowing lantern
      { pos: new THREE.Vector3(12, 3.2, -4), target: new THREE.Vector3(18, 3.2, -10), duration: 7 },
      // 4. Heltant Tavern & warm hearth
      { pos: new THREE.Vector3(-14, 3.0, 10), target: new THREE.Vector3(-22, 3.0, 15), duration: 7 },
      // 5. Sanson's Smithy & glowing forge
      { pos: new THREE.Vector3(10, 3.2, 16), target: new THREE.Vector3(16, 2.8, 22), duration: 7 }
    ];

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyC') {
        this.toggleCinematicTour();
      }
      // Any WASD movement cancels tour mode
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code) && this.isTourActive) {
        this.toggleCinematicTour(false);
      }
    });
  }

  toggleCinematicTour(forceState) {
    this.isTourActive = (forceState !== undefined) ? forceState : !this.isTourActive;
    const tourLabel = document.getElementById('tour-mode-label');
    if (tourLabel) {
      tourLabel.textContent = this.isTourActive ? 'ON (순환)' : 'OFF';
      tourLabel.style.color = this.isTourActive ? '#ffd479' : '';
    }
    const crosshair = document.getElementById('crosshair');
    if (crosshair) {
      crosshair.classList.toggle('hidden', this.isTourActive || this.controller.viewMode === 'third');
    }
  }

  updateCinematicTour(delta) {
    if (!this.isTourActive) return;

    this.tourProgress += delta * 0.15;
    const totalWp = this.tourWaypoints.length;
    const currentIdx = Math.floor(this.tourProgress) % totalWp;
    const nextIdx = (currentIdx + 1) % totalWp;
    const alpha = this.tourProgress % 1.0;

    // Smooth cosine interpolation
    const easeAlpha = 0.5 - 0.5 * Math.cos(alpha * Math.PI);

    const wp1 = this.tourWaypoints[currentIdx];
    const wp2 = this.tourWaypoints[nextIdx];

    this.camera.position.lerpVectors(wp1.pos, wp2.pos, easeAlpha);
    const lookTarget = new THREE.Vector3().lerpVectors(wp1.target, wp2.target, easeAlpha);
    this.camera.lookAt(lookTarget);
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

  initAmbienceUI() {
    const ambienceBtn = document.getElementById('ambience-control');
    const label = document.getElementById('ambience-label');
    const eqBars = document.getElementById('audio-eq');

    ambienceBtn?.addEventListener('click', () => {
      sound.init();
      sound.resume();
      const isMuted = sound.toggleMute();
      if (label) label.textContent = isMuted ? 'AMBIENCE : OFF' : 'AMBIENCE : ON';
      if (eqBars) eqBars.style.opacity = isMuted ? '0.3' : '1.0';
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. Controller & Camera
    if (this.isTourActive) {
      this.updateCinematicTour(delta);
    } else {
      this.controller.update(delta);
    }

    // 2. Scene Updates
    this.builder.update(delta);
    this.world.update(delta, time);
    this.lighting.update(time);
    this.lore.update();
    this.minimap.update();

    // 3. Render Post-Processing (Bloom + ACES Tone Mapping)
    this.composer.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.__heltantApp = new App();
});
