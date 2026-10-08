/**
 * HoopConvert Basketball Physics & Court Engine
 * Canvas-based interactive physics with full-length trajectory guide,
 * generous hoop magnet suction, dynamic cloth net, backboard bank bounce,
 * rim collisions, swish detection, slam dunk cinematics, and particle sparks.
 */

import { sounds } from './audio.js';

export class BasketballArena {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;

    // Callbacks
    this.onSwish = options.onSwish || (() => {});
    this.onShoot = options.onShoot || (() => {});
    this.onMiss = options.onMiss || (() => {});
    this.onStateChange = options.onStateChange || (() => {});

    // Arena dimensions & scaling
    this.width = canvas.width;
    this.height = canvas.height;
    this.dpr = window.devicePixelRatio || 1;

    // Document metadata stamped on the ball
    this.docBadge = 'PDF';
    this.docName = 'Drop a file to play';
    this.docColor = '#ff6b00';

    // Ball state
    this.ballRadius = 36;
    this.ballOriginalX = 0;
    this.ballOriginalY = 0;
    this.ball = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 36,
      rotation: 0,
      vRot: 0,
      isAirborne: false,
      isDunking: false,
      hasScored: false,
      visible: true
    };

    // Hoop & Backboard geometry
    this.hoop = {
      x: 0,
      y: 0,
      backboardX: 0,
      backboardY: 0,
      backboardW: 14,
      backboardH: 140,
      rimLeftX: 0,
      rimRightX: 0,
      rimY: 0,
      rimRadius: 8,
      netHeight: 75
    };

    // Net rope nodes for dynamic cloth physics
    this.netNodes = [];

    // Interaction state
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragCurrent = { x: 0, y: 0 };
    this.power = 0;
    this.angle = 0;

    // Particles
    this.particles = [];
    this.fireTrail = [];

    // Camera shake
    this.shakeIntensity = 0;

    // Tuned physics: floatier, gentle gravity and generous magnetic assist
    this.gravity = 0.50;
    this.friction = 0.995;
    this.bounceDamping = 0.65;
    this.aimAssist = true;

    // Setup events & loop
    this.setupResize();
    this.setupInput();
    this.resetBallPosition();

    this.lastTime = performance.now();
    this.animId = requestAnimationFrame(this.loop.bind(this));
  }

  setupResize() {
    const resize = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.resetTransform();
      this.ctx.scale(this.dpr, this.dpr);

      this.updateHoopGeometry();
      if (!this.ball.isAirborne && !this.isDragging) {
        this.resetBallPosition();
      }
    };

    window.addEventListener('resize', resize);
    resize();
  }

  updateHoopGeometry() {
    // Bring hoop closer & lower so it's comfortably in range
    const hoopMarginRight = Math.max(this.width * 0.28, 200);
    const hoopTop = Math.max(this.height * 0.35, 170);

    const backboardX = this.width - hoopMarginRight;
    const backboardY = hoopTop - 60;
    const rimY = hoopTop + 45;
    const rimWidth = 130; // Extra wide rim aperture for effortless scoring!
    const rimRightX = backboardX - 8;
    const rimLeftX = rimRightX - rimWidth;

    this.hoop = {
      x: (rimLeftX + rimRightX) / 2,
      y: rimY,
      backboardX,
      backboardY,
      backboardW: 14,
      backboardH: 140,
      rimLeftX,
      rimRightX,
      rimY,
      rimRadius: 8,
      netHeight: 75
    };

    this.initNetNodes();
  }

  initNetNodes() {
    this.netNodes = [];
    const segments = 7;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = this.hoop.rimLeftX + (this.hoop.rimRightX - this.hoop.rimLeftX) * t;
      this.netNodes.push({
        origX: x,
        origY: this.hoop.rimY + 5,
        x: x,
        y: this.hoop.rimY + 5,
        vx: 0,
        vy: 0,
        bottomX: x - (x - this.hoop.x) * 0.35,
        bottomY: this.hoop.rimY + this.hoop.netHeight,
        curBottomX: x - (x - this.hoop.x) * 0.35,
        curBottomY: this.hoop.rimY + this.hoop.netHeight,
        bvx: 0,
        bvy: 0
      });
    }
  }

  resetBallPosition() {
    // Position ball comfortably closer to hoop on shooting pad
    this.ballOriginalX = Math.max(this.width * 0.35, 200);
    this.ballOriginalY = Math.min(this.height * 0.70, this.height - 120);

    this.ball.x = this.ballOriginalX;
    this.ball.y = this.ballOriginalY;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.vRot = 0;
    this.ball.isAirborne = false;
    this.ball.isDunking = false;
    this.ball.hasScored = false;
    this.ball.visible = true;

    this.fireTrail = [];
    this.onStateChange({ state: 'ready', ball: this.ball });
  }

  setDocument(badge, name, color = '#ff6b00') {
    this.docBadge = badge.toUpperCase();
    this.docName = name;
    this.docColor = color;
  }

  setupInput() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const isOverBall = (pos) => {
      const dx = pos.x - this.ball.x;
      const dy = pos.y - this.ball.y;
      return Math.sqrt(dx * dx + dy * dy) <= this.ball.radius * 1.6;
    };

    const onDown = (e) => {
      if (this.ball.isAirborne || this.ball.isDunking) return;
      const pos = getPos(e);
      if (isOverBall(pos)) {
        this.isDragging = true;
        this.dragStart = { x: this.ball.x, y: this.ball.y };
        this.dragCurrent = pos;
        sounds.playDribble(0.4);
      }
    };

    const onMove = (e) => {
      if (!this.isDragging) return;
      this.dragCurrent = getPos(e);

      // Slingshot vector: pulling back shoots forward towards hoop
      const pullX = this.dragStart.x - this.dragCurrent.x;
      const pullY = this.dragStart.y - this.dragCurrent.y;
      const dist = Math.sqrt(pullX * pullX + pullY * pullY);

      this.power = Math.min(dist / 2.8, 100);
      this.angle = Math.atan2(pullY, pullX) * (180 / Math.PI);
    };

    const onUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;

      const pullX = this.dragStart.x - this.dragCurrent.x;
      const pullY = this.dragStart.y - this.dragCurrent.y;
      const dist = Math.sqrt(pullX * pullX + pullY * pullY);

      if (dist > 15) {
        // Intuitive, responsive slingshot momentum
        const force = Math.min(dist * 0.165, 25);
        const shootAngle = Math.atan2(pullY, pullX);

        this.shoot(
          Math.cos(shootAngle) * force,
          Math.sin(shootAngle) * force
        );
      } else {
        // Cancelled shot
        this.ball.x = this.ballOriginalX;
        this.ball.y = this.ballOriginalY;
      }
    };

    this.canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    this.canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  }

  shoot(vx, vy) {
    if (this.ball.isAirborne) return;

    // Minimum forward and upward momentum for friendly arc
    if (vx < 2) vx = 8;
    if (vy > -2) vy = -11;

    this.ball.vx = vx;
    this.ball.vy = vy;
    this.ball.vRot = (vx > 0 ? 0.08 : -0.08) + Math.random() * 0.04;
    this.ball.isAirborne = true;
    this.ball.hasScored = false;

    sounds.playShoot();
    this.onShoot({ power: this.power, vx, vy });
    this.onStateChange({ state: 'shooting', ball: this.ball });
  }

  /**
   * Cinematic Auto Slam Dunk (100% Guaranteed Swish)
   */
  triggerSlamDunk() {
    if (this.ball.isAirborne || this.ball.isDunking) return;
    this.ball.isAirborne = true;
    this.ball.isDunking = true;
    this.ball.hasScored = false;

    sounds.playShoot();
    this.onShoot({ power: 100, isDunk: true });
    this.onStateChange({ state: 'dunking', ball: this.ball });

    const startX = this.ballOriginalX;
    const startY = this.ballOriginalY;
    const dunkApexX = this.hoop.x - 20;
    const dunkApexY = this.hoop.rimY - 75;
    const dunkRimX = this.hoop.x;
    const dunkRimY = this.hoop.rimY + 10;

    let progress = 0;
    const duration = 1100;
    const startTime = performance.now();

    const dunkStep = (now) => {
      const elapsed = now - startTime;
      progress = Math.min(elapsed / duration, 1);

      if (progress < 0.65) {
        const p = progress / 0.65;
        const easeP = Math.sin((p * Math.PI) / 2);
        this.ball.x = startX + (dunkApexX - startX) * easeP;
        this.ball.y = startY + (dunkApexY - startY) * easeP;
        this.ball.rotation += 0.15;
      } else {
        const p = (progress - 0.65) / 0.35;
        const easeP = p * p;
        this.ball.x = dunkApexX + (dunkRimX - dunkApexX) * easeP;
        this.ball.y = dunkApexY + (dunkRimY - dunkApexY) * easeP;
        this.ball.rotation += 0.25;

        if (progress >= 0.95 && !this.ball.hasScored) {
          this.triggerSwish(true);
        }
      }

      if (progress < 1) {
        requestAnimationFrame(dunkStep);
      } else {
        this.ball.isDunking = false;
        this.ball.vx = 2;
        this.ball.vy = 5;
      }
    };

    requestAnimationFrame(dunkStep);
  }

  /**
   * Standard 3-Point Auto Shot (Calculated Clean Swish)
   */
  triggerThreePointer() {
    if (this.ball.isAirborne || this.ball.isDunking) return;
    this.ball.x = this.ballOriginalX;
    this.ball.y = this.ballOriginalY;

    // Calculate arc that directly lands in hoop center
    const dx = this.hoop.x - this.ball.x;
    const dy = (this.hoop.rimY - 10) - this.ball.y;
    const frames = 28;
    const vx = dx / (frames * 0.94);
    const vy = (dy - 0.5 * this.gravity * frames * frames) / frames;

    this.shoot(vx, vy);
  }

  triggerSwish(isDunk = false) {
    if (this.ball.hasScored) return;
    this.ball.hasScored = true;

    // Net physical wave
    this.disturbNet(isDunk ? 28 : 18);

    // Audio triggers
    sounds.playSwish();
    setTimeout(() => sounds.playBuzzer(), 180);
    setTimeout(() => sounds.playCheer(), 350);

    // Screen shake
    this.shakeIntensity = isDunk ? 10 : 5;

    // Particle spark burst
    this.spawnSparks(this.hoop.x, this.hoop.rimY + 20, isDunk ? 45 : 30);

    // Notify controller to trigger file conversion!
    this.onSwish({
      isDunk,
      points: 3,
      streak: true
    });
    this.onStateChange({ state: 'swish', ball: this.ball });
  }

  disturbNet(strength) {
    this.netNodes.forEach((node) => {
      node.bvy += strength * (0.8 + Math.random() * 0.4);
      node.bvx += (Math.random() - 0.5) * strength * 0.6;
    });
  }

  spawnSparks(x, y, count = 28) {
    const colors = ['#ff5500', '#ffb700', '#00e5ff', '#ffffff', '#a855f7', '#00ffaa'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        radius: 2 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0.8 + Math.random() * 0.6
      });
    }
  }

  updatePhysics(dt) {
    if (!this.ball.isAirborne || this.ball.isDunking) return;

    // Apply gravity & velocity
    this.ball.vy += this.gravity;
    this.ball.vx *= this.friction;
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    this.ball.rotation += this.ball.vRot;

    // Fire trail
    const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
    if (speed > 10) {
      this.fireTrail.push({
        x: this.ball.x,
        y: this.ball.y,
        radius: this.ball.radius * (0.4 + Math.random() * 0.3),
        alpha: 0.6,
        color: '#ff6b00'
      });
      if (this.fireTrail.length > 18) this.fireTrail.shift();
    }

    // FRIENDLY HOOP MAGNET SUCTION (Guaranteed "goes inside")
    if (this.aimAssist && !this.ball.hasScored) {
      const distToHoop = Math.hypot(this.ball.x - this.hoop.x, this.ball.y - this.hoop.rimY);
      if (distToHoop < 175) {
        // Smoothly and firmly guide ball into the center of the rim
        const pullFactor = Math.max((175 - distToHoop) / 175, 0);
        this.ball.vx += (this.hoop.x - this.ball.x) * (0.08 + pullFactor * 0.12);
        if (this.ball.y < this.hoop.rimY + 25 && this.ball.vy > -4) {
          this.ball.vy += 0.28 * pullFactor;
        }
      }
    }

    // GENEROUS SWISH CHECK across wide rim
    if (!this.ball.hasScored && this.ball.vy > -1) {
      const withinRimX = this.ball.x >= this.hoop.rimLeftX - 12 && this.ball.x <= this.hoop.rimRightX + 12;
      const atRimLevel = Math.abs(this.ball.y - this.hoop.rimY) < 38;

      if (withinRimX && atRimLevel) {
        this.triggerSwish(false);
      }
    }

    // Backboard collision with friendly rebound straight into the net
    const bb = this.hoop;
    if (
      this.ball.x + this.ball.radius > bb.backboardX &&
      this.ball.x - this.ball.radius < bb.backboardX + bb.backboardW &&
      this.ball.y > bb.backboardY &&
      this.ball.y < bb.backboardY + bb.backboardH
    ) {
      this.ball.x = bb.backboardX - this.ball.radius;
      this.ball.vx = -Math.abs(this.ball.vx) * 0.45;
      this.ball.vy = Math.max(this.ball.vy, 2.5); // Guide into the rim
      sounds.playRimHit(0.8);
      this.spawnSparks(bb.backboardX, this.ball.y, 8);
    }

    // Rim Pin Collisions
    this.checkRimVertexCollision(bb.rimLeftX, bb.rimY);
    this.checkRimVertexCollision(bb.rimRightX, bb.rimY);

    // Floor collision
    const floorY = this.height - 50;
    if (this.ball.y + this.ball.radius > floorY) {
      this.ball.y = floorY - this.ball.radius;
      if (Math.abs(this.ball.vy) > 2) {
        sounds.playDribble(Math.min(Math.abs(this.ball.vy) / 15, 0.7));
      }
      this.ball.vy = -this.ball.vy * this.bounceDamping;
      this.ball.vx *= 0.85;

      // Reset after miss
      if (!this.ball.hasScored && Math.abs(this.ball.vy) < 2) {
        if (!this.missTimeout) {
          this.missTimeout = setTimeout(() => {
            this.onMiss();
            this.resetBallPosition();
            this.missTimeout = null;
          }, 1100);
        }
      }
    }

    // Out of bounds check
    if (this.ball.x > this.width + 120 || this.ball.x < -100) {
      if (!this.missTimeout) {
        this.missTimeout = setTimeout(() => {
          this.onMiss();
          this.resetBallPosition();
          this.missTimeout = null;
        }, 600);
      }
    }
  }

  checkRimVertexCollision(rx, ry) {
    const dx = this.ball.x - rx;
    const dy = this.ball.y - ry;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = this.ball.radius + this.hoop.rimRadius;

    if (dist < minDist) {
      // Bounce inward toward the rim center
      const angle = Math.atan2(dy, dx);
      this.ball.x = rx + Math.cos(angle) * minDist;
      this.ball.y = ry + Math.sin(angle) * minDist;

      // Friendly inward deflection
      const inwardSign = rx < this.hoop.x ? 1 : -1;
      this.ball.vx = Math.abs(this.ball.vx) * inwardSign * 0.6;
      this.ball.vy = Math.max(this.ball.vy, 1.5);

      sounds.playRimHit(0.7);
      this.spawnSparks(rx, ry, 6);
    }
  }

  updateNetPhysics() {
    const k = 0.12;
    const damp = 0.88;

    this.netNodes.forEach((node) => {
      if (this.ball.hasScored && this.ball.y > this.hoop.rimY && this.ball.y < this.hoop.rimY + this.hoop.netHeight + 35) {
        const dx = this.ball.x - node.curBottomX;
        const dy = this.ball.y - node.curBottomY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.ball.radius + 15) {
          node.curBottomX += dx * 0.25;
          node.curBottomY += dy * 0.15;
        }
      }

      const fx = (node.bottomX - node.curBottomX) * k;
      const fy = (node.bottomY - node.curBottomY) * k;

      node.bvx = (node.bvx + fx) * damp;
      node.bvy = (node.bvy + fy) * damp;

      node.curBottomX += node.bvx;
      node.curBottomY += node.bvy;
    });
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.alpha -= 0.025;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.fireTrail.length - 1; i >= 0; i--) {
      const f = this.fireTrail[i];
      f.alpha -= 0.04;
      f.radius *= 0.94;
      if (f.alpha <= 0) {
        this.fireTrail.splice(i, 1);
      }
    }
  }

  loop(time) {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.updatePhysics(dt);
    this.updateNetPhysics();
    this.updateParticles();

    this.render();

    this.animId = requestAnimationFrame(this.loop.bind(this));
  }

  render() {
    const ctx = this.ctx;
    ctx.save();

    // Camera shake
    if (this.shakeIntensity > 0) {
      const ox = (Math.random() - 0.5) * this.shakeIntensity;
      const oy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(ox, oy);
      this.shakeIntensity *= 0.88;
      if (this.shakeIntensity < 0.2) this.shakeIntensity = 0;
    }

    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Court Floor & NBA Markings
    this.drawCourtFloor(ctx);

    // 2. Full-length Trajectory Aiming Arc (Extended all the way across court!)
    if (this.isDragging) {
      this.drawTrajectoryArc(ctx);
    }

    // 3. Draw Fire Trail
    this.drawFireTrail(ctx);

    // 4. Draw Hoop, Backboard & Net
    this.drawHoop(ctx);

    // 5. Draw Basketball with Document Badge
    this.drawBall(ctx);

    // 6. Draw Sparks & Particles
    this.drawParticles(ctx);

    // 7. Draw Launch Pad HUD
    this.drawLaunchPad(ctx);

    ctx.restore();
  }

  drawCourtFloor(ctx) {
    const floorY = this.height - 50;
    ctx.save();

    // Soft court floor gradient
    const grad = ctx.createLinearGradient(0, floorY, 0, this.height);
    grad.addColorStop(0, 'rgba(16, 24, 48, 0.9)');
    grad.addColorStop(1, 'rgba(8, 12, 26, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, floorY, this.width, this.height - floorY);

    // Hardwood court boundary line
    ctx.strokeStyle = 'rgba(255, 85, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(this.width, floorY);
    ctx.stroke();

    // Glowing 3-Point Arc on floor
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.hoop.x, floorY, Math.max(this.width * 0.38, 240), Math.PI, Math.PI * 1.5);
    ctx.stroke();

    // Free throw key lane
    ctx.fillStyle = 'rgba(255, 85, 0, 0.05)';
    ctx.fillRect(this.hoop.x - 110, floorY - 6, 220, 6);
    ctx.strokeStyle = 'rgba(255, 183, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.hoop.x - 110, floorY - 6, 220, 6);

    ctx.restore();
  }

  drawLaunchPad(ctx) {
    if (this.ball.isAirborne) return;

    ctx.save();
    const padX = this.ballOriginalX;
    const padY = this.ballOriginalY + this.ballRadius + 14;

    // Pulsing target circle
    const pulse = Math.sin(performance.now() * 0.005) * 4;
    ctx.strokeStyle = 'rgba(255, 85, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.ellipse(padX, padY, 46 + pulse, 16 + pulse * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Floating helpful text banner
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DRAG & RELEASE TO SHOOT', padX, padY + 32);

    ctx.restore();
  }

  /**
   * FULL-LENGTH Trajectory Arc that extends all the way across screen!
   */
  drawTrajectoryArc(ctx) {
    ctx.save();
    const pullX = this.dragStart.x - this.dragCurrent.x;
    const pullY = this.dragStart.y - this.dragCurrent.y;
    const dist = Math.sqrt(pullX * pullX + pullY * pullY);

    if (dist < 12) {
      ctx.restore();
      return;
    }

    const force = Math.min(dist * 0.165, 25);
    const shootAngle = Math.atan2(pullY, pullX);
    let simVx = Math.cos(shootAngle) * force;
    let simVy = Math.sin(shootAngle) * force;

    if (simVx < 2) simVx = 8;
    if (simVy > -2) simVy = -11;

    let simX = this.ball.x;
    let simY = this.ball.y;

    // Simulate FULL PATH (140 steps so line reaches target completely!)
    const steps = 140;
    const dt = 1;
    let targetLocked = false;
    const pathPoints = [];

    for (let i = 0; i < steps; i++) {
      simVy += this.gravity * dt;
      simVx *= this.friction;
      simX += simVx * dt;
      simY += simVy * dt;

      // Stop once ball hits the floor or leaves right boundary
      if (simY > this.height - 45) {
        pathPoints.push({ x: simX, y: this.height - 45, i });
        break;
      }
      if (simX > this.width + 100) break;

      pathPoints.push({ x: simX, y: simY, i });

      // Check if arc passes through hoop rim target zone
      const distToHoop = Math.hypot(simX - this.hoop.x, simY - this.hoop.rimY);
      if (distToHoop < 58) {
        targetLocked = true;
      }
    }

    const totalDrawn = pathPoints.length;

    // Draw full glowing dotted parabolic trajectory
    for (let idx = 0; idx < totalDrawn; idx++) {
      const pt = pathPoints[idx];
      const progress = idx / totalDrawn;
      const alpha = Math.max(1 - progress * 0.65, 0.35);
      const radius = Math.max(5.5 - progress * 2.5, 2.5);

      ctx.fillStyle = targetLocked
        ? `rgba(0, 255, 170, ${alpha})`
        : `rgba(255, 183, 0, ${alpha})`;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Slingshot pull line behind ball
    ctx.strokeStyle = targetLocked ? 'rgba(0, 255, 170, 0.85)' : 'rgba(255, 85, 0, 0.75)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(this.ball.x, this.ball.y);
    ctx.lineTo(this.dragCurrent.x, this.dragCurrent.y);
    ctx.stroke();

    // Pull handle dot
    ctx.fillStyle = targetLocked ? '#00ffaa' : '#ff5500';
    ctx.beginPath();
    ctx.arc(this.dragCurrent.x, this.dragCurrent.y, 9, 0, Math.PI * 2);
    ctx.fill();

    // Prominent Target Reticle around the hoop rim when aiming!
    const pulse = Math.sin(performance.now() * 0.012) * 5;
    ctx.strokeStyle = targetLocked ? '#00ffaa' : 'rgba(255, 183, 0, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(this.hoop.x, this.hoop.rimY, 36 + pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing target text above rim
    ctx.fillStyle = targetLocked ? '#00ffaa' : '#ffb700';
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      targetLocked ? 'TARGET LOCKED — RELEASE TO SWISH!' : 'AIM AT RIM',
      this.hoop.x,
      this.hoop.rimY - 48
    );

    ctx.restore();
  }

  drawFireTrail(ctx) {
    ctx.save();
    for (const f of this.fireTrail) {
      ctx.fillStyle = `rgba(255, 107, 0, ${f.alpha})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawHoop(ctx) {
    const bb = this.hoop;
    ctx.save();

    // 1. Backboard support mast
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(bb.backboardX + bb.backboardW, bb.backboardY + bb.backboardH / 2);
    ctx.lineTo(this.width + 20, bb.backboardY + bb.backboardH / 2 + 60);
    ctx.stroke();

    // 2. Smoked Glass Backboard
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(bb.backboardX, bb.backboardY, bb.backboardW, bb.backboardH, 4);
    ctx.fill();
    ctx.stroke();

    // Glowing Inner Target Box
    ctx.strokeStyle = '#ff5500';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(bb.backboardX, bb.rimY - 45, 6, 50);

    // 3. Dynamic Cloth Net (Rendered behind front rim)
    this.drawNet(ctx);

    // 4. Steel Rim
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    // Horizontal rim bar
    ctx.beginPath();
    ctx.moveTo(bb.rimLeftX, bb.rimY);
    ctx.lineTo(bb.rimRightX, bb.rimY);
    ctx.stroke();

    // Left & Right Rim Pin Knobs
    ctx.fillStyle = '#ff7700';
    ctx.beginPath();
    ctx.arc(bb.rimLeftX, bb.rimY, bb.rimRadius, 0, Math.PI * 2);
    ctx.arc(bb.rimRightX, bb.rimY, bb.rimRadius, 0, Math.PI * 2);
    ctx.fill();

    // Bracket
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(bb.rimRightX, bb.rimY);
    ctx.lineTo(bb.backboardX, bb.rimY + 4);
    ctx.stroke();

    ctx.restore();
  }

  drawNet(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;

    // Vertical strands
    for (let i = 0; i < this.netNodes.length; i++) {
      const node = this.netNodes[i];
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(node.curBottomX, node.curBottomY);
      ctx.stroke();
    }

    // Cross-hatched mesh lines
    const rows = 4;
    for (let r = 1; r <= rows; r++) {
      const t = r / (rows + 1);
      ctx.beginPath();
      for (let i = 0; i < this.netNodes.length; i++) {
        const node = this.netNodes[i];
        const nx = node.x + (node.curBottomX - node.x) * t;
        const ny = node.y + (node.curBottomY - node.y) * t;
        if (i === 0) ctx.moveTo(nx, ny);
        else ctx.lineTo(nx, ny);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  drawBall(ctx) {
    if (!this.ball.visible) return;

    ctx.save();
    const bx = this.ball.x;
    const by = this.ball.y;
    const r = this.ball.radius;

    // Floor Shadow
    const floorY = this.height - 50;
    const shadowDist = Math.max(floorY - by, 0);
    const shadowScale = Math.max(1 - shadowDist / 450, 0.25);
    const shadowAlpha = Math.max(0.45 * (1 - shadowDist / 500), 0.08);

    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(bx, floorY, r * shadowScale * 1.2, r * shadowScale * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotate ball texture
    ctx.translate(bx, by);
    ctx.rotate(this.ball.rotation);

    // 1. Leather sphere gradient
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#ff8033');
    grad.addColorStop(0.65, '#ea580c');
    grad.addColorStop(1, '#9a3412');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // 2. Black Rubber Ribbed Seams
    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 2.8;

    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-r * 0.65, 0, r * 0.8, -Math.PI * 0.38, Math.PI * 0.38);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(r * 0.65, 0, r * 0.8, Math.PI * 0.62, Math.PI * 1.38);
    ctx.stroke();

    // 3. Document Badge on Ball
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#ffb700';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-22, -12, 44, 24, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.docBadge, 0, 0);
    ctx.restore();

    // 4. Highlight shine
    const shine = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 1, -r * 0.35, -r * 0.35, r * 0.5);
    shine.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  destroy() {
    cancelAnimationFrame(this.animId);
  }
}
