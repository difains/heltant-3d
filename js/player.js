/**
 * Dragon Raja: Heltant 3D - Player Character Avatar (Hooch Nedval)
 * Modeled with leather tunic, traveler cloak, back-mounted bastard sword,
 * and the iconic Ogre Power Gauntlets (OPG) with toggleable magical aura.
 */
import * as THREE from 'three';

export class PlayerAvatar {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.opgActive = false;
    this.walkCycle = 0;

    this.initMeshes();
    this.scene.add(this.group);
  }

  initMeshes() {
    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8b896, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x422616, roughness: 0.8 });
    const tunicMat = new THREE.MeshStandardMaterial({ color: 0x3d5440, roughness: 0.85 }); // Forest green tunic
    const vestMat = new THREE.MeshStandardMaterial({ color: 0x5e3e26, roughness: 0.7 });  // Leather vest
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x383533, roughness: 0.9 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x241d17, roughness: 0.7 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x8f939e, roughness: 0.35, metalness: 0.8 });

    // OPG Gauntlet Materials (Normal vs Active Aura)
    this.matGauntlet = new THREE.MeshStandardMaterial({
      color: 0x8a2c1f,
      roughness: 0.4,
      metalness: 0.6,
      emissive: 0x4a0a00,
      emissiveIntensity: 0.4
    });

    // 1. Torso & Leather Vest
    const torsoGeom = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    const torso = new THREE.Mesh(torsoGeom, vestMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.group.add(torso);

    const shirtGeom = new THREE.BoxGeometry(0.65, 0.3, 0.38);
    const shirt = new THREE.Mesh(shirtGeom, tunicMat);
    shirt.position.y = 1.7;
    this.group.add(shirt);

    // 2. Head & Hair
    const headGeom = new THREE.BoxGeometry(0.38, 0.42, 0.38);
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 2.05;
    head.castShadow = true;
    this.group.add(head);

    const hairGeom = new THREE.BoxGeometry(0.42, 0.22, 0.42);
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.position.set(0, 2.2, -0.02);
    this.group.add(hair);

    // 3. Bastard Sword on Back (후치의 바스타드 소드)
    this.swordGroup = new THREE.Group();
    this.swordGroup.position.set(0.05, 1.45, -0.26);
    this.swordGroup.rotation.z = -0.45; // Slung diagonally across back

    // Scabbard & Blade
    const scabbard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.08), vestMat);
    scabbard.position.y = -0.3;
    this.swordGroup.add(scabbard);

    // Sword Crossguard & Pommel
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.08), metalMat);
    guard.position.y = 0.45;
    this.swordGroup.add(guard);

    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 6), bootMat);
    grip.position.y = 0.62;
    this.swordGroup.add(grip);

    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), metalMat);
    pommel.position.y = 0.8;
    this.swordGroup.add(pommel);

    this.group.add(this.swordGroup);

    // 4. Arms & OPG (Ogre Power Gauntlets)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.45, 1.65, 0);
    const armGeom = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const lArmMesh = new THREE.Mesh(armGeom, tunicMat);
    lArmMesh.position.y = -0.25;
    this.leftArm.add(lArmMesh);

    // Left OPG Gauntlet
    this.lGauntlet = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.35, 0.28), this.matGauntlet);
    this.lGauntlet.position.y = -0.55;
    this.leftArm.add(this.lGauntlet);
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.45, 1.65, 0);
    const rArmMesh = new THREE.Mesh(armGeom, tunicMat);
    rArmMesh.position.y = -0.25;
    this.rightArm.add(rArmMesh);

    // Right OPG Gauntlet
    this.rGauntlet = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.35, 0.28), this.matGauntlet);
    this.rGauntlet.position.y = -0.55;
    this.rightArm.add(this.rGauntlet);
    this.group.add(this.rightArm);

    // OPG Aura Particle Points
    const auraGeom = new THREE.BufferGeometry();
    const auraPos = new Float32Array(24 * 3);
    for (let i = 0; i < 24; i++) {
      auraPos[i * 3] = (Math.random() - 0.5) * 0.4;
      auraPos[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      auraPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    auraGeom.setAttribute('position', new THREE.BufferAttribute(auraPos, 3));
    this.matAura = new THREE.PointsMaterial({
      color: 0xff3300,
      size: 0.15,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    this.auraMesh = new THREE.Points(auraGeom, this.matAura);
    this.group.add(this.auraMesh);

    // 5. Legs & Boots
    const legGeom = new THREE.BoxGeometry(0.24, 0.75, 0.24);
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.2, 0.85, 0);
    const lLegMesh = new THREE.Mesh(legGeom, pantsMat);
    lLegMesh.position.y = -0.35;
    lLegMesh.castShadow = true;
    this.leftLeg.add(lLegMesh);

    const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.35, 0.35), bootMat);
    lBoot.position.set(0, -0.65, 0.05);
    this.leftLeg.add(lBoot);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.2, 0.85, 0);
    const rLegMesh = new THREE.Mesh(legGeom, pantsMat);
    rLegMesh.position.y = -0.35;
    rLegMesh.castShadow = true;
    this.rightLeg.add(rLegMesh);

    const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.35, 0.35), bootMat);
    rBoot.position.set(0, -0.65, 0.05);
    this.rightLeg.add(rBoot);
    this.group.add(this.rightLeg);
  }

  setOpgActive(active) {
    this.opgActive = active;
    if (active) {
      this.matGauntlet.emissive.setHex(0xff2200);
      this.matGauntlet.emissiveIntensity = 2.4;
      this.matAura.opacity = 0.9;
    } else {
      this.matGauntlet.emissive.setHex(0x4a0a00);
      this.matGauntlet.emissiveIntensity = 0.4;
      this.matAura.opacity = 0.0;
    }
  }

  updateAnimation(isMoving, isRunning, delta) {
    if (isMoving) {
      const speedMult = isRunning ? 14 : 9;
      this.walkCycle += delta * speedMult;

      const swing = Math.sin(this.walkCycle) * 0.6;
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing * 0.7;
      this.rightArm.rotation.x = swing * 0.7;
      this.group.position.y = Math.abs(Math.sin(this.walkCycle * 2)) * 0.06;
    } else {
      // Idle breath
      this.walkCycle += delta * 2.0;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = Math.sin(this.walkCycle) * 0.05;
      this.rightArm.rotation.x = -Math.sin(this.walkCycle) * 0.05;
      this.group.position.y = Math.sin(this.walkCycle) * 0.02;
    }

    // OPG Aura flicker
    if (this.opgActive) {
      this.matGauntlet.emissiveIntensity = 2.0 + Math.sin(this.walkCycle * 6) * 0.8;
      this.auraMesh.position.copy(this.group.position).add(new THREE.Vector3(0, 1.2, 0));
      this.auraMesh.rotation.y += delta * 4.0;
    }
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  setRotationY(rad) {
    this.group.rotation.y = rad;
  }

  setVisible(visible) {
    this.group.visible = visible;
  }
}
