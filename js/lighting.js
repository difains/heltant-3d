/**
 * Dragon Raja: Heltant 3D - Lighting & Atmosphere Rig
 * Based on 3dviz-pro-max standards (dusk golden hour, night lanterns, crisp day).
 */
import * as THREE from 'three';

export class LightingManager {
  constructor(scene) {
    this.scene = scene;
    this.currentMode = 'dusk'; // 'dusk' | 'night' | 'day'

    // Key directional light (Sun / Moon)
    this.sunLight = new THREE.DirectionalLight(0xffb46b, 3.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 180;
    const sSize = 65;
    this.sunLight.shadow.camera.left = -sSize;
    this.sunLight.shadow.camera.right = sSize;
    this.sunLight.shadow.camera.top = sSize;
    this.sunLight.shadow.camera.bottom = -sSize;
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.normalBias = 0.04;
    this.scene.add(this.sunLight);

    // Fill hemisphere light
    this.hemiLight = new THREE.HemisphereLight(0x6f8fc9, 0x4a3a2a, 0.65);
    this.scene.add(this.hemiLight);

    // Rim light from the east for dramatic silhouette
    this.rimLight = new THREE.DirectionalLight(0xffd9a8, 0.8);
    this.scene.add(this.rimLight);

    // Point lights for torches / lanterns (flickering collection)
    this.flickerLights = [];

    // Scene Fog
    this.fog = new THREE.FogExp2(0x8a5542, 0.013);
    this.scene.fog = this.fog;

    this.applyMode('dusk');
  }

  registerFlickerLight(light, baseIntensity = 2.0, color = 0xff9233) {
    this.flickerLights.push({
      light,
      baseIntensity,
      color,
      seed: Math.random() * 100
    });
  }

  applyMode(mode) {
    this.currentMode = mode;
    const dist = 70;

    if (mode === 'dusk') {
      // Sunset over Amstatus's Forest (West, Azimuth ~250 deg, Elevation ~7 deg)
      const elevRad = THREE.MathUtils.degToRad(7);
      const azRad = THREE.MathUtils.degToRad(250);
      this.sunLight.position.set(
        dist * Math.cos(elevRad) * Math.sin(azRad),
        dist * Math.sin(elevRad),
        dist * Math.cos(elevRad) * Math.cos(azRad)
      );
      this.sunLight.color.setHex(0xff8a42);
      this.sunLight.intensity = 3.2;

      this.hemiLight.color.setHex(0x5a486b);
      this.hemiLight.groundColor.setHex(0x3d271c);
      this.hemiLight.intensity = 0.7;

      this.rimLight.position.set(-30, 20, 30);
      this.rimLight.color.setHex(0xffc58d);
      this.rimLight.intensity = 0.8;

      this.scene.background = new THREE.Color(0x733e32);
      this.fog.color.setHex(0x7d493a);
      this.fog.density = 0.013;

    } else if (mode === 'night') {
      // Midnight moonlight with starry atmosphere
      this.sunLight.position.set(-20, 50, -30);
      this.sunLight.color.setHex(0x5577aa);
      this.sunLight.intensity = 0.6;

      this.hemiLight.color.setHex(0x18243b);
      this.hemiLight.groundColor.setHex(0x0c111a);
      this.hemiLight.intensity = 0.45;

      this.rimLight.intensity = 0.0;

      this.scene.background = new THREE.Color(0x080c14);
      this.fog.color.setHex(0x090e18);
      this.fog.density = 0.018;

    } else if (mode === 'day') {
      // Crisp Frontier Morning
      this.sunLight.position.set(35, 60, 45);
      this.sunLight.color.setHex(0xfffaea);
      this.sunLight.intensity = 2.8;

      this.hemiLight.color.setHex(0x94bce6);
      this.hemiLight.groundColor.setHex(0x526040);
      this.hemiLight.intensity = 0.9;

      this.rimLight.position.set(-40, 20, -40);
      this.rimLight.color.setHex(0xe3efff);
      this.rimLight.intensity = 0.5;

      this.scene.background = new THREE.Color(0x8eb4da);
      this.fog.color.setHex(0xaec7df);
      this.fog.density = 0.009;
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
      case 'dusk': return '황혼 석양 (아무르타트의 숲)';
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
      const nightBoost = this.currentMode === 'night' ? 1.4 : 1.0;
      item.light.intensity = Math.max(0.4, (item.baseIntensity + noise) * nightBoost);
    }
  }
}
