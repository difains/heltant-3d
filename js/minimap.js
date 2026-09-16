/**
 * Dragon Raja: Heltant 3D - Minimap Radar HUD
 * 2D Canvas radar displaying player position, field-of-view cone, roads, and landmark markers.
 */

export class Minimap {
  constructor(canvasId, controller, landmarks) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.controller = controller;
    this.landmarks = landmarks;

    this.worldRadius = 60; // Coordinate scale matching 3D world
    this.mapRadius = this.canvas.width / 2;
  }

  worldToMap(wx, wz) {
    const scale = this.mapRadius / this.worldRadius;
    const mx = this.mapRadius + wx * scale;
    const my = this.mapRadius + wz * scale;
    return { x: mx, y: my };
  }

  update() {
    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // 1. Circular map background
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, this.mapRadius - 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#1e1811';
    ctx.fillRect(0, 0, w, h);

    // 2. River on the East side
    const riverX = this.worldToMap(27, 0).x;
    ctx.fillStyle = 'rgba(40, 95, 125, 0.65)';
    ctx.fillRect(riverX - 6, 0, 12, h);

    // 3. Roads / paths
    ctx.strokeStyle = '#423727';
    ctx.lineWidth = 5;
    ctx.beginPath();
    // Center to Karl Manor (North)
    const cPt = this.worldToMap(0, 0);
    const kPt = this.worldToMap(0, -32);
    ctx.moveTo(cPt.x, cPt.y);
    ctx.lineTo(kPt.x, kPt.y);
    // Center to Hooch (NE)
    const hPt = this.worldToMap(18, -8);
    ctx.moveTo(cPt.x, cPt.y);
    ctx.lineTo(hPt.x, hPt.y);
    // Center to Tavern (SW)
    const tPt = this.worldToMap(-20, 15);
    ctx.moveTo(cPt.x, cPt.y);
    ctx.lineTo(tPt.x, tPt.y);
    // Center to Sanson (SE)
    const sPt = this.worldToMap(14, 20);
    ctx.moveTo(cPt.x, cPt.y);
    ctx.lineTo(sPt.x, sPt.y);
    // Center to Watchtower (West)
    const wPt = this.worldToMap(-36, -8);
    ctx.moveTo(cPt.x, cPt.y);
    ctx.lineTo(wPt.x, wPt.y);
    // Center to Watermill (East)
    const mPt = this.worldToMap(30, 8);
    ctx.moveTo(cPt.x, cPt.y);
    ctx.lineTo(mPt.x, mPt.y);
    ctx.stroke();

    // 4. Western Palisade Wall Line
    const palX = this.worldToMap(-38, 0).x;
    ctx.strokeStyle = 'rgba(160, 60, 40, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(palX, 10);
    ctx.lineTo(palX, h - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Landmark Marker Pins
    for (let i = 0; i < this.landmarks.length; i++) {
      const lm = this.landmarks[i];
      const pt = this.worldToMap(lm.pos.x, lm.pos.z);

      ctx.fillStyle = '#ffd479';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#22160d';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 6. Player Position & Orientation Cone
    const pPos = this.controller.getPosition();
    const pYaw = this.controller.getYaw();
    const pMap = this.worldToMap(pPos.x, pPos.z);

    // FOV Cone
    ctx.fillStyle = 'rgba(226, 183, 101, 0.22)';
    ctx.beginPath();
    ctx.moveTo(pMap.x, pMap.y);
    const fovAngle = Math.PI / 4;
    const coneLen = 22;
    // Note: in 3D, forward is (-sin(yaw), -cos(yaw))
    const dirAngle = Math.atan2(-Math.cos(pYaw), -Math.sin(pYaw));
    ctx.arc(pMap.x, pMap.y, coneLen, dirAngle - fovAngle, dirAngle + fovAngle);
    ctx.closePath();
    ctx.fill();

    // Player Marker Arrow
    ctx.save();
    ctx.translate(pMap.x, pMap.y);
    ctx.rotate(dirAngle);

    ctx.fillStyle = '#ff4422';
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-5, -4);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-5, 4);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    ctx.restore(); // restore clip
  }
}
