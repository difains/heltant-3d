/**
 * Dragon Raja: Heltant 3D - Procedural Village Buildings & Landmarks
 * Crafts medieval half-timbered architecture, watchtowers, watermill, forge, and well.
 */
import * as THREE from 'three';

export class BuildingBuilder {
  constructor(scene, lightingManager) {
    this.scene = scene;
    this.lighting = lightingManager;
    this.colliders = []; // Array of { minX, maxX, minZ, maxZ, name }
    this.animatedObjects = []; // Elements updated in game loop (e.g. watermill, smoke, flags)

    this.initMaterials();
  }

  initMaterials() {
    // Canvas procedural textures for wood and stone
    const woodTex = this.createWoodTexture();
    const stoneTex = this.createStoneTexture();
    const roofTex = this.createRoofTexture();
    const plasterTex = this.createPlasterTexture();

    this.matWood = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.85,
      metalness: 0.1,
      color: 0x4a3220
    });

    this.matWoodLight = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.8,
      metalness: 0.05,
      color: 0x6e4e32
    });

    this.matStone = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.9,
      metalness: 0.1,
      color: 0x75757b
    });

    this.matStoneDark = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.92,
      metalness: 0.1,
      color: 0x444449
    });

    this.matRoof = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.75,
      metalness: 0.15,
      color: 0x733827
    });

    this.matRoofBlue = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.75,
      metalness: 0.15,
      color: 0x3b4a59
    });

    this.matPlaster = new THREE.MeshStandardMaterial({
      map: plasterTex,
      roughness: 0.95,
      metalness: 0.0,
      color: 0xe5dbc7
    });

    this.matIron = new THREE.MeshStandardMaterial({
      roughness: 0.45,
      metalness: 0.85,
      color: 0x222226
    });

    this.matGlowWindow = new THREE.MeshStandardMaterial({
      color: 0xffaa44,
      emissive: 0xff8822,
      emissiveIntensity: 1.2,
      roughness: 0.3
    });

    this.matWater = new THREE.MeshStandardMaterial({
      color: 0x2e6f7d,
      roughness: 0.15,
      metalness: 0.6,
      transparent: true,
      opacity: 0.82
    });
  }

  // --- Procedural Canvas Textures ---
  createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#614328';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(40, 26, 14, 0.4)';
    for (let y = 0; y < 256; y += 4) {
      if (Math.random() > 0.4) {
        ctx.fillRect(0, y, 256, 2 + Math.random() * 3);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createStoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#68676d';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#38373b';
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
      const offset = (y % 48 === 0) ? 0 : 24;
      for (let x = offset; x < 256; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 24);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createRoofTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#7a3e2c';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#542618';
    for (let y = 0; y < 256; y += 16) {
      ctx.fillRect(0, y, 256, 2);
      const shift = (y % 32 === 0) ? 0 : 16;
      for (let x = shift; x < 256; x += 32) {
        ctx.fillRect(x, y, 2, 16);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createPlasterTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e8dec9';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(180, 165, 140, 0.25)';
    for (let i = 0; i < 600; i++) {
      const rx = Math.random() * 256;
      const ry = Math.random() * 256;
      ctx.fillRect(rx, ry, 2 + Math.random() * 4, 2 + Math.random() * 4);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  addCollider(x, z, width, depth, name = 'Building') {
    this.colliders.push({
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2,
      name
    });
  }

  // --- Torch / Lantern Helper ---
  createLantern(x, y, z, intensity = 1.8, color = 0xff9944) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Iron bracket & cage
    const bracketGeom = new THREE.BoxGeometry(0.12, 0.4, 0.25);
    const bracket = new THREE.Mesh(bracketGeom, this.matIron);
    bracket.position.set(0, 0, 0.1);
    group.add(bracket);

    const cageGeom = new THREE.BoxGeometry(0.35, 0.5, 0.35);
    const cage = new THREE.Mesh(cageGeom, this.matGlowWindow);
    cage.position.set(0, -0.15, 0.25);
    group.add(cage);

    // PointLight
    const light = new THREE.PointLight(color, intensity, 14, 1.6);
    light.position.set(0, -0.15, 0.25);
    light.castShadow = false;
    group.add(light);
    this.lighting.registerFlickerLight(light, intensity, color);

    this.scene.add(group);
    return group;
  }

  // --- Street Brazier / Torch Helper ---
  createBrazier(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Iron Stand
    const standGeom = new THREE.CylinderGeometry(0.12, 0.25, 1.8, 8);
    const stand = new THREE.Mesh(standGeom, this.matIron);
    stand.position.y = 0.9;
    stand.castShadow = true;
    group.add(stand);

    // Bowl
    const bowlGeom = new THREE.CylinderGeometry(0.7, 0.35, 0.5, 8);
    const bowl = new THREE.Mesh(bowlGeom, this.matIron);
    bowl.position.y = 1.8;
    bowl.castShadow = true;
    group.add(bowl);

    // Fire glow core
    const fireGeom = new THREE.DodecahedronGeometry(0.35);
    const fireMat = new THREE.MeshStandardMaterial({
      color: 0xff5511,
      emissive: 0xff6600,
      emissiveIntensity: 2.2
    });
    const fireMesh = new THREE.Mesh(fireGeom, fireMat);
    fireMesh.position.y = 2.05;
    group.add(fireMesh);

    // Point light
    const light = new THREE.PointLight(0xff7722, 2.8, 18, 1.5);
    light.position.y = 2.3;
    group.add(light);
    this.lighting.registerFlickerLight(light, 2.8, 0xff7722);

    this.scene.add(group);
    this.addCollider(x, z, 1.2, 1.2, 'Brazier');
    return group;
  }

  // =========================================================================
  // 1. Hooch's House & Candle Workshop (후치의 집 & 초 공방)
  // =========================================================================
  buildHoochWorkshop(x = 18, z = -10) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const w = 9.5, h = 5.2, d = 8.5;

    // Stone foundation
    const foundGeom = new THREE.BoxGeometry(w + 0.4, 1.0, d + 0.4);
    const foundation = new THREE.Mesh(foundGeom, this.matStone);
    foundation.position.y = 0.5;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    group.add(foundation);

    // Plaster main walls
    const wallGeom = new THREE.BoxGeometry(w, h, d);
    const walls = new THREE.Mesh(wallGeom, this.matPlaster);
    walls.position.y = 0.5 + h / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // Timber frame exterior beams
    const beamThick = 0.28;
    // Corners
    [[-w/2, -d/2], [-w/2, d/2], [w/2, -d/2], [w/2, d/2]].forEach(([bx, bz]) => {
      const colGeom = new THREE.BoxGeometry(beamThick * 1.5, h, beamThick * 1.5);
      const col = new THREE.Mesh(colGeom, this.matWood);
      col.position.set(bx, 0.5 + h / 2, bz);
      col.castShadow = true;
      group.add(col);
    });

    // Gable roof
    const roofH = 4.2;
    const roofGeom = new THREE.ConeGeometry((w + 1.6) * 0.72, roofH, 4);
    roofGeom.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, this.matRoof);
    roof.position.y = 0.5 + h + roofH / 2;
    roof.scale.set(1.15, 1, 0.95);
    roof.castShadow = true;
    group.add(roof);

    // Front door & Workshop porch
    const doorGeom = new THREE.BoxGeometry(1.6, 2.8, 0.2);
    const door = new THREE.Mesh(doorGeom, this.matWood);
    door.position.set(0, 1.0 + 1.4, d / 2 + 0.05);
    group.add(door);

    // Candle Signboard
    const signBarGeom = new THREE.BoxGeometry(0.1, 0.1, 1.6);
    const signBar = new THREE.Mesh(signBarGeom, this.matWood);
    signBar.position.set(1.4, 3.8, d / 2 + 0.8);
    group.add(signBar);

    // Wooden candle carved sign
    const signPlateGeom = new THREE.BoxGeometry(0.8, 1.1, 0.08);
    const signPlate = new THREE.Mesh(signPlateGeom, this.matWoodLight);
    signPlate.position.set(1.4, 3.3, d / 2 + 1.2);
    group.add(signPlate);

    // Candle visual on sign
    const candleShape = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0xfbf1c7, roughness: 0.3 })
    );
    candleShape.position.set(1.4, 3.3, d / 2 + 1.25);
    group.add(candleShape);

    // Glowing candle flame
    const flameMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff7711 })
    );
    flameMesh.position.set(1.4, 3.65, d / 2 + 1.25);
    group.add(flameMesh);

    // Glowing Windows
    const win1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.15), this.matGlowWindow);
    win1.position.set(-2.6, 2.8, d / 2 + 0.05);
    group.add(win1);

    const win2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.15), this.matGlowWindow);
    win2.position.set(2.6, 2.8, d / 2 + 0.05);
    group.add(win2);

    // Chimney
    const chimGeom = new THREE.BoxGeometry(1.2, 5.5, 1.2);
    const chimney = new THREE.Mesh(chimGeom, this.matStone);
    chimney.position.set(-3.2, 5.0, -1.8);
    chimney.castShadow = true;
    group.add(chimney);

    // Outdoor workshop barrels & wax tubs
    for (let i = 0; i < 3; i++) {
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.75, 1.3, 10),
        this.matWood
      );
      barrel.position.set(-3.2 + i * 1.5, 0.65, d / 2 + 1.4);
      barrel.castShadow = true;
      group.add(barrel);
    }

    // Porch Lantern
    this.createLantern(x + 1.2, 3.2, z + d / 2 + 0.2, 2.2, 0xff9944);

    this.scene.add(group);
    this.addCollider(x, z, w + 2.0, d + 3.0, 'Hooch Workshop');
    return group;
  }

  // =========================================================================
  // 2. Karl Heltant's Manor & Study (칼 헬턴트의 서재 / 영주 저택)
  // =========================================================================
  buildKarlManor(x = 0, z = -36) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const w = 15.0, h = 7.5, d = 11.0;

    // Heavy cut-stone walls
    const mainGeom = new THREE.BoxGeometry(w, h, d);
    const mainBuilding = new THREE.Mesh(mainGeom, this.matStone);
    mainBuilding.position.y = h / 2;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    group.add(mainBuilding);

    // Steep Blue Slate Roof
    const roofH = 5.8;
    const roofGeom = new THREE.ConeGeometry((w + 2.0) * 0.72, roofH, 4);
    roofGeom.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, this.matRoofBlue);
    roof.position.y = h + roofH / 2;
    roof.scale.set(1.25, 1, 0.95);
    roof.castShadow = true;
    group.add(roof);

    // Karl's Astronomy Tower (North-West corner)
    const towerR = 2.4, towerH = 15.5;
    const towerGeom = new THREE.CylinderGeometry(towerR, towerR * 1.1, towerH, 12);
    const tower = new THREE.Mesh(towerGeom, this.matStoneDark);
    tower.position.set(-w / 2, towerH / 2, -d / 3);
    tower.castShadow = true;
    group.add(tower);

    // Tower conical spire
    const spireGeom = new THREE.ConeGeometry(towerR * 1.25, 6.0, 12);
    const spire = new THREE.Mesh(spireGeom, this.matRoofBlue);
    spire.position.set(-w / 2, towerH + 3.0, -d / 3);
    spire.castShadow = true;
    group.add(spire);

    // Observatory Balcony
    const balconyGeom = new THREE.CylinderGeometry(towerR * 1.4, towerR * 1.4, 0.5, 12);
    const balcony = new THREE.Mesh(balconyGeom, this.matWood);
    balcony.position.set(-w / 2, 11.5, -d / 3);
    group.add(balcony);

    // Grand Entrance Arch
    const archGeom = new THREE.BoxGeometry(3.6, 5.2, 1.2);
    const arch = new THREE.Mesh(archGeom, this.matStoneDark);
    arch.position.set(0, 2.6, d / 2 + 0.6);
    arch.castShadow = true;
    group.add(arch);

    // Double Heavy Oak Doors
    const doorGeom = new THREE.BoxGeometry(2.4, 4.0, 0.25);
    const doors = new THREE.Mesh(doorGeom, this.matWood);
    doors.position.set(0, 2.0, d / 2 + 1.15);
    group.add(doors);

    // Front Stone Steps
    for (let s = 0; s < 3; s++) {
      const stepGeom = new THREE.BoxGeometry(4.8 - s * 0.4, 0.35, 1.2);
      const step = new THREE.Mesh(stepGeom, this.matStone);
      step.position.set(0, 0.18 + s * 0.35, d / 2 + 1.8 + s * 0.9);
      step.receiveShadow = true;
      group.add(step);
    }

    // Leaded Glass Windows (Multiple rows glowing warm amber)
    const winCoords = [
      [-4.0, 3.2, d / 2 + 0.05], [4.0, 3.2, d / 2 + 0.05],
      [-4.0, 6.0, d / 2 + 0.05], [0, 6.0, d / 2 + 0.05], [4.0, 6.0, d / 2 + 0.05]
    ];
    winCoords.forEach(([wx, wy, wz]) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.15), this.matGlowWindow);
      win.position.set(wx, wy, wz);
      group.add(win);
    });

    // Karl's Manor Lanterns
    this.createLantern(x - 2.2, 4.2, z + d / 2 + 1.2, 2.4, 0xffaa55);
    this.createLantern(x + 2.2, 4.2, z + d / 2 + 1.2, 2.4, 0xffaa55);

    this.scene.add(group);
    this.addCollider(x, z, w + 4.0, d + 4.0, 'Karl Manor');
    return group;
  }

  // =========================================================================
  // 3. Heltant Tavern (선술집 - 타이번의 주점)
  // =========================================================================
  buildTavern(x = -22, z = 15) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const w = 12.0, h = 6.0, d = 9.0;

    // Foundation
    const found = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.8, d + 0.4), this.matStone);
    found.position.y = 0.4;
    group.add(found);

    // Wooden timber walls
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.matPlaster);
    walls.position.y = 0.4 + h / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // Heavy timber framing
    for (let bx = -w/2; bx <= w/2; bx += w/3) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.35, h, 0.35), this.matWood);
      beam.position.set(bx, 0.4 + h / 2, d / 2 + 0.02);
      group.add(beam);
    }

    // Thatched / shingled roof
    const roofH = 4.8;
    const roofGeom = new THREE.ConeGeometry((w + 2.2) * 0.72, roofH, 4);
    roofGeom.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, this.matRoof);
    roof.position.y = 0.4 + h + roofH / 2;
    roof.scale.set(1.2, 1, 0.95);
    roof.castShadow = true;
    group.add(roof);

    // Tavern Signboard ("The Heltant Boar & Flagon")
    const signBeam = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 2.2), this.matWood);
    signBeam.position.set(2.4, 4.0, d / 2 + 1.1);
    group.add(signBeam);

    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.1), this.matWoodLight);
    signBoard.position.set(2.4, 3.2, d / 2 + 1.6);
    group.add(signBoard);

    // Outdoor tavern tables & beer kegs
    const tableGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.15, 8);
    const table = new THREE.Mesh(tableGeom, this.matWood);
    table.position.set(3.8, 1.0, d / 2 + 3.2);
    group.add(table);

    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.0, 8), this.matWood);
    tableLeg.position.set(3.8, 0.5, d / 2 + 3.2);
    group.add(tableLeg);

    // Tavern Stools
    [-1.2, 1.2].forEach(ox => {
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.6, 6), this.matWood);
      stool.position.set(3.8 + ox, 0.3, d / 2 + 3.2);
      group.add(stool);
    });

    // Beer Kegs stacked
    for (let i = 0; i < 4; i++) {
      const keg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 1.1, 8), this.matWood);
      keg.rotation.z = Math.PI / 2;
      keg.position.set(-3.5 + (i % 2) * 1.2, 0.55 + Math.floor(i / 2) * 1.0, d / 2 + 1.8);
      group.add(keg);
    }

    // Windows with warm light
    const win = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 0.15), this.matGlowWindow);
    win.position.set(-2.5, 2.6, d / 2 + 0.05);
    group.add(win);

    // Tavern Lantern
    this.createLantern(x + 0.5, 3.4, z + d / 2 + 0.2, 2.5, 0xff8822);

    this.scene.add(group);
    this.addCollider(x, z, w + 2.0, d + 4.5, 'Heltant Tavern');
    return group;
  }

  // =========================================================================
  // 4. Sanson's Barracks & Smithy (샌슨의 경비대 막사 & 대장간)
  // =========================================================================
  buildSmithyAndBarracks(x = 16, z = 22) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Barracks building
    const bw = 10.0, bh = 5.2, bd = 7.5;
    const barracks = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), this.matStoneDark);
    barracks.position.set(0, bh / 2, 0);
    barracks.castShadow = true;
    group.add(barracks);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry((bw + 1.5) * 0.72, 3.8, 4),
      this.matRoof
    );
    roof.rotateY(Math.PI / 4);
    roof.position.set(0, bh + 1.9, 0);
    roof.scale.set(1.2, 1, 0.9);
    roof.castShadow = true;
    group.add(roof);

    // Open-air Smithy Forge Shelter (attached to west side)
    const sw = 6.0, sd = 6.0;
    // 4 timber support posts
    [[-bw/2 - sw, -sd/2], [-bw/2 - sw, sd/2], [-bw/2, -sd/2], [-bw/2, sd/2]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.8, 0.35), this.matWood);
      post.position.set(px, 1.9, pz);
      group.add(post);
    });

    // Shelter Lean-to roof
    const shedRoof = new THREE.Mesh(new THREE.BoxGeometry(sw + 0.8, 0.25, sd + 0.8), this.matWood);
    shedRoof.position.set(-bw / 2 - sw / 2, 3.8, 0);
    shedRoof.rotation.z = 0.12;
    group.add(shedRoof);

    // Stone Forge / Hearth
    const hearthGeom = new THREE.BoxGeometry(2.4, 1.3, 2.4);
    const hearth = new THREE.Mesh(hearthGeom, this.matStone);
    hearth.position.set(-bw / 2 - sw / 2, 0.65, 0);
    group.add(hearth);

    // Glowing red coal pit
    const coalsGeom = new THREE.BoxGeometry(1.6, 0.2, 1.6);
    const coalsMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff4400,
      emissiveIntensity: 2.8,
      roughness: 0.2
    });
    const coals = new THREE.Mesh(coalsGeom, coalsMat);
    coals.position.set(-bw / 2 - sw / 2, 1.35, 0);
    group.add(coals);

    // Forge Light
    const forgeLight = new THREE.PointLight(0xff5511, 3.5, 14, 1.4);
    forgeLight.position.set(-bw / 2 - sw / 2, 1.8, 0);
    group.add(forgeLight);
    this.lighting.registerFlickerLight(forgeLight, 3.5, 0xff5511);

    // Iron Anvil
    const anvilBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), this.matIron);
    anvilBase.position.set(-bw / 2 - sw / 2 + 1.6, 0.35, 1.2);
    group.add(anvilBase);

    const anvilTop = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 0.65), this.matIron);
    anvilTop.position.set(-bw / 2 - sw / 2 + 1.6, 0.85, 1.2);
    group.add(anvilTop);

    // Weapon Training Dummy
    const dummyPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8), this.matWood);
    dummyPole.position.set(-bw / 2 - sw / 2 - 1.2, 1.1, 2.5);
    group.add(dummyPole);

    const dummyBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.45, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xc8b28a, roughness: 0.9 })
    );
    dummyBody.position.set(-bw / 2 - sw / 2 - 1.2, 1.4, 2.5);
    group.add(dummyBody);

    const dummyArm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.2), this.matWood);
    dummyArm.position.set(-bw / 2 - sw / 2 - 1.2, 1.6, 2.5);
    group.add(dummyArm);

    this.scene.add(group);
    this.addCollider(x, z, bw + sw + 2.0, bd + 3.0, 'Sanson Barracks & Smithy');
    return group;
  }

  // =========================================================================
  // 5. Village Central Square & Stone Well (마을 중앙 광장과 우물)
  // =========================================================================
  buildCentralWell(x = 0, z = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Cobblestone Plaza Ring
    const plazaGeom = new THREE.CylinderGeometry(7.0, 7.0, 0.15, 24);
    const plaza = new THREE.Mesh(plazaGeom, this.matStoneDark);
    plaza.position.y = 0.07;
    plaza.receiveShadow = true;
    group.add(plaza);

    // Stone Well Curb
    const wellCurbGeom = new THREE.CylinderGeometry(1.9, 2.1, 1.1, 16, 1, true);
    const wellCurb = new THREE.Mesh(wellCurbGeom, this.matStone);
    wellCurb.position.y = 0.65;
    wellCurb.castShadow = true;
    group.add(wellCurb);

    // Well Water
    const waterGeom = new THREE.CylinderGeometry(1.8, 1.8, 0.1, 16);
    const water = new THREE.Mesh(waterGeom, this.matWater);
    water.position.y = 0.4;
    group.add(water);

    // Timber Roof Support Posts
    [-1.5, 1.5].forEach(wx => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.6, 0.22), this.matWood);
      post.position.set(wx, 1.4, 0);
      post.castShadow = true;
      group.add(post);
    });

    // Cross beam & Pulley
    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.22, 0.22), this.matWood);
    beam.position.set(0, 2.6, 0);
    group.add(beam);

    // Wooden Bucket
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.45, 8), this.matWoodLight);
    bucket.position.set(0.6, 1.3, 0.2);
    group.add(bucket);

    // Conical Shingle Roof for well
    const wellRoofGeom = new THREE.ConeGeometry(2.4, 1.6, 12);
    const wellRoof = new THREE.Mesh(wellRoofGeom, this.matRoof);
    wellRoof.position.y = 3.3;
    wellRoof.castShadow = true;
    group.add(wellRoof);

    // Four-Way Signpost on Plaza Edge
    const signpost = new THREE.Group();
    signpost.position.set(4.5, 0, 3.5);

    const postGeom = new THREE.CylinderGeometry(0.12, 0.15, 3.2, 8);
    const post = new THREE.Mesh(postGeom, this.matWood);
    post.position.y = 1.6;
    post.castShadow = true;
    signpost.add(post);

    // Sign arrow boards
    const signs = [
      { text: '서쪽 숲 (아무르타트)', rotY: -Math.PI / 2, y: 2.7 },
      { text: '칼의 저택 / 영주성', rotY: Math.PI, y: 2.3 },
      { text: '후치의 초 공방', rotY: Math.PI / 2, y: 1.9 },
      { text: '선술집 · 가도', rotY: 0, y: 1.5 }
    ];
    signs.forEach(s => {
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 0.08), this.matWoodLight);
      board.position.set(0.7, s.y, 0);
      board.rotation.y = s.rotY;
      signpost.add(board);
    });
    group.add(signpost);

    // Plaza Benches
    const benchGeom = new THREE.BoxGeometry(2.4, 0.15, 0.7);
    const bench1 = new THREE.Mesh(benchGeom, this.matWood);
    bench1.position.set(-4.2, 0.5, -2.5);
    bench1.rotation.y = 0.5;
    group.add(bench1);

    this.scene.add(group);
    this.addCollider(x, z, 4.5, 4.5, 'Central Well');
    return group;
  }

  // =========================================================================
  // 6. Western Watchtower & Palisade Gate (서쪽 감시 망루 & 방책문)
  // =========================================================================
  buildWesternWatchtower(x = -38, z = -8) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const tw = 6.0, th = 14.0;

    // 4 Massive Corner Timber Piles
    const postCoords = [[-tw/2, -tw/2], [-tw/2, tw/2], [tw/2, -tw/2], [tw/2, tw/2]];
    postCoords.forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.65, th, 0.65), this.matWood);
      post.position.set(px, th / 2, pz);
      post.castShadow = true;
      group.add(post);
    });

    // Cross bracings
    for (let level = 3.5; level <= th - 3; level += 3.5) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(tw, 0.35, 0.35), this.matWood);
      beam.position.set(0, level, tw / 2);
      group.add(beam);
      const beamBack = new THREE.Mesh(new THREE.BoxGeometry(tw, 0.35, 0.35), this.matWood);
      beamBack.position.set(0, level, -tw / 2);
      group.add(beamBack);
    }

    // Guard Platform Floor
    const floorGeom = new THREE.BoxGeometry(tw + 2.2, 0.4, tw + 2.2);
    const floor = new THREE.Mesh(floorGeom, this.matWood);
    floor.position.y = th;
    group.add(floor);

    // Guard Railing / Breastwork
    const railGeom = new THREE.BoxGeometry(tw + 2.2, 1.2, 0.2);
    const railWest = new THREE.Mesh(railGeom, this.matWood);
    railWest.position.set(0, th + 0.6, -tw / 2 - 1.0);
    group.add(railWest);

    // Watchtower Roof
    const roofGeom = new THREE.ConeGeometry((tw + 3.0) * 0.72, 3.6, 4);
    roofGeom.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, this.matRoof);
    roof.position.y = th + 4.2;
    roof.castShadow = true;
    group.add(roof);

    // Big Western Warning Brazier / Signal Fire
    const signalFireLight = new THREE.PointLight(0xff5511, 4.5, 24, 1.5);
    signalFireLight.position.set(0, th + 1.6, 0);
    group.add(signalFireLight);
    this.lighting.registerFlickerLight(signalFireLight, 4.5, 0xff5511);

    const fireBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.6, 0.7, 8), this.matIron);
    fireBowl.position.set(0, th + 0.5, 0);
    group.add(fireBowl);

    // Log Palisade Wall extending North and South
    for (let oz = -28; oz <= 28; oz += 1.3) {
      if (Math.abs(oz - z) < 4.0) continue; // Gap for gate
      const logH = 5.0 + Math.sin(oz) * 0.6;
      const logGeom = new THREE.CylinderGeometry(0.35, 0.4, logH, 6);
      const log = new THREE.Mesh(logGeom, this.matWood);
      log.position.set(0, logH / 2, oz);
      log.castShadow = true;
      group.add(log);
    }

    this.scene.add(group);
    this.addCollider(x, z, tw + 2.0, tw + 2.0, 'Western Watchtower');
    this.addCollider(x, z - 18, 2.0, 30, 'North Palisade');
    this.addCollider(x, z + 18, 2.0, 30, 'South Palisade');
    return group;
  }

  // =========================================================================
  // 7. Watermill & Stream (물레방아와 시냇물)
  // =========================================================================
  buildWatermill(x = 32, z = 8) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Mill House
    const mw = 8.0, mh = 5.0, md = 7.0;
    const house = new THREE.Mesh(new THREE.BoxGeometry(mw, mh, md), this.matStone);
    house.position.set(0, mh / 2, 0);
    house.castShadow = true;
    group.add(house);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry((mw + 1.2) * 0.72, 3.5, 4),
      this.matRoof
    );
    roof.rotateY(Math.PI / 4);
    roof.position.set(0, mh + 1.75, 0);
    roof.scale.set(1.2, 1, 0.9);
    roof.castShadow = true;
    group.add(roof);

    // Water Wheel Pivot Group
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(-mw / 2 - 0.7, 2.6, 0);

    const wheelHub = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.8, 12), this.matWood);
    wheelHub.rotation.z = Math.PI / 2;
    wheelGroup.add(wheelHub);

    const rimGeom = new THREE.TorusGeometry(2.6, 0.15, 8, 16);
    rimGeom.rotateY(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeom, this.matWood);
    wheelGroup.add(rim);

    // Wheel Paddles (8 blades)
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 1.4), this.matWoodLight);
      paddle.position.set(0, Math.sin(angle) * 2.2, Math.cos(angle) * 2.2);
      paddle.rotation.x = angle;
      wheelGroup.add(paddle);

      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, 0.15), this.matWood);
      spoke.position.set(0, Math.sin(angle) * 1.1, Math.cos(angle) * 1.1);
      spoke.rotation.x = angle;
      wheelGroup.add(spoke);
    }

    group.add(wheelGroup);

    // Water Channel / Sluice chute
    const chuteGeom = new THREE.BoxGeometry(1.6, 0.3, 10.0);
    const chute = new THREE.Mesh(chuteGeom, this.matWood);
    chute.position.set(-mw / 2 - 0.7, 4.4, -2.0);
    chute.rotation.x = 0.1;
    group.add(chute);

    this.scene.add(group);
    this.addCollider(x, z, mw + 3.0, md + 2.0, 'Watermill');

    // Register animated water wheel rotation
    this.animatedObjects.push({
      update: (delta) => {
        wheelGroup.rotation.x += delta * 0.8;
      }
    });

    return group;
  }

  update(delta) {
    for (let i = 0; i < this.animatedObjects.length; i++) {
      this.animatedObjects[i].update(delta);
    }
  }
}
