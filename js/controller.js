/**
 * Dragon Raja: Heltant 3D - First/Third-Person Player Controller
 * Keyboard (WASD), mouse look (PointerLock + drag fallback), jump, sprint, and collision physics.
 */
import * as THREE from 'three';
import { sound } from './audio.js';

export class PlayerController {
  constructor(camera, domElement, colliders, avatar) {
    this.camera = camera;
    this.domElement = domElement;
    this.colliders = colliders;
    this.avatar = avatar;

    // Position & Orientation
    this.position = new THREE.Vector3(0, 0, 7.5); // Start in village center facing well
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.yaw = 0; // Face north initially
    this.pitch = -0.05; // Slight downward view

    // Movement Parameters
    this.walkSpeed = 6.2;
    this.runSpeed = 10.5;
    this.jumpForce = 8.5;
    this.gravity = 22.0;
    this.isGrounded = true;

    // View Modes: 'first' | 'third'
    this.viewMode = 'first';
    this.thirdPersonDist = 4.8;
    this.thirdPersonHeight = 2.4;

    // Input States
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false
    };

    this.isPointerLocked = false;
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.stepDistance = 0;

    this.initEventListeners();
    this.updateCamera();
  }

  initEventListeners() {
    // Keyboard listeners
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      this.handleKeyDown(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.handleKeyUp(e.code);
    });

    // Pointer Lock
    this.domElement.addEventListener('click', () => {
      if (!this.isPointerLocked && document.pointerLockElement !== this.domElement) {
        this.domElement.requestPointerLock?.();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = (document.pointerLockElement === this.domElement);
    });

    // Mouse Movement
    window.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.rotateView(e.movementX * 0.0022, e.movementY * 0.0022);
      } else if (this.isDragging) {
        const dx = e.clientX - this.prevMousePos.x;
        const dy = e.clientY - this.prevMousePos.y;
        this.rotateView(dx * 0.003, dy * 0.003);
        this.prevMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    this.domElement.addEventListener('mousedown', (e) => {
      if (!this.isPointerLocked) {
        this.isDragging = true;
        this.prevMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch Support for mobile
    let touchStart = null;
    this.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    this.domElement.addEventListener('touchmove', (e) => {
      if (!touchStart || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - touchStart.x;
      const dy = e.touches[0].clientY - touchStart.y;
      this.rotateView(dx * 0.004, dy * 0.004);
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
  }

  handleKeyDown(code) {
    switch (code) {
      case 'KeyW': case 'ArrowUp': this.keys.forward = true; break;
      case 'KeyS': case 'ArrowDown': this.keys.backward = true; break;
      case 'KeyA': case 'ArrowLeft': this.keys.left = true; break;
      case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = true; break;
      case 'Space':
        if (this.isGrounded) {
          this.velocity.y = this.jumpForce;
          this.isGrounded = false;
        }
        break;
      case 'KeyV':
        this.toggleViewMode();
        break;
    }
  }

  handleKeyUp(code) {
    switch (code) {
      case 'KeyW': case 'ArrowUp': this.keys.forward = false; break;
      case 'KeyS': case 'ArrowDown': this.keys.backward = false; break;
      case 'KeyA': case 'ArrowLeft': this.keys.left = false; break;
      case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = false; break;
    }
  }

  rotateView(deltaYaw, deltaPitch) {
    this.yaw -= deltaYaw;
    this.pitch -= deltaPitch;
    const maxPitch = Math.PI / 2 - 0.08;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
  }

  toggleViewMode() {
    this.viewMode = (this.viewMode === 'first') ? 'third' : 'first';
    const crosshair = document.getElementById('crosshair');
    if (crosshair) {
      crosshair.classList.toggle('hidden', this.viewMode === 'third');
    }
    const label = document.getElementById('view-mode-label');
    if (label) {
      label.textContent = (this.viewMode === 'first') ? '1인칭' : '3인칭';
    }
    this.avatar.setVisible(this.viewMode === 'third');
    return this.viewMode;
  }

  checkCollision(px, pz, radius = 0.6) {
    for (let i = 0; i < this.colliders.length; i++) {
      const c = this.colliders[i];
      if (
        px + radius > c.minX &&
        px - radius < c.maxX &&
        pz + radius > c.minZ &&
        pz - radius < c.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  update(delta) {
    // 1. Direction vector from Yaw
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const moveDir = new THREE.Vector3(0, 0, 0);
    if (this.keys.forward) moveDir.add(forward);
    if (this.keys.backward) moveDir.sub(forward);
    if (this.keys.right) moveDir.add(right);
    if (this.keys.left) moveDir.sub(right);

    const isMoving = moveDir.lengthSq() > 0.001;
    if (isMoving) moveDir.normalize();

    const speed = this.keys.sprint ? this.runSpeed : this.walkSpeed;
    const targetVx = moveDir.x * speed;
    const targetVz = moveDir.z * speed;

    // Smooth movement dampening
    this.velocity.x += (targetVx - this.velocity.x) * Math.min(1.0, delta * 12.0);
    this.velocity.z += (targetVz - this.velocity.z) * Math.min(1.0, delta * 12.0);

    // Gravity & Ground Check
    this.velocity.y -= this.gravity * delta;
    this.position.y += this.velocity.y * delta;

    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // 2. Collision Resolution (separate X and Z axis sliding)
    const nextX = this.position.x + this.velocity.x * delta;
    if (!this.checkCollision(nextX, this.position.z)) {
      this.position.x = nextX;
    } else {
      this.velocity.x = 0;
    }

    const nextZ = this.position.z + this.velocity.z * delta;
    if (!this.checkCollision(this.position.x, nextZ)) {
      this.position.z = nextZ;
    } else {
      this.velocity.z = 0;
    }

    // Footsteps sound rhythm
    if (isMoving && this.isGrounded) {
      const stepDist = this.keys.sprint ? 2.4 : 1.8;
      this.stepDistance += Math.hypot(this.velocity.x, this.velocity.z) * delta;
      if (this.stepDistance >= stepDist) {
        sound.playFootstep();
        this.stepDistance = 0;
      }
    }

    // Update Avatar model
    this.avatar.setPosition(this.position.x, this.position.y, this.position.z);
    this.avatar.setRotationY(this.yaw + Math.PI);
    this.avatar.updateAnimation(isMoving, this.keys.sprint, delta);

    this.updateCamera();
  }

  updateCamera() {
    if (this.viewMode === 'first') {
      // 1st Person: Camera directly at player eyes
      const eyeHeight = 1.72;
      this.camera.position.set(this.position.x, this.position.y + eyeHeight, this.position.z);
      const lookTarget = new THREE.Vector3(
        this.camera.position.x - Math.sin(this.yaw) * Math.cos(this.pitch),
        this.camera.position.y + Math.sin(this.pitch),
        this.camera.position.z - Math.cos(this.yaw) * Math.cos(this.pitch)
      );
      this.camera.lookAt(lookTarget);
      this.avatar.setVisible(false);
    } else {
      // 3rd Person: Camera orbits behind player
      this.avatar.setVisible(true);
      const camOffset = new THREE.Vector3(
        Math.sin(this.yaw) * Math.cos(this.pitch) * this.thirdPersonDist,
        this.thirdPersonHeight - Math.sin(this.pitch) * this.thirdPersonDist,
        Math.cos(this.yaw) * Math.cos(this.pitch) * this.thirdPersonDist
      );

      const targetCamPos = this.position.clone().add(camOffset);
      this.camera.position.lerp(targetCamPos, 0.4);

      const lookTarget = this.position.clone().add(new THREE.Vector3(0, 1.4, 0));
      this.camera.lookAt(lookTarget);
    }
  }

  getPosition() {
    return this.position;
  }

  getYaw() {
    return this.yaw;
  }
}
