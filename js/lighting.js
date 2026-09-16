/**
 * Dragon Raja: Heltant 3D - Seijaku-Grade Lighting & IBL Environment
 * Implements PMREMGenerator environment reflections, soft contact shadows, and atmospheric sunset gradients.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export class LightingManager {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.currentMode = 'dusk';

    this.initEnvironmentMap();
    this.initLights();
  }

  initEnvironmentMap() {
    // Generate IBL (Image-Based Lighting) for realistic PBR reflections (Seijaku quality)
    if (this.renderer) {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      pmrem.compileEquirectangularShader();
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      this.scene.environment = env;
      this.scene.environmentIntensity = 0.75;
    }
  }

  initLights() {
    // 1. Key directional light (Sun / Moon)
    this.sunLight = new THREE.DirectionalLight(0xffa25e, 3.4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 200;
    const sSize = 75;
    this.sunLight.shadow.camera.left = -sSize;
    this.sunLight.shadow.camera.right = sSize;
    this.sunLight.shadow.camera.top = sSize;
    this.sunLight.shadow.camera.bottom = -sSize;
    this.sunLight.shadow.bias = -0.0003;
    this.sunLight.shadow.normalBias = 0.035;
    this.scene.add(this.sunLight);

    // 2. Fill hemisphere light (Soft ambient sky/ground bounce)
    this.hemiLight = new THREE.HemisphereLight(0x70526a, 0x3d271c, 0.7);
    this.scene.add(this.hemiLight);

    // 3. Rim directional light (Dramatic edge highlights)
    this.rimLight = new THREE.DirectionalLight(0xffcaa0, 0.9);
    this.scene.add(this.rimLight);

    // 4. Point lights for torches & lanterns
    this.flickerLights = [];

    // 5. Atmospheric Fog
    this.fog = new THREE.FogExp2(0x764235, 0.0125);
    this.scene.fog = this.fog;

    this.applyMode('dusk');
  }

  registerFlickerLight(light, baseIntensity = 2.4, color = 0xff9933) {
    this.flickerLights.push({
      light,
      baseIntensity,
      color,
      seed: Math.random() * 100
    });
  }

  applyMode(mode) {
    this.currentMode = mode;
    const dist = 85;

    if (mode === 'dusk') {
      // Golden Hour Sunset over Amstatus's Forest (West, Azimuth 250 deg, Elevation 7 deg)
      const elevRad = THREE.MathUtils.degToRad(7);
      const azRad = THREE.MathUtils.degToRad(250);
      this.sunLight.position.set(
        dist * Math.cos(elevRad) * Math.sin(azRad),
        dist * Math.sin(elevRad),
        dist * Math.cos(elevRad) * Math.cos(azRad)
      );
      this.sunLight.color.setHex(0xff994a);
      this.sunLight.intensity = 3.6;

      this.hemiLight.color.setHex(0x6b4764);
      this.hemiLight.groundColor.setHex(0x382218);
      this.hemiLight.intensity = 0.75;

      this.rimLight.position.set(-30, 25, 40);
      this.rimLight.color.setHex(0xffc288);
      this.rimLight.intensity = 1.0;

      this.scene.background = new THREE.Color(0x663428);
      this.fog.color.setHex(0x703d30);
      this.fog.density = 0.0125;
      if (this.scene.environmentIntensity !== undefined) {
        this.scene.environmentIntensity = 0.8;
      }

    } else if (mode === 'night') {
      // Midnight moonlight with starry atmosphere & warm lanterns
      this.sunLight.position.set(-30, 60, -30);
      this.sunLight.color.setHex(0x446699);
      this.sunLight.intensity = 0.55;

      this.hemiLight.color.setHex(0x121c2e);
      this.hemiLight.groundColor.setHex(0x080c14);
      this.hemiLight.intensity = 0.4;

      this.rimLight.intensity = 0.0;

      this.scene.background = new THREE.Color(0x060910);
      this.fog.color.setHex(0x070b14);
      this.fog.density = 0.017;
      if (this.scene.environmentIntensity !== undefined) {
        this.scene.environmentIntensity = 0.35;
      }

    } else if (mode === 'day') {
      // Crisp Frontier Morning
      this.sunLight.position.set(40, 75, 40);
      this.sunLight.color.setHex(0xfff7e8);
      this.sunLight.intensity = 2.9;

      this.hemiLight.color.setHex(0x8cb6e0);
      this.hemiLight.groundColor.setHex(0x4a5839);
      this.hemiLight.intensity = 0.95;

      this.rimLight.position.set(-45, 20, -45);
      this.rimLight.color.setHex(0xe0ecfa);
      this.rimLight.intensity = 0.6;

      this.scene.background = new THREE.Color(0x82a9ce);
      this.fog.color.setHex(0xa6c2dc);
      this.fog.density = 0.009;
      if (this.scene.environmentIntensity !== undefined) {
        this.scene.environmentIntensity = 0.9;
      }
    }
  }

  cycleMode() {
    const sequence = ['dusk', 'night', 'day'];
    const nextIdx = (sequence.indexOf(this.currentMode) + 1) % sequence.length;
    this.applyMode(sequence[nextIdx]);
    return this.currentMode;
  }

  getModeName() {
    switch (this.currentMode) {
      case 'dusk': return '황혼 석양 (아무르타트)';
      case 'night': return '달빛 밤 (횃불 & 등불)';
      case 'day': return '청명한 아침';
      default: return this.currentMode;
    }
  }

  update(time) {
    // Dynamic torch flame flicker
    for (let i = 0; i < this.flickerLights.length; i++) {
      const item = this.flickerLights[i];
      const noise = Math.sin(time * 8 + item.seed) * 0.25 + Math.sin(time * 19 + item.seed * 2) * 0.15;
      const nightBoost = this.currentMode === 'night' ? 1.5 : 1.0;
      item.light.intensity = Math.max(0.6, (item.baseIntensity + noise) * nightBoost);
    }
  }
}
