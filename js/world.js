/**
 * Dragon Raja: Heltant 3D - Environment, Terrain, Trees, Stream & Particles
 * Implements roads, vegetation, river bridge, smoke, and floating embers.
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
  }

  initTerrain() {
    const size = 160;
    const geom = new THREE.PlaneGeometry(size, size, 32, 32);
    geom.rotateX(-Math.PI / 2);

    // Procedural terrain texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#473d2a'; // Base frontier dirt
    ctx.fillRect(0, 0, 512, 512);

    // Grass patches
    ctx.fillStyle = 'rgba(68, 88, 48, 0.45)';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 8 + Math.random() * 25;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const groundTex = new THREE.CanvasTexture(canvas);
    groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(12, 12);

    const mat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.95,
      metalness: 0.05
    });

    const ground = new THREE.Mesh(geom, mat);
    ground.receiveShadow = true;
    ground.position.y = -0.05;
    this.scene.add(ground);

    // Outer world boundary fences/invisible colliders (prevent falling off)
    const bHalf = size / 2 - 5;
    this.colliders.push({ minX: -bHalf, maxX: bHalf, minZ: -bHalf, maxZ: -bHalf + 2, name: 'North Boundary' });
    this.colliders.push({ minX: -bHalf, maxX: bHalf, minZ: bHalf - 2, maxZ: bHalf, name: 'South Boundary' });
    this.colliders.push({ minX: -bHalf, maxX: -bHalf + 2, minZ: -bHalf, maxZ: bHalf, name: 'West Boundary' });
    this.colliders.push({ minX: bHalf - 2, maxX: bHalf, minZ: -bHalf, maxZ: bHalf, name: 'East Boundary' });
  }

  initRoads() {
    // Cobblestone path canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#6b6357';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#453f36';
    for (let i = 0; i < 350; i++) {
      const rx = Math.random() * 256;
      const ry = Math.random() * 256;
      ctx.fillRect(rx, ry, 6 + Math.random() * 8, 4 + Math.random() * 6);
    }

    const roadTex = new THREE.CanvasTexture(canvas);
    roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(1, 8);

    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.9,
      metalness: 0.1
    });

    // Central road network connecting landmarks
    const roads = [
      { x: 0, z: -18, w: 4.8, l: 36, rot: 0 },         // North to Karl's Manor
      { x: 9, z: -5, w: 4.2, l: 20, rot: Math.PI / 2.3 }, // North-East to Hooch's Workshop
      { x: -18, z: 8, w: 4.5, l: 26, rot: -Math.PI / 3 }, // South-West to Tavern
      { x: 8, z: 12, w: 4.2, l: 24, rot: Math.PI / 4 },   // South to Sanson's Smithy
      { x: -20, z: -4, w: 5.0, l: 38, rot: Math.PI / 2 }, // West to Watchtower & Palisade
      { x: 18, z: 4, w: 4.2, l: 30, rot: Math.PI / 2 }    // East to Watermill & Bridge
    ];

    roads.forEach(r => {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.l), roadMat);
      plane.rotateX(-Math.PI / 2);
      plane.rotateZ(r.rot);
      plane.position.set(r.x, 0.02, r.z);
      plane.receiveShadow = true;
      this.scene.add(plane);
    });
  }

  initStreamAndBridge() {
    // North-South River on the East side (x ~ 26 to 28)
    const streamL = 150;
    const streamW = 6.5;
    const riverBedGeom = new THREE.PlaneGeometry(streamW, streamL);
    riverBedGeom.rotateX(-Math.PI / 2);

    // Water Surface
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x225566,
      roughness: 0.1,
      metalness: 0.75,
      transparent: true,
      opacity: 0.85
    });

    this.waterMesh = new THREE.Mesh(riverBedGeom, waterMat);
    this.waterMesh.position.set(27, 0.05, 0);
    this.scene.add(this.waterMesh);

    // Stone Arch Bridge over the Stream (at z = 4, connecting village to watermill)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(27, 0, 4);

    const archGeom = new THREE.BoxGeometry(7.5, 0.6, 4.2);
    const archMat = new THREE.MeshStandardMaterial({ color: 0x5a554e, roughness: 0.9 });
    const arch = new THREE.Mesh(archGeom, archMat);
    arch.position.y = 0.5;
    arch.castShadow = true;
    arch.receiveShadow = true;
    bridgeGroup.add(arch);

    // Railings
    [-2.0, 2.0].forEach(rz => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.8, 0.3), archMat);
      rail.position.set(0, 1.1, rz);
      rail.castShadow = true;
      bridgeGroup.add(rail);
    });

    this.scene.add(bridgeGroup);
  }

  initTreesAndVegetation() {
    // Tree Geometry templates
    const pineTrunkGeom = new THREE.CylinderGeometry(0.3, 0.45, 3.5, 6);
    const pineFoliageGeom = new THREE.ConeGeometry(2.4, 6.5, 7);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });
    const darkPineMat = new THREE.MeshStandardMaterial({ color: 0x1f3624, roughness: 0.85 }); // Eerie dark forest
    const autumnMat = new THREE.MeshStandardMaterial({ color: 0x9e431f, roughness: 0.85 });  // Autumn gold/red
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xb57821, roughness: 0.85 });

    // 1. Dense Western Pine Forest (아무르타트의 숲 - 서쪽 숲 지대)
    for (let i = 0; i < 65; i++) {
      const tree = new THREE.Group();
      const tx = -44 - Math.random() * 32;
      const tz = -65 + Math.random() * 130;
      const scale = 0.85 + Math.random() * 0.7;

      const trunk = new THREE.Mesh(pineTrunkGeom, trunkMat);
      trunk.position.y = 1.75;
      trunk.castShadow = true;
      tree.add(trunk);

      // Multiple tiers of dark pine needles
      for (let t = 0; t < 3; t++) {
        const needle = new THREE.Mesh(pineFoliageGeom, darkPineMat);
        needle.position.y = 3.5 + t * 2.2;
        needle.scale.set(1.0 - t * 0.22, 1.0 - t * 0.15, 1.0 - t * 0.22);
        needle.castShadow = true;
        tree.add(needle);
      }

      tree.position.set(tx, 0, tz);
      tree.scale.set(scale, scale, scale);
      this.scene.add(tree);

      this.colliders.push({ minX: tx - 0.8, maxX: tx + 0.8, minZ: tz - 0.8, maxZ: tz + 0.8, name: 'Pine Tree' });
    }

    // 2. Village Autumn Trees (Scattered around plaza and houses)
    const villageTreeCoords = [
      [10, -22], [5, 18], [-12, -18], [-8, 22], [28, -25], [26, 26], [-28, -28], [-18, 30]
    ];

    villageTreeCoords.forEach(([vx, vz], idx) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 4.0, 6), trunkMat);
      trunk.position.y = 2.0;
      trunk.castShadow = true;
      tree.add(trunk);

      const folMat = (idx % 2 === 0) ? autumnMat : goldMat;
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8, 1), folMat);
      foliage.position.y = 5.2;
      foliage.castShadow = true;
      tree.add(foliage);

      tree.position.set(vx, 0, vz);
      this.scene.add(tree);
      this.colliders.push({ minX: vx - 0.9, maxX: vx + 0.9, minZ: vz - 0.9, maxZ: vz + 0.9, name: 'Autumn Tree' });
    });
  }

  initPropsAndDetails() {
    // Village Wooden Fences, Hay bales, Carts
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x543c29, roughness: 0.9 });
    const postGeom = new THREE.BoxGeometry(0.2, 1.4, 0.2);
    const railGeom = new THREE.BoxGeometry(2.2, 0.12, 0.08);

    const createFenceSection = (sx, sz, count, dx, dz) => {
      for (let f = 0; f < count; f++) {
        const post = new THREE.Mesh(postGeom, fenceMat);
        post.position.set(sx + f * dx, 0.7, sz + f * dz);
        post.castShadow = true;
        this.scene.add(post);

        if (f < count - 1) {
          const rail1 = new THREE.Mesh(railGeom, fenceMat);
          rail1.position.set(sx + f * dx + dx / 2, 0.5, sz + f * dz + dz / 2);
          rail1.rotation.y = Math.atan2(dz, dx);
          this.scene.add(rail1);

          const rail2 = new THREE.Mesh(railGeom, fenceMat);
          rail2.position.set(sx + f * dx + dx / 2, 0.95, sz + f * dz + dz / 2);
          rail2.rotation.y = Math.atan2(dz, dx);
          this.scene.add(rail2);
        }
      }
    };

    // Pasture fences south of tavern
    createFenceSection(-14, 25, 7, -2.0, 0);
    createFenceSection(-28, 25, 6, 0, -2.0);

    // Hay bales near blacksmith and tavern
    const hayMat = new THREE.MeshStandardMaterial({ color: 0xb59e4e, roughness: 0.95 });
    const hayCoords = [[14, 15], [15.2, 15], [14.6, 16.2], [-14, 23]];
    hayCoords.forEach(([hx, hz]) => {
      const bale = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.2, 8), hayMat);
      bale.position.set(hx, 0.6, hz);
      bale.rotation.z = Math.PI / 2;
      bale.castShadow = true;
      this.scene.add(bale);
    });

    // Frontier Wooden Freight Wagon
    const wagonGroup = new THREE.Group();
    wagonGroup.position.set(7, 0, -16);
    const wagonBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 4.2), fenceMat);
    wagonBody.position.y = 1.0;
    wagonGroup.add(wagonBody);

    for (let w = 0; w < 4; w++) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.15, 10), fenceMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set((w % 2 === 0 ? -1.3 : 1.3), 0.55, (w < 2 ? -1.4 : 1.4));
      wagonGroup.add(wheel);
    }
    this.scene.add(wagonGroup);
    this.colliders.push({ minX: 5.5, maxX: 8.5, minZ: -18.5, maxZ: -13.5, name: 'Wagon' });
  }

  initParticles() {
    // 1. Chimney Smoke Particles
    const smokeCount = 45;
    const smokeGeom = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    const smokeVel = [];

    const chimneys = [
      { x: 14.8, y: 7.8, z: -11.8 }, // Hooch House
      { x: -22.0, y: 8.2, z: 12.0 },  // Tavern
      { x: -3.2, y: 10.5, z: -37.8 }  // Karl Manor
    ];

    for (let i = 0; i < smokeCount; i++) {
      const c = chimneys[i % chimneys.length];
      smokePos[i * 3] = c.x + (Math.random() - 0.5) * 0.4;
      smokePos[i * 3 + 1] = c.y + Math.random() * 4.0;
      smokePos[i * 3 + 2] = c.z + (Math.random() - 0.5) * 0.4;
      smokeVel.push({
        baseX: c.x,
        baseY: c.y,
        baseZ: c.z,
        vy: 0.8 + Math.random() * 0.8,
        driftX: (Math.random() - 0.5) * 0.3
      });
    }

    smokeGeom.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));

    const smokeMat = new THREE.PointsMaterial({
      color: 0xd6cbb8,
      size: 1.4,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });

    const smokeSystem = new THREE.Points(smokeGeom, smokeMat);
    this.scene.add(smokeSystem);

    this.particles.push({
      system: smokeSystem,
      pos: smokePos,
      vel: smokeVel,
      update: (delta) => {
        for (let i = 0; i < smokeCount; i++) {
          smokePos[i * 3 + 1] += smokeVel[i].vy * delta;
          smokePos[i * 3] += (smokeVel[i].driftX + 0.15) * delta;
          if (smokePos[i * 3 + 1] > smokeVel[i].baseY + 6.0) {
            smokePos[i * 3] = smokeVel[i].baseX + (Math.random() - 0.5) * 0.4;
            smokePos[i * 3 + 1] = smokeVel[i].baseY;
            smokePos[i * 3 + 2] = smokeVel[i].baseZ + (Math.random() - 0.5) * 0.4;
          }
        }
        smokeGeom.attributes.position.needsUpdate = true;
      }
    });

    // 2. Fire Sparks / Embers around Forge & Braziers
    const sparkCount = 35;
    const sparkGeom = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = 13.0 + (Math.random() - 0.5) * 2.0; // Forge area
      sparkPos[i * 3 + 1] = 1.6 + Math.random() * 2.5;
      sparkPos[i * 3 + 2] = 22.0 + (Math.random() - 0.5) * 2.0;
    }
    sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));

    const sparkMat = new THREE.PointsMaterial({
      color: 0xff6600,
      size: 0.25,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const sparkSystem = new THREE.Points(sparkGeom, sparkMat);
    this.scene.add(sparkSystem);

    this.particles.push({
      system: sparkSystem,
      pos: sparkPos,
      update: (delta) => {
        for (let i = 0; i < sparkCount; i++) {
          sparkPos[i * 3 + 1] += 1.6 * delta;
          sparkPos[i * 3] += (Math.random() - 0.5) * 0.3 * delta;
          if (sparkPos[i * 3 + 1] > 4.5) {
            sparkPos[i * 3] = 13.0 + (Math.random() - 0.5) * 1.5;
            sparkPos[i * 3 + 1] = 1.6;
            sparkPos[i * 3 + 2] = 22.0 + (Math.random() - 0.5) * 1.5;
          }
        }
        sparkGeom.attributes.position.needsUpdate = true;
      }
    });
  }

  initAmstatusDragonSilhouette() {
    // Black Dragon Amstatus (석양의 감시자 아무르타트)
    this.dragonGroup = new THREE.Group();
    this.dragonGroup.position.set(-90, 36, -10);

    const dragonMat = new THREE.MeshStandardMaterial({
      color: 0x151118,
      roughness: 0.9,
      metalness: 0.2
    });

    // Dragon Torso
    const bodyGeom = new THREE.ConeGeometry(3.2, 11.0, 8);
    bodyGeom.rotateZ(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeom, dragonMat);
    this.dragonGroup.add(body);

    // Long Draconic Neck & Horned Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.0, 6.5, 8), dragonMat);
    neck.position.set(5.5, 2.5, 0);
    neck.rotation.z = -Math.PI / 4;
    this.dragonGroup.add(neck);

    const head = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4.2, 6), dragonMat);
    head.position.set(8.2, 4.5, 0);
    head.rotation.z = -Math.PI / 2.2;
    this.dragonGroup.add(head);

    // Glowing Crimson Eyes of Amstatus
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), eyeMat);
    eyeL.position.set(7.5, 4.8, 0.7);
    this.dragonGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), eyeMat);
    eyeR.position.set(7.5, 4.8, -0.7);
    this.dragonGroup.add(eyeR);

    // Horns
    [-0.5, 0.5].forEach(hz => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.4, 3.0, 5), dragonMat);
      horn.position.set(6.8, 5.8, hz);
      horn.rotation.z = -Math.PI / 6;
      this.dragonGroup.add(horn);
    });

    // Tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.8, 12.0, 6), dragonMat);
    tail.position.set(-9.5, -2.0, 0);
    tail.rotation.z = Math.PI / 2.8;
    this.dragonGroup.add(tail);

    // Great Wings (Left & Right)
    this.dragonWingL = new THREE.Group();
    this.dragonWingL.position.set(0, 2.0, 2.2);
    const wingGeomL = new THREE.BoxGeometry(10.0, 0.2, 14.0);
    const wingL = new THREE.Mesh(wingGeomL, dragonMat);
    wingL.position.set(-1.0, 0, 7.0);
    wingL.rotation.y = 0.2;
    this.dragonWingL.add(wingL);
    this.dragonGroup.add(this.dragonWingL);

    this.dragonWingR = new THREE.Group();
    this.dragonWingR.position.set(0, 2.0, -2.2);
    const wingGeomR = new THREE.BoxGeometry(10.0, 0.2, 14.0);
    const wingR = new THREE.Mesh(wingGeomR, dragonMat);
    wingR.position.set(-1.0, 0, -7.0);
    wingR.rotation.y = -0.2;
    this.dragonWingR.add(wingR);
    this.dragonGroup.add(this.dragonWingR);

    // Face towards the village (East)
    this.dragonGroup.rotation.y = Math.PI / 2.2;
    this.scene.add(this.dragonGroup);
  }

  update(delta, time) {
    // Animate water shimmer
    if (this.waterMesh) {
      this.waterMesh.position.y = 0.05 + Math.sin(time * 2.0) * 0.02;
    }

    // Animate Amstatus wing flap & gentle float
    if (this.dragonGroup) {
      this.dragonGroup.position.y = 36 + Math.sin(time * 0.8) * 1.5;
      const flap = Math.sin(time * 1.4) * 0.35;
      this.dragonWingL.rotation.x = flap;
      this.dragonWingR.rotation.x = -flap;
    }

    // Animate particle systems
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(delta);
    }
  }
}
