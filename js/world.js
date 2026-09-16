/**
 * Dragon Raja: Heltant 3D - Seijaku-Grade Environment & World Systems
 * Implements wet cobblestone paths, reflective water canal, God Rays sun glow,
 * drifting golden leaves, and the Black Dragon Amstatus (석양의 감시자 아무르타트).
 */
import * as THREE from 'three';

export class WorldManager {
  constructor(scene, colliders) {
    this.scene = scene;
    this.colliders = colliders;
    this.particles = [];
    this.waterMesh = null;

    this.initTerrain();
    this.initRoads();
    this.initStreamAndBridge();
    this.initTreesAndVegetation();
    this.initPropsAndDetails();
    this.initParticles();
    this.initAmstatusDragonSilhouette();
    this.initSunsetGodRays();
  }

  initTerrain() {
    const size = 160;
    const geom = new THREE.PlaneGeometry(size, size, 32, 32);
    geom.rotateX(-Math.PI / 2);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3c3222';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle mossy earth gradients
    ctx.fillStyle = 'rgba(56, 74, 38, 0.4)';
    for (let i = 0; i < 450; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 10 + Math.random() * 30;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const groundTex = new THREE.CanvasTexture(canvas);
    groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(12, 12);

    const mat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.9,
      metalness: 0.05
    });

    const ground = new THREE.Mesh(geom, mat);
    ground.receiveShadow = true;
    ground.position.y = -0.05;
    this.scene.add(ground);

    const bHalf = size / 2 - 5;
    this.colliders.push({ minX: -bHalf, maxX: bHalf, minZ: -bHalf, maxZ: -bHalf + 2, name: 'North Boundary' });
    this.colliders.push({ minX: -bHalf, maxX: bHalf, minZ: bHalf - 2, maxZ: bHalf, name: 'South Boundary' });
    this.colliders.push({ minX: -bHalf, maxX: -bHalf + 2, minZ: -bHalf, maxZ: bHalf, name: 'West Boundary' });
    this.colliders.push({ minX: bHalf - 2, maxX: bHalf, minZ: -bHalf, maxZ: bHalf, name: 'East Boundary' });
  }

  initRoads() {
    // Wet Cobblestone Paving (Dream Target aesthetic)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#443e37';
    ctx.fillRect(0, 0, 512, 512);

    // Individual rounded pavers
    const pw = 28, ph = 18;
    for (let y = 0; y < 512; y += ph) {
      const shift = (Math.floor(y / ph) % 2 === 0) ? 0 : 14;
      for (let x = -14 + shift; x < 512; x += pw) {
        ctx.fillStyle = '#221f1c'; // Mortar
        ctx.fillRect(x, y, pw, ph);

        // Stone top
        ctx.fillStyle = (Math.random() > 0.4) ? '#5c5449' : '#696053';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, pw - 4, ph - 4, 3);
        ctx.fill();

        // Wet stone specular sheen
        ctx.fillStyle = 'rgba(255, 230, 200, 0.15)';
        ctx.fillRect(x + 3, y + 3, pw - 6, 2);
      }
    }

    const roadTex = new THREE.CanvasTexture(canvas);
    roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(1, 10);

    // Low roughness gives realistic wet-stone reflections
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.52,
      metalness: 0.25
    });

    const roads = [
      { x: 0, z: -18, w: 5.2, l: 36, rot: 0 },
      { x: 9, z: -5, w: 4.6, l: 20, rot: Math.PI / 2.3 },
      { x: -18, z: 8, w: 4.8, l: 26, rot: -Math.PI / 3 },
      { x: 8, z: 12, w: 4.6, l: 24, rot: Math.PI / 4 },
      { x: -20, z: -4, w: 5.4, l: 38, rot: Math.PI / 2 },
      { x: 18, z: 4, w: 4.6, l: 30, rot: Math.PI / 2 }
    ];

    roads.forEach(r => {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.l), roadMat);
      plane.rotateX(-Math.PI / 2);
      plane.rotateZ(r.rot);
      plane.position.set(r.x, 0.03, r.z);
      plane.receiveShadow = true;
      this.scene.add(plane);
    });
  }

  initStreamAndBridge() {
    const streamL = 150;
    const streamW = 7.0;
    const riverBedGeom = new THREE.PlaneGeometry(streamW, streamL);
    riverBedGeom.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1a4555,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.88
    });

    this.waterMesh = new THREE.Mesh(riverBedGeom, waterMat);
    this.waterMesh.position.set(27, 0.06, 0);
    this.scene.add(this.waterMesh);

    // Stone Arch Bridge
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(27, 0, 4);

    const archMat = new THREE.MeshStandardMaterial({ color: 0x58534c, roughness: 0.85, metalness: 0.1 });
    const arch = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.7, 4.4), archMat);
    arch.position.y = 0.55;
    arch.castShadow = true;
    arch.receiveShadow = true;
    bridgeGroup.add(arch);

    [-2.1, 2.1].forEach(rz => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.85, 0.35), archMat);
      rail.position.set(0, 1.2, rz);
      rail.castShadow = true;
      bridgeGroup.add(rail);
    });

    this.scene.add(bridgeGroup);
  }

  initTreesAndVegetation() {
    const pineTrunkGeom = new THREE.CylinderGeometry(0.35, 0.5, 3.8, 8);
    const pineFoliageGeom = new THREE.ConeGeometry(2.6, 7.0, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b2515, roughness: 0.9 });
    const darkPineMat = new THREE.MeshStandardMaterial({ color: 0x182c1c, roughness: 0.85 });
    const autumnMat = new THREE.MeshStandardMaterial({ color: 0x9a3e1b, roughness: 0.82 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xb57821, roughness: 0.82 });

    // Western Dark Pine Forest
    for (let i = 0; i < 70; i++) {
      const tree = new THREE.Group();
      const tx = -44 - Math.random() * 35;
      const tz = -65 + Math.random() * 130;
      const scale = 0.85 + Math.random() * 0.75;

      const trunk = new THREE.Mesh(pineTrunkGeom, trunkMat);
      trunk.position.y = 1.9;
      trunk.castShadow = true;
      tree.add(trunk);

      for (let t = 0; t < 3; t++) {
        const needle = new THREE.Mesh(pineFoliageGeom, darkPineMat);
        needle.position.y = 3.8 + t * 2.3;
        needle.scale.set(1.0 - t * 0.22, 1.0 - t * 0.15, 1.0 - t * 0.22);
        needle.castShadow = true;
        tree.add(needle);
      }

      tree.position.set(tx, 0, tz);
      tree.scale.set(scale, scale, scale);
      this.scene.add(tree);
      this.colliders.push({ minX: tx - 0.8, maxX: tx + 0.8, minZ: tz - 0.8, maxZ: tz + 0.8, name: 'Pine Tree' });
    }

    // Village Autumn Trees
    const villageTrees = [
      [11, -22], [5, 19], [-12, -18], [-8, 22], [28, -25], [26, 26], [-28, -28], [-18, 30]
    ];
    villageTrees.forEach(([vx, vz], idx) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.55, 4.2, 8), trunkMat);
      trunk.position.y = 2.1;
      trunk.castShadow = true;
      tree.add(trunk);

      const folMat = (idx % 2 === 0) ? autumnMat : goldMat;
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(3.0, 1), folMat);
      foliage.position.y = 5.5;
      foliage.castShadow = true;
      tree.add(foliage);

      tree.position.set(vx, 0, vz);
      this.scene.add(tree);
      this.colliders.push({ minX: vx - 0.9, maxX: vx + 0.9, minZ: vz - 0.9, maxZ: vz + 0.9, name: 'Autumn Tree' });
    });
  }

  initPropsAndDetails() {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4f3724, roughness: 0.88 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x242428, roughness: 0.4, metalness: 0.8 });

    // Wooden Crates & Stacks near Central Plaza
    const crateGeom = new THREE.BoxGeometry(1.1, 1.1, 1.1);
    const crateCoords = [
      [5.5, 0.55, -2.5], [6.6, 0.55, -2.5], [6.0, 1.65, -2.5],
      [-5.8, 0.55, 3.5], [-6.8, 0.55, 3.5]
    ];
    crateCoords.forEach(([cx, cy, cz]) => {
      const crate = new THREE.Mesh(crateGeom, woodMat);
      crate.position.set(cx, cy, cz);
      crate.castShadow = true;
      crate.receiveShadow = true;
      this.scene.add(crate);
    });

    // Market Stall with Striped Canopy
    const stall = new THREE.Group();
    stall.position.set(-6.5, 0, -8.0);
    const counter = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 1.4), woodMat);
    counter.position.y = 0.55;
    stall.add(counter);

    [-1.4, 1.4].forEach(px => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8), woodMat);
      pole.position.set(px, 1.4, 0.6);
      stall.add(pole);
    });

    const canopyGeom = new THREE.BoxGeometry(3.6, 0.15, 2.0);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0xa84832, roughness: 0.7 });
    const canopy = new THREE.Mesh(canopyGeom, canopyMat);
    canopy.position.set(0, 2.8, 0.2);
    canopy.rotation.x = 0.2;
    stall.add(canopy);

    this.scene.add(stall);
    this.colliders.push({ minX: -8.5, maxX: -4.5, minZ: -9.5, maxZ: -6.5, name: 'Market Stall' });
  }

  initParticles() {
    // 1. Chimney Smoke
    const smokeCount = 45;
    const smokeGeom = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    const smokeVel = [];

    const chimneys = [
      { x: 14.5, y: 8.0, z: -12.0 },
      { x: -22.0, y: 8.5, z: 12.0 },
      { x: -3.5, y: 11.0, z: -38.0 }
    ];

    for (let i = 0; i < smokeCount; i++) {
      const c = chimneys[i % chimneys.length];
      smokePos[i * 3] = c.x + (Math.random() - 0.5) * 0.5;
      smokePos[i * 3 + 1] = c.y + Math.random() * 4.5;
      smokePos[i * 3 + 2] = c.z + (Math.random() - 0.5) * 0.5;
      smokeVel.push({
        baseX: c.x,
        baseY: c.y,
        baseZ: c.z,
        vy: 0.9 + Math.random() * 0.8,
        driftX: (Math.random() - 0.5) * 0.3
      });
    }
    smokeGeom.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));

    const smokeMat = new THREE.PointsMaterial({
      color: 0xdfd4c2,
      size: 1.8,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });

    const smokeSystem = new THREE.Points(smokeGeom, smokeMat);
    this.scene.add(smokeSystem);

    this.particles.push({
      update: (delta) => {
        for (let i = 0; i < smokeCount; i++) {
          smokePos[i * 3 + 1] += smokeVel[i].vy * delta;
          smokePos[i * 3] += (smokeVel[i].driftX + 0.18) * delta;
          if (smokePos[i * 3 + 1] > smokeVel[i].baseY + 6.5) {
            smokePos[i * 3] = smokeVel[i].baseX + (Math.random() - 0.5) * 0.5;
            smokePos[i * 3 + 1] = smokeVel[i].baseY;
            smokePos[i * 3 + 2] = smokeVel[i].baseZ + (Math.random() - 0.5) * 0.5;
          }
        }
        smokeGeom.attributes.position.needsUpdate = true;
      }
    });

    // 2. Drifting Golden Autumn Leaves (Seijaku atmosphere)
    const leafCount = 60;
    const leafGeom = new THREE.BufferGeometry();
    const leafPos = new Float32Array(leafCount * 3);
    const leafVel = [];

    for (let i = 0; i < leafCount; i++) {
      leafPos[i * 3] = (Math.random() - 0.5) * 80;
      leafPos[i * 3 + 1] = 0.5 + Math.random() * 12;
      leafPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      leafVel.push({
        vx: 0.8 + Math.random() * 0.6,
        vy: -0.4 - Math.random() * 0.3,
        vz: (Math.random() - 0.5) * 0.4,
        sway: Math.random() * Math.PI * 2
      });
    }
    leafGeom.setAttribute('position', new THREE.BufferAttribute(leafPos, 3));

    const leafMat = new THREE.PointsMaterial({
      color: 0xdf8432,
      size: 0.35,
      transparent: true,
      opacity: 0.85
    });

    const leafSystem = new THREE.Points(leafGeom, leafMat);
    this.scene.add(leafSystem);

    this.particles.push({
      update: (delta) => {
        for (let i = 0; i < leafCount; i++) {
          leafVel[i].sway += delta * 2.0;
          leafPos[i * 3] += (leafVel[i].vx + Math.sin(leafVel[i].sway) * 0.3) * delta;
          leafPos[i * 3 + 1] += leafVel[i].vy * delta;
          leafPos[i * 3 + 2] += leafVel[i].vz * delta;

          if (leafPos[i * 3 + 1] < 0.2) {
            leafPos[i * 3] = -40 + Math.random() * 20;
            leafPos[i * 3 + 1] = 6 + Math.random() * 6;
            leafPos[i * 3 + 2] = (Math.random() - 0.5) * 70;
          }
        }
        leafGeom.attributes.position.needsUpdate = true;
      }
    });
  }

  initSunsetGodRays() {
    // Volumetric Sun Disc & God Rays in Western Sky (Dream Target)
    const sunGroup = new THREE.Group();
    sunGroup.position.set(-95, 26, -18);

    // Glowing Sun Disc (Triggers UnrealBloomPass)
    const sunDisc = new THREE.Mesh(
      new THREE.CircleGeometry(7.0, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffe2a8,
        transparent: true,
        opacity: 0.95
      })
    );
    sunDisc.lookAt(0, 5, 0);
    sunGroup.add(sunDisc);

    // Radial God Ray Corona
    const rayDisc = new THREE.Mesh(
      new THREE.CircleGeometry(24.0, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff8833,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending
      })
    );
    rayDisc.lookAt(0, 5, 0);
    sunGroup.add(rayDisc);

    this.scene.add(sunGroup);
  }

  initAmstatusDragonSilhouette() {
    // Black Dragon Amstatus (석양의 감시자 아무르타트)
    this.dragonGroup = new THREE.Group();
    this.dragonGroup.position.set(-88, 38, -12);

    const dragonMat = new THREE.MeshStandardMaterial({
      color: 0x120e14,
      roughness: 0.95,
      metalness: 0.15
    });

    // Aerodynamic draconic body
    const bodyGeom = new THREE.ConeGeometry(3.4, 12.5, 8);
    bodyGeom.rotateZ(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeom, dragonMat);
    this.dragonGroup.add(body);

    // Curved S-Neck & Horned Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.2, 7.5, 8), dragonMat);
    neck.position.set(6.0, 2.8, 0);
    neck.rotation.z = -Math.PI / 3.8;
    this.dragonGroup.add(neck);

    const head = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.8, 8), dragonMat);
    head.position.set(9.2, 4.8, 0);
    head.rotation.z = -Math.PI / 2.2;
    this.dragonGroup.add(head);

    // Glowing Crimson Eyes (UnrealBloom glow)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), eyeMat);
    eyeL.position.set(8.4, 5.2, 0.8);
    this.dragonGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), eyeMat);
    eyeR.position.set(8.4, 5.2, -0.8);
    this.dragonGroup.add(eyeR);

    // Twin Horns
    [-0.6, 0.6].forEach(hz => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.45, 3.6, 6), dragonMat);
      horn.position.set(7.5, 6.2, hz);
      horn.rotation.z = -Math.PI / 5;
      this.dragonGroup.add(horn);
    });

    // Long whipping tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 2.0, 14.0, 8), dragonMat);
    tail.position.set(-10.5, -2.4, 0);
    tail.rotation.z = Math.PI / 2.7;
    this.dragonGroup.add(tail);

    // Majestic Wings (Left & Right)
    this.dragonWingL = new THREE.Group();
    this.dragonWingL.position.set(0, 2.2, 2.4);
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.2, 16.0), dragonMat);
    wingL.position.set(-1.2, 0, 8.0);
    wingL.rotation.y = 0.22;
    this.dragonWingL.add(wingL);
    this.dragonGroup.add(this.dragonWingL);

    this.dragonWingR = new THREE.Group();
    this.dragonWingR.position.set(0, 2.2, -2.4);
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.2, 16.0), dragonMat);
    wingR.position.set(-1.2, 0, -8.0);
    wingR.rotation.y = -0.22;
    this.dragonWingR.add(wingR);
    this.dragonGroup.add(this.dragonWingR);

    this.dragonGroup.rotation.y = Math.PI / 2.2;
    this.scene.add(this.dragonGroup);
  }

  update(delta, time) {
    if (this.waterMesh) {
      this.waterMesh.position.y = 0.06 + Math.sin(time * 2.2) * 0.02;
    }

    if (this.dragonGroup) {
      this.dragonGroup.position.y = 38 + Math.sin(time * 0.75) * 1.8;
      const flap = Math.sin(time * 1.35) * 0.36;
      this.dragonWingL.rotation.x = flap;
      this.dragonWingR.rotation.x = -flap;
    }

    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(delta);
    }
  }
}
