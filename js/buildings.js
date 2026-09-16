/**
 * Dragon Raja: Heltant 3D - High-Fidelity PBR Buildings & Architecture
 * Crafted to match the Dream Target: multi-layered roofs, beveled timber frames,
 * wrought-iron lanterns, sculpted stone well, and Bloom-ready emissive materials.
 */
import * as THREE from 'three';

export class BuildingBuilder {
  constructor(scene, lightingManager) {
    this.scene = scene;
    this.lighting = lightingManager;
    this.colliders = [];
    this.animatedObjects = [];

    this.initMaterials();
  }

  initMaterials() {
    const woodTex = this.createWoodTexture();
    const stoneTex = this.createStoneTexture();
    const roofTex = this.createRoofTexture();
    const plasterTex = this.createPlasterTexture();

    // High quality PBR materials with roughness & metalness subtlety
    this.matWood = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.75,
      metalness: 0.08,
      color: 0x48321e
    });

    this.matWoodLight = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.7,
      metalness: 0.05,
      color: 0x684c31
    });

    this.matStone = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.85,
      metalness: 0.12,
      color: 0x6e6e74
    });

    this.matStoneDark = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.88,
      metalness: 0.15,
      color: 0x3e3e44
    });

    this.matRoof = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.65,
      metalness: 0.15,
      color: 0x7a3928
    });

    this.matRoofBlue = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.65,
      metalness: 0.18,
      color: 0x364757
    });

    this.matPlaster = new THREE.MeshStandardMaterial({
      map: plasterTex,
      roughness: 0.92,
      metalness: 0.02,
      color: 0xe8dfcb
    });

    this.matIron = new THREE.MeshStandardMaterial({
      roughness: 0.35,
      metalness: 0.9,
      color: 0x1e1e22
    });

    // Emissive Bloom Materials (Lanterns & Windows)
    this.matGlowWindow = new THREE.MeshStandardMaterial({
      color: 0xffaa44,
      emissive: 0xff8822,
      emissiveIntensity: 2.2, // Triggers UnrealBloomPass
      roughness: 0.2
    });

    this.matGlowLantern = new THREE.MeshStandardMaterial({
      color: 0xffbb55,
      emissive: 0xff9922,
      emissiveIntensity: 3.5, // Glorious warm bloom
      roughness: 0.1
    });

    this.matWater = new THREE.MeshStandardMaterial({
      color: 0x225566,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.85
    });
  }

  // --- Procedural Canvas Textures (High Detail) ---
  createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#563c22';
    ctx.fillRect(0, 0, 512, 512);

    // Fine wood grain fibers
    for (let y = 0; y < 512; y += 3) {
      ctx.fillStyle = (y % 6 === 0) ? 'rgba(38, 24, 12, 0.45)' : 'rgba(102, 74, 46, 0.3)';
      ctx.fillRect(0, y, 512, 1 + Math.random() * 2);
    }
    // Wood knots
    for (let k = 0; k < 8; k++) {
      const kx = Math.random() * 512;
      const ky = Math.random() * 512;
      ctx.fillStyle = 'rgba(30, 18, 8, 0.55)';
      ctx.beginPath();
      ctx.ellipse(kx, ky, 6 + Math.random() * 8, 12 + Math.random() * 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createStoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#65646a';
    ctx.fillRect(0, 0, 512, 512);

    // Stone masonry blocks & mortar
    ctx.strokeStyle = '#2b2a2e';
    ctx.lineWidth = 3;
    const bh = 32;
    for (let y = 0; y < 512; y += bh) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();

      const bw = 64;
      const offset = (Math.floor(y / bh) % 2 === 0) ? 0 : 32;
      for (let x = offset; x < 512; x += bw) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + bh);
        ctx.stroke();

        // Subtle block shading
        ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 255 : 0}, 0.05)`;
        ctx.fillRect(x + 2, y + 2, bw - 4, bh - 4);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createRoofTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#7c3b28';
    ctx.fillRect(0, 0, 512, 512);

    // Scalloped shingle tiles
    const th = 24, tw = 32;
    for (let y = 0; y < 512; y += th) {
      ctx.fillStyle = '#4e1e12';
      ctx.fillRect(0, y, 512, 3);
      const shift = (Math.floor(y / th) % 2 === 0) ? 0 : 16;
      for (let x = shift; x < 512; x += tw) {
        ctx.fillStyle = '#4e1e12';
        ctx.fillRect(x, y, 2, th);
        ctx.fillStyle = 'rgba(240, 140, 90, 0.12)';
        ctx.fillRect(x + 2, y + 3, tw - 4, 4); // Highlight top edge
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createPlasterTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#eae0cb';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = 'rgba(160, 140, 115, 0.2)';
    for (let i = 0; i < 1200; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      ctx.fillRect(rx, ry, 2 + Math.random() * 5, 2 + Math.random() * 5);
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

  // --- Wrought-Iron Hanging Lantern (Dream Target style) ---
  createLantern(x, y, z, intensity = 2.4, color = 0xff9c38) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Curved wrought iron wall bracket
    const armGeom = new THREE.BoxGeometry(0.08, 0.08, 0.9);
    const arm = new THREE.Mesh(armGeom, this.matIron);
    arm.position.set(0, 0.3, 0.45);
    group.add(arm);

    const braceGeom = new THREE.BoxGeometry(0.06, 0.6, 0.06);
    const brace = new THREE.Mesh(braceGeom, this.matIron);
    brace.position.set(0, 0, 0.3);
    brace.rotation.x = -Math.PI / 4;
    group.add(brace);

    // Lantern Cap & Base
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.22, 6), this.matIron);
    cap.position.set(0, 0.12, 0.85);
    group.add(cap);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.1, 6), this.matIron);
    base.position.set(0, -0.4, 0.85);
    group.add(base);

    // Glowing Core Glass (UnrealBloomPass source)
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.42, 6), this.matGlowLantern);
    glass.position.set(0, -0.15, 0.85);
    group.add(glass);

    // Real PointLight with shadow casting
    const light = new THREE.PointLight(color, intensity, 16, 1.5);
    light.position.set(0, -0.15, 0.85);
    light.castShadow = false; // Keep fill soft
    group.add(light);
    this.lighting.registerFlickerLight(light, intensity, color);

    this.scene.add(group);
    return group;
  }

  // --- Street Brazier Helper ---
  createBrazier(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Forged tripod stand
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.3, 1.8, 8), this.matIron);
    stand.position.y = 0.9;
    stand.castShadow = true;
    group.add(stand);

    // Iron Bowl
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.35, 0.55, 8), this.matIron);
    bowl.position.y = 1.85;
    bowl.castShadow = true;
    group.add(bowl);

    // Glowing coals & fire core
    const fireMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.38),
      new THREE.MeshStandardMaterial({
        color: 0xff3300,
        emissive: 0xff5500,
        emissiveIntensity: 3.8
      })
    );
    fireMesh.position.y = 2.15;
    group.add(fireMesh);

    const light = new THREE.PointLight(0xff7722, 3.2, 20, 1.4);
    light.position.y = 2.4;
    group.add(light);
    this.lighting.registerFlickerLight(light, 3.2, 0xff7722);

    this.scene.add(group);
    this.addCollider(x, z, 1.2, 1.2, 'Brazier');
    return group;
  }

  // =========================================================================
  // 1. Village Central Square & Stone Well (Dream Target Centerpiece)
  // =========================================================================
  buildCentralWell(x = 0, z = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Radial Cobblestone Plaza with multi-ring brick bevels
    const plazaGeom = new THREE.CylinderGeometry(8.5, 8.5, 0.2, 32);
    const plaza = new THREE.Mesh(plazaGeom, this.matStoneDark);
    plaza.position.y = 0.1;
    plaza.receiveShadow = true;
    group.add(plaza);

    // Sculpted Stone Well Curb (Circular layered masonry blocks)
    const wellBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.3, 0.35, 20),
      this.matStone
    );
    wellBase.position.y = 0.37;
    wellBase.castShadow = true;
    group.add(wellBase);

    const wellWall = new THREE.Mesh(
      new THREE.CylinderGeometry(2.0, 2.1, 0.9, 20, 1, true),
      this.matStone
    );
    wellWall.position.y = 0.95;
    wellWall.castShadow = true;
    group.add(wellWall);

    const wellRim = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.14, 8, 24),
      this.matStoneDark
    );
    wellRim.rotation.x = Math.PI / 2;
    wellRim.position.y = 1.42;
    wellRim.castShadow = true;
    group.add(wellRim);

    // Well Water with reflection
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 1.9, 0.1, 16),
      this.matWater
    );
    water.position.y = 0.55;
    group.add(water);

    // Timber Roof Supports (Carved wooden posts with diagonal brackets)
    [-1.6, 1.6].forEach(wx => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.8, 0.24), this.matWood);
      post.position.set(wx, 1.6, 0);
      post.castShadow = true;
      group.add(post);

      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.8, 0.14), this.matWood);
      bracket.position.set(wx * 0.75, 2.7, 0);
      bracket.rotation.z = (wx > 0) ? -Math.PI / 4 : Math.PI / 4;
      group.add(bracket);
    });

    // Cross beam, Spindle & Rope
    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.24, 0.24), this.matWood);
    beam.position.set(0, 2.9, 0);
    group.add(beam);

    const spool = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.2, 10), this.matWoodLight);
    spool.rotation.z = Math.PI / 2;
    spool.position.set(0, 2.6, 0);
    group.add(spool);

    // Wooden Bucket with iron rings
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.48, 8), this.matWoodLight);
    bucket.position.set(0.7, 1.6, 0.2);
    bucket.castShadow = true;
    group.add(bucket);

    // Conical layered Shingle Roof
    const roofGeom = new THREE.ConeGeometry(2.6, 1.8, 16);
    const roof = new THREE.Mesh(roofGeom, this.matRoof);
    roof.position.y = 3.8;
    roof.castShadow = true;
    group.add(roof);

    // Hanging Plaza Lantern directly on well crossbeam
    this.createLantern(x + 0.1, 2.7, z + 0.1, 2.8, 0xffa044);

    // 4-Way Signpost at plaza border
    const signpost = new THREE.Group();
    signpost.position.set(5.2, 0, 4.0);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.4, 8), this.matWood);
    post.position.y = 1.7;
    post.castShadow = true;
    signpost.add(post);

    const signs = [
      { text: '서쪽 숲 (아무르타트)', rotY: -Math.PI / 2, y: 2.8 },
      { text: '칼의 저택 / 영주성', rotY: Math.PI, y: 2.4 },
      { text: '후치의 초 공방', rotY: Math.PI / 2, y: 2.0 },
      { text: '선술집 · 가도', rotY: 0, y: 1.6 }
    ];
    signs.forEach(s => {
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.32, 0.08), this.matWoodLight);
      board.position.set(0.8, s.y, 0);
      board.rotation.y = s.rotY;
      signpost.add(board);
    });
    group.add(signpost);

    this.scene.add(group);
    this.addCollider(x, z, 5.0, 5.0, 'Central Well');
    return group;
  }

  // =========================================================================
  // 2. Hooch's House & Candle Workshop (Dream Target Architecture)
  // =========================================================================
  buildHoochWorkshop(x = 18, z = -10) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const w = 10.0, h = 5.6, d = 9.0;

    // Heavy cut-stone foundation
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 1.2, d + 0.5), this.matStone);
    foundation.position.y = 0.6;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    group.add(foundation);

    // Plaster Walls with Half-Timber Beams
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.matPlaster);
    walls.position.y = 0.6 + h / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // Detailed timber post and lintel framework
    for (let bx = -w/2; bx <= w/2; bx += w/2) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.35, h, 0.35), this.matWood);
      col.position.set(bx, 0.6 + h / 2, d / 2 + 0.03);
      col.castShadow = true;
      group.add(col);
    }

    // Overhanging Mansard/Gable Roof with Eaves
    const roofH = 4.8;
    const roofGeom = new THREE.ConeGeometry((w + 2.4) * 0.72, roofH, 4);
    roofGeom.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, this.matRoof);
    roof.position.y = 0.6 + h + roofH / 2;
    roof.scale.set(1.2, 1, 0.95);
    roof.castShadow = true;
    group.add(roof);

    // Candle Signboard with Carved Bracket
    const signArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.8), this.matWood);
    signArm.position.set(1.6, 4.0, d / 2 + 0.9);
    group.add(signArm);

    const signPlate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.08), this.matWoodLight);
    signPlate.position.set(1.6, 3.4, d / 2 + 1.4);
    group.add(signPlate);

    // Glowing candle on sign (Triggers Bloom)
    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.65, 8),
      new THREE.MeshStandardMaterial({ color: 0xfff5dd, roughness: 0.3 })
    );
    candle.position.set(1.6, 3.4, d / 2 + 1.45);
    group.add(candle);

    const candleFlame = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      this.matGlowLantern
    );
    candleFlame.position.set(1.6, 3.82, d / 2 + 1.45);
    group.add(candleFlame);

    // Warm Leaded Windows
    [-2.8, 2.8].forEach(wx => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 0.15), this.matGlowWindow);
      win.position.set(wx, 3.0, d / 2 + 0.06);
      group.add(win);
    });

    // Masonry Chimney with Smoke Crown
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.2, 1.4), this.matStoneDark);
    chimney.position.set(-3.5, 5.5, -2.0);
    chimney.castShadow = true;
    group.add(chimney);

    // Outdoor workshop workbench, wax vats & barrels
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.85, 0.9), this.matWood);
    bench.position.set(3.4, 0.42, d / 2 + 1.4);
    group.add(bench);

    for (let i = 0; i < 3; i++) {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 1.3, 10), this.matWood);
      barrel.position.set(-3.2 + i * 1.4, 0.65, d / 2 + 1.6);
      barrel.castShadow = true;
      group.add(barrel);
    }

    // Porch Lantern
    this.createLantern(x + 1.2, 3.4, z + d / 2 + 0.3, 2.6, 0xffa044);

    this.scene.add(group);
    this.addCollider(x, z, w + 2.5, d + 3.5, 'Hooch Workshop');
    return group;
  }

  // =========================================================================
  // 3. Karl Heltant's Manor & Study (Lord's Castle & Archive)
  // =========================================================================
  buildKarlManor(x = 0, z = -36) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const w = 16.0, h = 8.5, d = 12.0;

    // High cut-stone fortress masonry
    const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.matStone);
    mainBuilding.position.y = h / 2;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    group.add(mainBuilding);

    // Gothic Blue Slate Roof with Dormers
    const roofH = 6.4;
    const roofGeom = new THREE.ConeGeometry((w + 2.4) * 0.72, roofH, 4);
    roofGeom.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, this.matRoofBlue);
    roof.position.y = h + roofH / 2;
    roof.scale.set(1.25, 1, 0.95);
    roof.castShadow = true;
    group.add(roof);

    // Karl's Astronomy Tower (North-West corner spire)
    const towerR = 2.6, towerH = 17.5;
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(towerR, towerR * 1.1, towerH, 16),
      this.matStoneDark
    );
    tower.position.set(-w / 2, towerH / 2, -d / 3);
    tower.castShadow = true;
    group.add(tower);

    // Tower Spire
    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(towerR * 1.3, 7.0, 16),
      this.matRoofBlue
    );
    spire.position.set(-w / 2, towerH + 3.5, -d / 3);
    spire.castShadow = true;
    group.add(spire);

    // Observatory Balcony with telescope
    const balcony = new THREE.Mesh(
      new THREE.CylinderGeometry(towerR * 1.45, towerR * 1.45, 0.5, 16),
      this.matWood
    );
    balcony.position.set(-w / 2, 13.0, -d / 3);
    group.add(balcony);

    // Grand Portal Entrance Arch
    const arch = new THREE.Mesh(new THREE.BoxGeometry(4.0, 5.8, 1.4), this.matStoneDark);
    arch.position.set(0, 2.9, d / 2 + 0.7);
    arch.castShadow = true;
    group.add(arch);

    // Warm glowing Manor Windows
    const winRows = [
      [-4.5, 3.4, d / 2 + 0.06], [4.5, 3.4, d / 2 + 0.06],
      [-4.5, 6.8, d / 2 + 0.06], [0, 6.8, d / 2 + 0.06], [4.5, 6.8, d / 2 + 0.06]
    ];
    winRows.forEach(([wx, wy, wz]) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 0.15), this.matGlowWindow);
      win.position.set(wx, wy, wz);
      group.add(win);
    });

    // Pair of majestic entrance lanterns
    this.createLantern(x - 2.4, 4.5, z + d / 2 + 1.4, 2.8, 0xffbb55);
    this.createLantern(x + 2.4, 4.5, z + d / 2 + 1.4, 2.8, 0xffbb55);

    this.scene.add(group);
    this.addCollider(x, z, w + 4.0, d + 4.5, 'Karl Manor');
    return group;
  }

  // =========================================================================
  // 4. Heltant Tavern (The Boar & Flagon — Tyburn's Meeting Place)
  // =========================================================================
  buildTavern(x = -22, z = 15) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const w = 13.0, h = 6.4, d = 9.5;

    // Foundation
    const found = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 1.0, d + 0.5), this.matStone);
    found.position.y = 0.5;
    group.add(found);

    // Half-timber plaster walls
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.matPlaster);
    walls.position.y = 0.5 + h / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // Roof
    const roofH = 5.2;
    const roofGeom = new THREE.ConeGeometry((w + 2.4) * 0.72, roofH, 4);
    roofGeom.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, this.matRoof);
    roof.position.y = 0.5 + h + roofH / 2;
    roof.scale.set(1.22, 1, 0.95);
    roof.castShadow = true;
    group.add(roof);

    // Outdoor tavern tables & seating
    const table = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.18, 12), this.matWood);
    table.position.set(4.0, 1.1, d / 2 + 3.2);
    group.add(table);

    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.1, 8), this.matWood);
    tableLeg.position.set(4.0, 0.55, d / 2 + 3.2);
    group.add(tableLeg);

    // Beer Mugs with frothy foam on table
    for (let m = 0; m < 3; m++) {
      const mug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.1, 0.25, 8),
        new THREE.MeshStandardMaterial({ color: 0x9e6c38, roughness: 0.5 })
      );
      mug.position.set(4.0 + Math.sin(m * 2) * 0.5, 1.3, d / 2 + 3.2 + Math.cos(m * 2) * 0.5);
      group.add(mug);
    }

    // Stacked Beer Barrels
    for (let i = 0; i < 5; i++) {
      const keg = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 1.2, 10), this.matWood);
      keg.rotation.z = Math.PI / 2;
      keg.position.set(-3.8 + (i % 2) * 1.3, 0.6 + Math.floor(i / 2) * 1.05, d / 2 + 2.0);
      group.add(keg);
    }

    // Tavern Lantern
    this.createLantern(x + 0.6, 3.6, z + d / 2 + 0.3, 2.8, 0xff9933);

    this.scene.add(group);
    this.addCollider(x, z, w + 2.5, d + 4.5, 'Heltant Tavern');
    return group;
  }

  // =========================================================================
  // 5. Sanson's Barracks & Smithy
  // =========================================================================
  buildSmithyAndBarracks(x = 16, z = 22) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const bw = 10.5, bh = 5.5, bd = 8.0;
    const barracks = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), this.matStoneDark);
    barracks.position.set(0, bh / 2, 0);
    barracks.castShadow = true;
    group.add(barracks);

    const roof = new THREE.Mesh(new THREE.ConeGeometry((bw + 1.8) * 0.72, 4.0, 4), this.matRoof);
    roof.rotateY(Math.PI / 4);
    roof.position.set(0, bh + 2.0, 0);
    roof.scale.set(1.2, 1, 0.9);
    roof.castShadow = true;
    group.add(roof);

    // Smithy Shelter
    const sw = 6.5, sd = 6.5;
    [[-bw/2 - sw, -sd/2], [-bw/2 - sw, sd/2], [-bw/2, -sd/2], [-bw/2, sd/2]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.0, 0.35), this.matWood);
      post.position.set(px, 2.0, pz);
      group.add(post);
    });

    const shedRoof = new THREE.Mesh(new THREE.BoxGeometry(sw + 0.9, 0.25, sd + 0.9), this.matWood);
    shedRoof.position.set(-bw / 2 - sw / 2, 4.0, 0);
    shedRoof.rotation.z = 0.12;
    group.add(shedRoof);

    // Glowing Forge Pit (Triggers Bloom)
    const coals = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.25, 1.8),
      new THREE.MeshStandardMaterial({
        color: 0xff3300,
        emissive: 0xff4400,
        emissiveIntensity: 3.5,
        roughness: 0.2
      })
    );
    coals.position.set(-bw / 2 - sw / 2, 1.45, 0);
    group.add(coals);

    const forgeLight = new THREE.PointLight(0xff5511, 4.0, 16, 1.4);
    forgeLight.position.set(-bw / 2 - sw / 2, 2.0, 0);
    group.add(forgeLight);
    this.lighting.registerFlickerLight(forgeLight, 4.0, 0xff5511);

    this.scene.add(group);
    this.addCollider(x, z, bw + sw + 2.0, bd + 3.5, 'Sanson Barracks');
    return group;
  }

  // =========================================================================
  // 6. Western Watchtower & Palisade Gate
  // =========================================================================
  buildWesternWatchtower(x = -38, z = -8) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const tw = 6.4, th = 15.0;
    const postCoords = [[-tw/2, -tw/2], [-tw/2, tw/2], [tw/2, -tw/2], [tw/2, tw/2]];
    postCoords.forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.7, th, 0.7), this.matWood);
      post.position.set(px, th / 2, pz);
      post.castShadow = true;
      group.add(post);
    });

    // Guard platform
    const floor = new THREE.Mesh(new THREE.BoxGeometry(tw + 2.4, 0.45, tw + 2.4), this.matWood);
    floor.position.y = th;
    group.add(floor);

    const roof = new THREE.Mesh(new THREE.ConeGeometry((tw + 3.2) * 0.72, 3.8, 4), this.matRoof);
    roof.rotateY(Math.PI / 4);
    roof.position.y = th + 4.4;
    roof.castShadow = true;
    group.add(roof);

    // Roaring Signal Fire (Bloom trigger)
    const fireCore = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.6),
      new THREE.MeshStandardMaterial({
        color: 0xff3300,
        emissive: 0xff6600,
        emissiveIntensity: 4.2
      })
    );
    fireCore.position.set(0, th + 1.2, 0);
    group.add(fireCore);

    const signalLight = new THREE.PointLight(0xff6611, 4.8, 28, 1.5);
    signalLight.position.set(0, th + 1.8, 0);
    group.add(signalLight);
    this.lighting.registerFlickerLight(signalLight, 4.8, 0xff6611);

    // Palisade Logs
    for (let oz = -30; oz <= 30; oz += 1.3) {
      if (Math.abs(oz - z) < 4.2) continue;
      const logH = 5.2 + Math.sin(oz) * 0.6;
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, logH, 6), this.matWood);
      log.position.set(0, logH / 2, oz);
      log.castShadow = true;
      group.add(log);
    }

    this.scene.add(group);
    this.addCollider(x, z, tw + 2.0, tw + 2.0, 'Western Watchtower');
    this.addCollider(x, z - 18, 2.0, 32, 'North Palisade');
    this.addCollider(x, z + 18, 2.0, 32, 'South Palisade');
    return group;
  }

  // =========================================================================
  // 7. Watermill & Stream
  // =========================================================================
  buildWatermill(x = 32, z = 8) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const mw = 8.5, mh = 5.4, md = 7.5;
    const house = new THREE.Mesh(new THREE.BoxGeometry(mw, mh, md), this.matStone);
    house.position.set(0, mh / 2, 0);
    house.castShadow = true;
    group.add(house);

    const roof = new THREE.Mesh(new THREE.ConeGeometry((mw + 1.6) * 0.72, 3.8, 4), this.matRoof);
    roof.rotateY(Math.PI / 4);
    roof.position.set(0, mh + 1.9, 0);
    roof.scale.set(1.2, 1, 0.9);
    roof.castShadow = true;
    group.add(roof);

    // Water Wheel
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(-mw / 2 - 0.7, 2.8, 0);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.9, 12), this.matWood);
    hub.rotation.z = Math.PI / 2;
    wheelGroup.add(hub);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.16, 8, 20), this.matWood);
    rim.rotation.y = Math.PI / 2;
    wheelGroup.add(rim);

    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.85, 1.5), this.matWoodLight);
      paddle.position.set(0, Math.sin(angle) * 2.4, Math.cos(angle) * 2.4);
      paddle.rotation.x = angle;
      wheelGroup.add(paddle);
    }
    group.add(wheelGroup);

    this.scene.add(group);
    this.addCollider(x, z, mw + 3.0, md + 2.5, 'Watermill');

    this.animatedObjects.push({
      update: (delta) => { wheelGroup.rotation.x += delta * 0.85; }
    });

    return group;
  }

  update(delta) {
    for (let i = 0; i < this.animatedObjects.length; i++) {
      this.animatedObjects[i].update(delta);
    }
  }
}
