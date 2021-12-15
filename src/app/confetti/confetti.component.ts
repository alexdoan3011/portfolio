import {Component, ElementRef, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {Particle} from '../models/particle'

@Component({
  selector: 'app-confetti',
  templateUrl: './confetti.component.html',
  styleUrls: ['./confetti.component.scss']
})
export class ConfettiComponent implements OnInit, AfterViewInit {

  @ViewChild('particleContainer') particleContainer?: ElementRef;
  private maxPoints = 6;
  private particleRadius = 10;
  private resistance = 5;
  private gravity = 0.005;
  private amount = 20;
  private currentAmount = this.amount;
  private dropAmount = 100;
  private currentDropAmount = this.dropAmount;
  private particles: Particle[] = [];
  private popForce = [20, 20];
  private popForceMobile = [7, 15];
  private viewWidth = window.innerWidth;
  private viewHeight = window.innerHeight;
  private sweep = false;
  setAttrs = (toSetAttrs: Element, attr_obj: { [key: string]: any }) => {
    for (const prop in attr_obj) {
      toSetAttrs.setAttribute(prop, attr_obj[prop]);
    }
  };

  constructor() {
  }

  cleanUp() {
    this.sweep = true;
  }

  ngOnInit() {
    if (this.viewHeight > this.viewWidth) {
      this.popForce = this.popForceMobile;
    }
    window.onresize = () => {
      this.viewWidth = window.innerWidth;
      this.viewHeight = window.innerHeight;
      if (this.viewHeight > this.viewWidth) {
        this.popForce = this.popForceMobile;
      }
    }
    // this.getFPS();
  }

  async getFPS() {
    const fpsElement = document.getElementById("fps");
    let then = Date.now() / 1000;  // get time in seconds
    const render = () => {
      const now = Date.now() / 1000;  // get time in seconds
      // compute time since last frame
      const elapsedTime = now - then;
      then = now;
      // compute fps
      const fps = 1 / elapsedTime;
      if (fps < 30) console.log(fps);
      // @ts-ignore
      fpsElement.innerText = 'FPS: ' + fps.toFixed(2);
      window.requestAnimationFrame(render);
    };
    render();
  }

  ngAfterViewInit(): void {
    this.createParticles();
  }

  createParticles() {
    for (let i = 0; i < (this.amount); i++) {
      const left = (this.currentAmount % 2 === 0);
      const p = Math.floor(Math.random() * (this.maxPoints - 2) + 3);
      const q = (p % 2 == 1 && p > 3) ? 2 : 1;
      const length = this.particles.push({
        id: 'particle-' + (this.currentAmount),
        posX: left ? 0 : this.viewWidth,
        posY: this.viewHeight,
        p: p,
        q: q,
        radius: this.random30Percent(this.particleRadius) * (q == 2 ? 1.5 : 1),
        rotation: 0,
        torque: Math.random() < 0.5 ? 1 : -1 * Math.random(),
        vX: (this.currentAmount > 0) ? ((left ? 1 : -1) * this.random30Percent(this.popForce[0])) : 0,
        vY: (this.currentAmount > 0) ? -this.random30Percent(this.popForce[1]) : 0,
        resistance: this.resistance * (Math.random() * 10),
        animationID: 0,
        opacity: 0,
        deleted: false
      })
      this.renderParticle(this.particles[length - 1]);
      this.updateParticleRender(this.particles[length - 1]);
    }
  }

  random30Percent(randomizeThis: number) {
    return randomizeThis * (100 + (Math.random() < 0.5 ? -1 : 1) * Math.random() * 30) / 100
  }

  getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  async animateParticle(particle: Particle) {
    if (particle.deleted) return;
    particle.animationID = window.requestAnimationFrame(() => {
      if (particle.posY > this.viewHeight || particle.posX < 0 || particle.posX > this.viewWidth) {
        if (this.currentDropAmount > 0 && !this.sweep) {
          particle.posY = -100;
          particle.posX = (Math.random() + Math.random()) / 2 * this.viewWidth;
          particle.vY = 0;
          particle.vX = 0;
          particle.torque = Math.random() < 0.5 ? 1 : -1 * Math.random();
          particle.resistance = this.resistance * (Math.random() * 10);
          this.currentDropAmount--;
        } else {
          this.deleteParticle(particle);
          return;
        }
      }
      particle.vY += this.gravity;
      particle.vY /= (particle.resistance + 1000) / 1000;
      particle.vX /= (particle.resistance + 1000) / 1000;
      particle.vX +=  this.sweep ? 0.1 : 0;
      particle.posX += particle.vX;
      particle.posY += particle.vY;
      particle.rotation += particle.torque;
      this.updateParticleRender(particle);
      this.animateParticle(particle);
    });
  }

  async deleteParticle(particle: Particle) {
    cancelAnimationFrame(particle.animationID);
    particle.div?.remove();
    particle.deleted = true;
  }

  generatePoly(particle: Particle) {
    this.currentAmount--;
    let color = this.getRandomColor();
    const NS_URI = 'http://www.w3.org/2000/svg',
      svg = document.createElementNS(NS_URI, 'svg'),
      path = document.createElementNS(NS_URI, 'path'),
      div = document.createElement('div'),
      base_angle = 2 * Math.PI / particle.p;
    let angle = (Math.random() - particle.q) * base_angle,
      x, y, d_attr = '';
    for (let i = 0; i < particle.p; i++) {
      const curr_g = document.createElementNS(NS_URI, 'g');
      angle += particle.q * base_angle;
      x = ~~(particle.radius * Math.cos(angle));
      y = ~~(particle.radius * Math.sin(angle));
      d_attr +=
        ((i === 0) ? 'M' : 'L') + x + ' ' + y + ' ';
      if (i * particle.q % particle.p === 0 && i > 0) {
        angle += base_angle;
        x = ~~(particle.radius * Math.cos(angle));
        y = ~~(particle.radius * Math.sin(angle));
        d_attr += 'M' + x + ' ' + y + ' ';
      }
      let curr_point = document.createElementNS(NS_URI, 'circle');
      this.setAttrs(curr_point, {
        'class': 'p p--' + i,
        'cx': x, 'cy': y,
        'r': 32
      });
      curr_g.appendChild(curr_point);
    }
    d_attr += 'z'
    this.setAttrs(path, {
      'd': d_attr,
      'fill-rule': 'nonzero',
      'fill': color,
    });
    let r2 = particle.radius * 2;
    let viewBox = -particle.radius + ' -' + particle.radius + ' ' + r2 + ' ' + r2;
    svg.setAttribute('viewBox', viewBox)
    svg.appendChild(path);
    div.style.position = 'absolute';
    div.appendChild(svg)
    return div;
  };

  renderParticle(particle: Particle) {
    if (particle.div) return;
    particle.div = this.generatePoly(particle);
    particle.div.id = particle.id;
    particle.div.style.width = particle.radius * 2 + 'px';
    particle.div.style.transformOrigin = '50% 50%';
    this.particleContainer?.nativeElement.appendChild(particle.div);
  }

  async updateParticleRender(particle: Particle) {
    if (!particle.div) return;
    particle.div.style.transform = 'translate(' + particle.posX + 'px, ' + particle.posY + 'px) rotate(' + particle.rotation + 'deg)  scale(' + this.viewWidth * (this.viewHeight > this.viewWidth ? 2 : 1) / 1500 + ')';
    particle.div.style.opacity = String(particle.opacity);
  }

  popConfetti() {
    for (let i = 0; i < this.particles.length; i++) {
      if (this.particles[i].posY > 0) {
        this.particles[i].opacity = Math.random() * 0.5 + 0.5
        this.animateParticle(this.particles[i]);
      }
    }
  }
}