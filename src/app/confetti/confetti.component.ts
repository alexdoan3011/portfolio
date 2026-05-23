import {Component, ElementRef, OnInit, AfterViewInit, ViewChild, Output, EventEmitter, NgZone} from '@angular/core';
import {Particle, ShapeKind} from '../models/particle'
import Utils from "../utils";
import fastdom from "fastdom";

@Component({
  standalone: false,
  selector: 'app-confetti',
  templateUrl: './confetti.component.html',
  styleUrls: ['./confetti.component.scss']
})
export class ConfettiComponent implements OnInit, AfterViewInit {

  @ViewChild('particleContainer') particleContainer?: ElementRef;
  private maxPoints = 6;
  private particleRadius = 8;
  private resistance = 50;
  // Configured *minimum* gravity. Applied as-is on landscape/square screens;
  // taller (portrait) screens scale up proportionally to viewHeight/viewWidth
  // so particles fall faster and don't pile up in the longer fall path —
  // otherwise tall phones end up with far more particles on-screen at once
  // than the device can comfortably render.
  private minGravity = 0.015;
  private get gravity(): number {
    return this.minGravity * Math.max(1, Utils.viewHeight / Utils.viewWidth);
  }
  private initialShotAmount = 500;
  private benchmarkWarmup = 5;
  // Minimum post-warmup frames before the benchmark may finalize. Prevents a
  // very early popConfetti() call from finalizing with too few samples.
  private minBenchmarkFrames = 30;
  // Safety cap: if popConfetti() never fires, finalize anyway so we don't loop forever.
  private maxBenchmarkFrames = 1200;
  // True between ngAfterViewInit and benchmark finalization. While true, calls
  // to popConfetti() are deferred until the benchmark stops on its next frame.
  private benchmarkPending = true;
  private benchmarkPopRequested = false;
  private amount = 0;
  private currentAmount = 0;
  private particles: Particle[] = [];
  private get popForce(): number {
    return Math.sqrt((Utils.viewWidth / 2) ** 2 + Utils.viewHeight ** 2) / 20;
  }
  private sweep = false;
  private loopId = 0;
  // Recycled <div> elements from culled particles, reused by new spawns to avoid
  // DOM node churn (createElement + remove() is the dominant cost at steady state).
  private domPool: HTMLDivElement[] = [];
  // Leeway so particles disappear well outside the viewport, never visibly.
  private cullLeeway = 120;
  // Maximum per-particle launch delay (frames). The initial pop is staggered
  // uniformly across this window so the physics+DOM cost ramps up smoothly
  // instead of spiking on a single frame.
  private launchStaggerFrames = 30;
  // ±jitter fraction applied to each particle's resistance for visual variety.
  private resistanceJitter = 0.6;
  // Stream spawn rate, in particles per second. Frame-rate independent. The
  // configured value is the *maximum* used on devices that hit full capacity;
  // weaker devices get scaled down proportionally after the benchmark runs.
  private maxSpawnsPerSecond = 10;
  private spawnsPerSecond = 10;
  // Delay (seconds) after popConfetti() before the continuous stream starts,
  // giving the launch arc time to clear.
  private spawnDelaySeconds = 1;
  // rAF timestamp captured on the first frame after popConfetti(); 0 until set.
  private popTime = 0;
  // Fractional spawn budget carried across frames so non-integer rates and
  // variable frame intervals still produce the right long-term average.
  private spawnAccumulator = 0;
  private lastFrameTime = 0;
  // Number of particles currently in their glow phase. Glow uses a drop-shadow
  // filter that forces a main-thread re-raster, so letting an unbounded number
  // glow at once produces frametime spikes. Capped by maxConcurrentGlows.
  private activeGlowCount = 0;
  // Ceiling on simultaneous glows. Set from the benchmark result so weak
  // devices allow fewer. A particle that wants to glow past the cap simply
  // stays un-glowed until a slot frees up.
  private maxConcurrentGlows = 12;
  private toCull: Particle[] = [];
  private toReveal: Particle[] = [];
  private newSpawns: Particle[] = [];
  @Output() cleanedUp: EventEmitter<any> = new EventEmitter();
  setAttrs = (toSetAttrs: Element, attr_obj: { [key: string]: any }) => {
    for (const prop in attr_obj) {
      toSetAttrs.setAttribute(prop, attr_obj[prop]);
    }
  };

  constructor(private zone: NgZone) {
  }

  cleanUp() {
    this.sweep = true;
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    // Delay so the mobile CPU's post-load boost decays before we measure.
    // Benchmarking during boost overestimates capacity; thermal/DVFS throttling
    // then kicks in once the animation runs and we drop frames.
    this.zone.runOutsideAngular(() =>
      setTimeout(() => this.runBenchmark(), 600)
    );
  }

  private runBenchmark(): void {
    this.amount = this.initialShotAmount;
    this.currentAmount = this.initialShotAmount;
    this.createParticles();

    // Spread particles across screen so the benchmark reflects a realistic mid-flight workload
    for (const p of this.particles) {
      p.posX = Math.random() * Utils.viewWidth;
      p.posY = Math.random() * Utils.viewHeight;
      p.vX = (Math.random() - 0.5) * 2;
      p.vY = (Math.random() - 0.5) * 2;
    }

    let frame = 0;
    let lastTime = performance.now();
    const frameTimes: number[] = [];
    // Measure the device's actual frame interval during warmup. 120Hz/90Hz
    // phones have an 8.3/11.1ms budget, not 16.67ms — hardcoding 60Hz makes
    // us provision 2x too many particles on high-refresh displays.
    const warmupIntervals: number[] = [];

    const benchLoop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      if (frame < this.benchmarkWarmup) {
        if (frame > 0) warmupIntervals.push(dt);
      } else {
        frameTimes.push(dt);
      }
      frame++;

      for (const p of this.particles) {
        p.vY += this.gravity;
        p.vY /= (p.resistance + 1000) / 1000;
        p.vX /= (p.resistance + 1000) / 1000;
        p.posX += p.vX;
        p.posY += p.vY;
        p.rotation += p.torque;
        p.tumbleAngle += p.tumbleRate;
      }
      fastdom.mutate(() => {
        for (const p of this.particles) {
          if (!p.div) continue;
          p.div.style.transform = `translate(${p.posX}px,${p.posY}px) perspective(500px) rotate3d(${p.tiltCos},${p.tiltSin},0,${p.tumbleAngle}deg) rotate(${p.rotation}deg)`;
        }
      });

      const haveMinSamples = frameTimes.length >= this.minBenchmarkFrames;
      const reachedCap = frameTimes.length >= this.maxBenchmarkFrames;
      const shouldFinalize = reachedCap || (this.benchmarkPopRequested && haveMinSamples);
      if (!shouldFinalize) {
        requestAnimationFrame(benchLoop);
      } else {
        const avg = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
        // Median of warmup intervals ≈ the device's vsync interval. Fall back
        // to 60Hz if we somehow didn't collect any samples.
        const sorted = warmupIntervals.slice().sort((a, b) => a - b);
        const measuredFrameBudget = sorted.length
          ? sorted[sorted.length >> 1]
          : 1000 / 60;
        const capacity = Math.floor(this.initialShotAmount * measuredFrameBudget / avg);
        const optimal = Math.max(10, Math.floor(Math.min(this.initialShotAmount, capacity) * 0.5));
        // Scale stream rate by the same capacity ratio used to pick `optimal`.
        // capacityRatio == 1 means the device hit (or exceeded) full capacity,
        // so we use the configured max; weaker devices get a proportionally
        // slower stream so they don't drown in particles they can't render.
        const fullCapacityOptimal = Math.floor(this.initialShotAmount * 0.5);
        const capacityRatio = Math.min(1, optimal / fullCapacityOptimal);
        this.spawnsPerSecond = this.maxSpawnsPerSecond * capacityRatio;
        // Scale the glow ceiling with device capacity too: glow drop-shadows are
        // the most expensive per-frame work, so weaker devices get fewer slots.
        this.maxConcurrentGlows = Math.max(3, Math.round(12 * capacityRatio));
        console.log(`Confetti benchmark: ${avg.toFixed(1)}ms/frame @ ${measuredFrameBudget.toFixed(1)}ms budget → capacity ${capacity} → using ${optimal} particles, ${this.spawnsPerSecond.toFixed(2)}/s stream`);

        // Trim excess particles (remove from DOM and array)
        const excess = this.particles.splice(optimal);
        for (const p of excess) p.div?.remove();
        this.amount = optimal;

        // Reset survivors to launch positions (corners, ready for popConfetti)
        for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i];
          const left = (i % 2 === 0);
          p.posX = left ? 0 : Utils.viewWidth;
          p.posY = Utils.viewHeight;
          const baseAngle0 = Math.atan2(-1 * Utils.viewHeight, Utils.viewWidth / 2 - p.posX);
          const finalAngle0 = baseAngle0 + (Math.random() - 0.5) * Math.PI / 6;
          const speed0 = this.random30Percent(this.popForce);
          p.vX = speed0 * Math.cos(finalAngle0);
          p.vY = speed0 * Math.sin(finalAngle0);
          p.rotation = 0;
          p.opacity = 0;
          p.deleted = false;
          // Spread launches uniformly across the stagger window so cost ramps up.
          p.launchDelay = Math.floor(Math.random() * this.launchStaggerFrames);
        }
        fastdom.mutate(() => {
          for (const p of this.particles) {
            if (p.div) p.div.style.transform = `translate(${p.posX}px,${p.posY}px)`;
          }
        });

        this.benchmarkPending = false;
        if (this.benchmarkPopRequested) {
          this.benchmarkPopRequested = false;
          this.popConfetti();
        }
      }
    };

    requestAnimationFrame(benchLoop);
  }

  private get scaledParticleRadius(): number {
    // Sub-linear viewport scaling: radius grows/shrinks more slowly than the
    // viewport, so small screens get a larger *relative* particle (matching
    // the intent of the old `isMobile ? 2 : 1` multiplier) and huge screens
    // don't get cartoonishly large ones. Exponent 0.5 reproduces the old
    // mobile size at 375px; raise toward 1.0 for more linear behaviour, lower
    // toward 0 for more uniform-across-sizes.
    const scale = Math.pow(Utils.viewWidth / 1500, 0.5);
    return this.particleRadius * scale;
  }

  createParticles() {
    const scaledRadius = this.scaledParticleRadius;
    const baseSpeed = this.popForce;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < this.amount; i++) {
      const left = (this.currentAmount % 2 === 0);
      const launchX = left ? 0 : Utils.viewWidth;
      const launchAngle = Math.atan2(-2 * Utils.viewHeight, Utils.viewWidth / 2 - launchX) + (Math.random() - 0.5) * Math.PI / 6;
      // Wide speed variation so apex heights differ → particles spread vertically as they fall back.
      const speed = this.currentAmount > 0 ? baseSpeed * (0.3 + Math.random() * 1.4) : 0;
      const shape = this.pickShape();
      const length = this.particles.push({
        posX: launchX,
        posY: Utils.viewHeight,
        p: shape.p,
        q: shape.q,
        shapeKind: shape.kind,
        innerRatio: shape.innerRatio,
        aspect: shape.aspect,
        radius: this.random30Percent(this.radiusForArea(scaledRadius, shape.areaFactor)),
        rotation: 0,
        torque: Math.random() < 0.5 ? 1 : -1 * Math.random(),
        vX: speed * Math.cos(launchAngle),
        vY: speed * Math.sin(launchAngle),
        resistance: this.jitteredResistance(),
        opacity: 0,
        deleted: false,
        recolor: false,
        tiltCos: Math.cos(Math.random() * Math.PI * 2),
        tiltSin: Math.sin(Math.random() * Math.PI * 2),
        tumbleAngle: Math.random() * 360,
        tumbleRate: (Math.random() * 2 + 0.8) * (Math.random() < 0.5 ? 1 : -1),
        glowTimer: Math.floor(Math.random() * 240 + 60),
        glowing: false,
        glowToggle: false,
        glowDuration: Math.floor(Math.random() * 150 + 80)
      });
      fragment.appendChild(this.ensureParticleElement(this.particles[length - 1]));
    }
    fastdom.mutate(() => {
      this.particleContainer?.nativeElement.appendChild(fragment);
    });
  }

  private ensureParticleElement(particle: Particle): HTMLDivElement {
    if (particle.div) return particle.div;
    particle.div = this.generatePoly(particle);
    particle.div.style.width = particle.radius * 2 + 'px';
    particle.div.style.transformOrigin = '50% 50%';
    particle.div.style.opacity = '0';
    return particle.div;
  }

  renderParticle(particle: Particle) {
    const div = this.ensureParticleElement(particle);
    fastdom.mutate(() => {
      this.particleContainer?.nativeElement.appendChild(div);
    });
  }

  random30Percent(randomizeThis: number) {
    return randomizeThis * (100 + (Math.random() < 0.5 ? -1 : 1) * Math.random() * 30) / 100;
  }

  private jitteredResistance(): number {
    const jitter = 1 + (Math.random() * 2 - 1) * this.resistanceJitter;
    return Math.max(1, this.resistance * jitter);
  }

  // HSL lightness range for particle fills. Constrained to the bright band
  // (well above 50% so colors read as vivid, below ~80% so they don't wash
  // out to near-white). Saturation is always 100%.
  private static readonly LIGHTNESS_MIN = 55;
  private static readonly LIGHTNESS_RANGE = 22; // 55%–77%
  private randomBrightLightness(): number {
    return ConfettiComponent.LIGHTNESS_MIN + Math.random() * ConfettiComponent.LIGHTNESS_RANGE;
  }

  // Scale circumradius so every shape has roughly the same filled area.
  // Without this, a hexagon (~2.60·r²) looks much bigger than a pentagram
  // {5/2} (~1.47·r² by shoelace) inscribed in the same circle. Reference is
  // the regular hexagon, so hexagons keep their current size and other shapes
  // grow to match. Formula: shoelace area of {p/q} = 0.5·p·sin(q·2π/p)·r².
  private static readonly AREA_REF = 3 * Math.sin(Math.PI / 3); // hexagon: 0.5·6·sin(60°)
  private radiusForArea(baseRadius: number, areaFactor: number): number {
    if (areaFactor <= 0) return baseRadius;
    return baseRadius * Math.sqrt(ConfettiComponent.AREA_REF / areaFactor);
  }

  // Picks a random shape and returns the parameters needed to instantiate it,
  // plus the area factor (visible area / r²) so the caller can normalize size.
  private pickShape(): {
    kind: ShapeKind;
    p: number;
    q: number;
    innerRatio?: number;
    aspect?: number;
    areaFactor: number;
  } {
    const roll = Math.random();
    if (roll < 0.30) {
      // Regular polygon (3–6 sides) or pentagram {5/2}.
      const p = Math.floor(Math.random() * (this.maxPoints - 2) + 3);
      const q = (p % 2 == 1 && p > 3) ? 2 : 1;
      const areaFactor = 0.5 * p * Math.sin(q * 2 * Math.PI / p);
      return { kind: 'polygon', p, q, areaFactor };
    }
    if (roll < 0.55) {
      // Classic N-pointed star: 2N vertices alternating outer/inner radius.
      // Shoelace area: N · innerRatio · sin(π/N) · r².
      const p = 4 + Math.floor(Math.random() * 4); // 4..7 points
      const innerRatio = 0.36 + Math.random() * 0.16; // 0.36–0.52
      const areaFactor = p * innerRatio * Math.sin(Math.PI / p);
      return { kind: 'star', p, q: 1, innerRatio, areaFactor };
    }
    if (roll < 0.78) {
      // Ribbon/streamer: thin wavy strip. Treat area as ~rectangular bounding
      // box (4 · aspect · r²) since the wave perturbation is small.
      const aspect = 0.12 + Math.random() * 0.13; // 0.12–0.25 half-height ratio
      return { kind: 'streamer', p: 4, q: 1, aspect, areaFactor: 4 * aspect };
    }
    if (roll < 0.92) {
      // Heart: ~2.4·r² for the path below, measured empirically.
      return { kind: 'heart', p: 0, q: 1, areaFactor: 2.4 };
    }
    // Round dot.
    return { kind: 'circle', p: 0, q: 1, areaFactor: Math.PI };
  }

  private gameLoop() {
    this.loopId = window.requestAnimationFrame((time) => {
      const dt = this.lastFrameTime ? time - this.lastFrameTime : 0;
      this.lastFrameTime = time;
      const leeway = this.cullLeeway;
      const leftEdge = -leeway;
      const rightEdge = Utils.viewWidth + leeway;
      // Top edge sits just above the spawn band so the initial pop burst is culled
      // as soon as it leaves the viewport top — otherwise it would keep filling the
      // alive-count and prevent spawning, leaving the viewport empty.
      const topEdge = -leeway;
      const bottomEdge = Utils.viewHeight + leeway;
      const toCull = this.toCull;
      const toReveal = this.toReveal;
      const newSpawns = this.newSpawns;
      toCull.length = 0;
      toReveal.length = 0;
      newSpawns.length = 0;

      // Physics + cull detection — no DOM I/O.
      for (const particle of this.particles) {
        if (particle.deleted) continue;
        // Staggered launch: hold particles at their launch position until their
        // delay elapses. Spreads the cost of the initial pop across frames.
        if (particle.launchDelay && particle.launchDelay > 0) {
          particle.launchDelay--;
          if (particle.launchDelay === 0) toReveal.push(particle);
          continue;
        }

        particle.vY += this.gravity;
        particle.vY /= (particle.resistance + 1000) / 1000;
        particle.vX /= (particle.resistance + 1000) / 1000;
        particle.vX += this.sweep ? 0.05 : 0;
        particle.opacity -= this.sweep ? 0.001 : 0;
        particle.posX += particle.vX;
        particle.posY += particle.vY;
        particle.rotation += particle.torque;
        if (particle.rotation >= 360 || particle.rotation <= -360) {
          particle.rotation = 0;
        }
        particle.tumbleAngle += particle.tumbleRate;
        particle.glowTimer--;
        if (particle.glowTimer <= 0) {
          if (particle.glowing) {
            particle.glowing = false;
            this.activeGlowCount--;
            particle.glowToggle = true;
            particle.glowTimer = Math.floor(Math.random() * 240 + 120);
          } else if (this.activeGlowCount < this.maxConcurrentGlows &&
                     Math.abs(Math.cos(particle.tumbleAngle * Math.PI / 180)) > 0.8) {
            particle.glowing = true;
            this.activeGlowCount++;
            particle.glowToggle = true;
            particle.glowTimer = Math.floor(Math.random() * 60 + 30);
          } else {
            particle.glowTimer = Math.floor(Math.random() * 60 + 30);
          }
        }

        const outOfBounds =
          particle.posY > bottomEdge ||
          particle.posY < topEdge ||
          particle.posX < leftEdge ||
          particle.posX > rightEdge;
        if (outOfBounds || (this.sweep && particle.opacity <= 0)) {
          toCull.push(particle);
        }
      }

      // Time-based spawning: accumulate fractional budget so the long-term
      // rate matches spawnsPerSecond regardless of frame rate.
      if (this.popTime === 0) this.popTime = time;
      if (!this.sweep && (time - this.popTime) >= this.spawnDelaySeconds * 1000) {
        this.spawnAccumulator += this.spawnsPerSecond * dt / 1000;
        while (this.spawnAccumulator >= 1) {
          newSpawns.push(this.spawnFalling());
          this.spawnAccumulator--;
        }
      }

      for (const particle of toCull) {
        // Recycle the div instead of removing it from the DOM. New spawns will
        // pick it up; if the pool overflows (sweep / shrinking), surplus is
        // removed below.
        if (particle.div) {
          particle.div.style.opacity = '0';
          // Clear any lingering glow animation before the div is recycled, so a
          // reused particle doesn't inherit a mid-flight glow.
          if (particle.glowing) particle.div.style.animation = '';
          this.domPool.push(particle.div);
        }
        // Release the glow slot held by a particle that's culled mid-glow.
        if (particle.glowing) {
          particle.glowing = false;
          this.activeGlowCount--;
        }
        particle.deleted = true;
      }
      if (toCull.length) {
        // In-place compaction: avoids allocating a new array every frame.
        let write = 0;
        for (let read = 0; read < this.particles.length; read++) {
          const p = this.particles[read];
          if (!p.deleted) {
            if (write !== read) this.particles[write] = p;
            write++;
          }
        }
        this.particles.length = write;
      }
      for (const particle of toReveal) {
        if (particle.div) particle.div.style.opacity = String(particle.opacity);
      }
      for (const particle of newSpawns) {
        const recycled = this.domPool.pop();
        if (recycled) {
          // Reuse: shape/color stay (random across pool anyway → no quality loss).
          // svgEl/hue/lightness on the new Particle were left undefined; rebind
          // them from the recycled div so glow/recolor still work.
          particle.div = recycled;
          const svgEl = recycled.firstChild as SVGSVGElement | null;
          if (svgEl) {
            particle.svgEl = svgEl;
            const fill = svgEl.getAttribute('fill') ?? '';
            const m = fill.match(/hsl\(([\d.]+),\s*100%,\s*([\d.]+)%\)/);
            if (m) {
              particle.hue = parseFloat(m[1]);
              particle.lightness = parseFloat(m[2]);
            }
          }
          recycled.style.width = particle.radius * 2 + 'px';
          recycled.style.opacity = String(particle.opacity);
        } else {
          particle.div = this.generatePoly(particle);
          particle.div.style.width = particle.radius * 2 + 'px';
          particle.div.style.transformOrigin = '50% 50%';
          particle.div.style.opacity = String(particle.opacity);
          this.particleContainer?.nativeElement.appendChild(particle.div);
        }
        this.particles.push(particle);
      }
      // During sweep we want particles to actually disappear, so drain the pool.
      if (this.sweep && this.domPool.length) {
        for (const div of this.domPool) div.remove();
        this.domPool.length = 0;
      }
      for (const particle of this.particles) {
        if (!particle.div) continue;
        if (particle.launchDelay && particle.launchDelay > 0) continue;
        if (particle.recolor) {
          const newHue = Math.random() * 360;
          const newLightness = this.randomBrightLightness();
          particle.hue = newHue;
          particle.lightness = newLightness;
          particle.svgEl?.setAttribute('fill', `hsl(${newHue}, 100%, ${newLightness}%)`);
          particle.recolor = false;
        }
        if (particle.glowToggle) {
          if (particle.glowing) {
            const h = particle.hue ?? 0;
            const l = particle.lightness ?? 50;
            const glowColor = `hsl(${h}, 100%, ${Math.min(l * 2.2, 92)}%)`;
            particle.div.style.setProperty('--glow-color', glowColor);
            particle.div.style.animation = `particle-glow ${particle.glowDuration}ms ease-in-out`;
          } else {
            particle.div.style.animation = '';
          }
          particle.glowToggle = false;
        }
        particle.div.style.transform = `translate(${particle.posX}px,${particle.posY}px) perspective(500px) rotate3d(${particle.tiltCos},${particle.tiltSin},0,${particle.tumbleAngle}deg) rotate(${particle.rotation}deg)`;
        if (this.sweep) particle.div.style.opacity = String(particle.opacity);
      }

      if (this.sweep && this.particles.length === 0) {
        cancelAnimationFrame(this.loopId);
        this.zone.run(() => this.cleanedUp.emit());
        return;
      }
      this.gameLoop();
    });
  }

  private spawnFalling(): Particle {
    const scaledRadius = this.scaledParticleRadius;
    const shape = this.pickShape();
    const resistance = this.jitteredResistance();
    // Spawn just above the viewport so particles fall into view rather than
    // appearing mid-screen. Initial vY is well above terminal velocity so they
    // cross the top edge within a few frames; friction quickly decelerates them.
    return {
      posX: Math.random() * Utils.viewWidth,
      posY: -40 + Math.random() * 30,
      p: shape.p,
      q: shape.q,
      shapeKind: shape.kind,
      innerRatio: shape.innerRatio,
      aspect: shape.aspect,
      radius: this.random30Percent(this.radiusForArea(scaledRadius, shape.areaFactor)),
      rotation: 0,
      torque: Math.random() < 0.5 ? 1 : -1 * Math.random(),
      vX: 0,
      vY: Math.min(this.gravity * 1000 / Math.max(resistance, 0.5), 10),
      resistance,
      opacity: Math.random() * 0.5 + 0.5,
      deleted: false,
      recolor: false,
      tiltCos: Math.cos(Math.random() * Math.PI * 2),
      tiltSin: Math.sin(Math.random() * Math.PI * 2),
      tumbleAngle: Math.random() * 360,
      tumbleRate: (Math.random() * 2 + 0.8) * (Math.random() < 0.5 ? 1 : -1),
      glowTimer: Math.floor(Math.random() * 180 + 60),
      glowing: false,
      glowToggle: false,
      glowDuration: Math.floor(Math.random() * 150 + 80)
    };
  }

  deleteParticle(particle: Particle) {
    particle.div?.remove();
    particle.deleted = true;
  }

  generatePoly(particle: Particle) {
    this.currentAmount--;
    const NS_URI = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS_URI, 'svg');
    const path = document.createElementNS(NS_URI, 'path');
    const div = document.createElement('div');
    const d_attr = this.shapePath(particle);
    this.setAttrs(path, { 'd': d_attr, 'fill-rule': 'nonzero' });
    const r2 = particle.radius * 2;
    svg.setAttribute('viewBox', `${-particle.radius} ${-particle.radius} ${r2} ${r2}`);
    const hue = Math.random() * 360;
    const lightness = this.randomBrightLightness();
    svg.setAttribute('fill', `hsl(${hue}, 100%, ${lightness}%)`);
    particle.hue = hue;
    particle.lightness = lightness;
    particle.svgEl = svg;
    svg.appendChild(path);
    div.style.position = 'absolute';
    div.appendChild(svg);
    return div;
  }

  private shapePath(particle: Particle): string {
    switch (particle.shapeKind ?? 'polygon') {
      case 'star': return this.starPath(particle);
      case 'heart': return this.heartPath(particle);
      case 'streamer': return this.streamerPath(particle);
      case 'circle': return this.circlePath(particle);
      case 'polygon':
      default: return this.polygonPath(particle);
    }
  }

  private polygonPath(particle: Particle): string {
    const r = particle.radius;
    const base_angle = 2 * Math.PI / particle.p;
    let angle = (Math.random() - particle.q) * base_angle;
    let d_attr = '';
    for (let i = 0; i < particle.p; i++) {
      angle += particle.q * base_angle;
      const x = ~~(r * Math.cos(angle));
      const y = ~~(r * Math.sin(angle));
      d_attr += ((i === 0) ? 'M' : 'L') + x + ' ' + y + ' ';
      if (i * particle.q % particle.p === 0 && i > 0) {
        angle += base_angle;
        const x2 = ~~(r * Math.cos(angle));
        const y2 = ~~(r * Math.sin(angle));
        d_attr += 'M' + x2 + ' ' + y2 + ' ';
      }
    }
    return d_attr + 'z';
  }

  // Classic N-pointed star: 2N vertices alternating between outer radius r
  // and inner radius r·innerRatio. Random rotation so stars don't all point
  // the same way at spawn (tumbleAngle rotates them in-flight too).
  private starPath(particle: Particle): string {
    const r = particle.radius;
    const n = particle.p;
    const innerR = r * (particle.innerRatio ?? 0.45);
    const start = Math.random() * Math.PI * 2;
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const angle = start + i * Math.PI / n;
      const rad = (i % 2 === 0) ? r : innerR;
      const x = ~~(rad * Math.cos(angle));
      const y = ~~(rad * Math.sin(angle));
      d += ((i === 0) ? 'M' : 'L') + x + ' ' + y + ' ';
    }
    return d + 'z';
  }

  // Symmetric heart inscribed in [-r, r]². Two cubic Béziers form the bumps
  // at the top and meet at the point on the bottom.
  private heartPath(particle: Particle): string {
    const r = particle.radius;
    const topY = ~~(-0.3 * r);
    const sideY = ~~(0.3 * r);
    return `M 0 ${topY} C ${-r} ${-r} ${-r} ${sideY} 0 ${r} C ${r} ${sideY} ${r} ${-r} 0 ${topY} z`;
  }

  // Wavy ribbon: thin strip from x=-r to x=r whose top and bottom edges
  // share a single quadratic-Bézier wave, producing a "flutter" look.
  private streamerPath(particle: Particle): string {
    const r = particle.radius;
    const h = Math.max(2, ~~(r * (particle.aspect ?? 0.18)));
    const amp = h * 2;
    // Top edge dips down then back; bottom edge mirrors it so the strip stays
    // roughly constant thickness while curving like a falling ribbon.
    return `M ${-r} ${-h} Q 0 ${-h + amp} ${r} ${-h} ` +
           `L ${r} ${h} Q 0 ${h + amp} ${-r} ${h} z`;
  }

  // Simple disc, drawn as two SVG arcs so we can stay on a <path>.
  private circlePath(particle: Particle): string {
    const r = particle.radius;
    return `M ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0 z`;
  }

  popConfetti() {
    if (this.benchmarkPending) {
      // Benchmark will finalize on its next frame and re-invoke this method.
      this.benchmarkPopRequested = true;
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.lastFrameTime = 0;
      this.spawnAccumulator = 0;
      this.popTime = 0;
      fastdom.mutate(() => {
        for (const particle of this.particles) {
          const target = Math.random() * 0.5 + 0.5;
          // Particles with a launch delay stay invisible until they start moving;
          // setting their opacity here would reveal them at the launch corner.
          if (particle.launchDelay && particle.launchDelay > 0) {
            particle.opacity = target;
            if (particle.div) particle.div.style.opacity = '0';
            continue;
          }
          particle.opacity = target;
          if (particle.div) particle.div.style.opacity = String(particle.opacity);
        }
      });
      this.gameLoop();
    });
  }
}
