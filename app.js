const projects = {
  ouroboros: { title: 'Frankenstein Ouroboros', category: 'Illustration', prefix: 'ouroboros' },
  behar: { title: 'Behar', category: 'Graphic design · Book cover', prefix: 'behar' },
  studio: { title: 'The sunlit studio', category: 'Background art', prefix: 'studio' },
  room: { title: 'A room of stories', category: 'Background art', prefix: 'room' }
};
const viewer = document.querySelector('#viewer');
const stage = document.querySelector('#art-stage');
const toggle = document.querySelector('#toggle-sketch');
const sketch = document.querySelector('#sketch-image');
const water = document.createElement('canvas');
water.className = 'water-reveal';
water.setAttribute('aria-hidden', 'true');
stage.append(water);
const waterContext = water.getContext('2d');
const mask = document.createElement('canvas');
const maskContext = mask.getContext('2d');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let waterFrame = 0;
let lastFrame = 0;
let lastDrop = 0;
let drops = [];
let fluid = null;
let waterWidth = 0;
let waterHeight = 0;
let pixelRatio = 1;
let position = { x: 50, y: 50 };
let opener;

function resizeWater() {
  const rect = stage.getBoundingClientRect();
  waterWidth = rect.width;
  waterHeight = rect.height;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  for (const canvas of [water, mask]) {
    canvas.width = Math.round(waterWidth * pixelRatio);
    canvas.height = Math.round(waterHeight * pixelRatio);
  }
}
new ResizeObserver(resizeWater).observe(stage);

// Smooth, irregular contours overlap into a soft wake behind the pointer.
function waterContour(context, x, y, radius, phase, stretch = 0, angle = 0) {
  const points = [];
  for (let i = 0; i < 48; i++) {
    const theta = i / 48 * Math.PI * 2;
    const wave = 1 + Math.sin(theta * 3 + phase) * .065 + Math.sin(theta * 5 - phase * 1.3) * .035;
    const px = Math.cos(theta) * radius * wave * (1 + stretch);
    const py = Math.sin(theta) * radius * wave * (1 - stretch * .32);
    points.push([x + px * Math.cos(angle) - py * Math.sin(angle), y + px * Math.sin(angle) + py * Math.cos(angle)]);
  }
  context.beginPath();
  const last = points[points.length - 1];
  context.moveTo((last[0] + points[0][0]) / 2, (last[1] + points[0][1]) / 2);
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    context.quadraticCurveTo(point[0], point[1], (point[0] + next[0]) / 2, (point[1] + next[1]) / 2);
  });
  context.closePath();
}
function clearWater() {
  cancelAnimationFrame(waterFrame);
  waterFrame = 0;
  drops = [];
  fluid = null;
  lastFrame = 0;
  waterContext.clearRect(0, 0, water.width, water.height);
}
function animateWater(now) {
  waterFrame = 0;
  if (!viewer.open || stage.classList.contains('full-sketch')) { clearWater(); return; }
  const active = stage.classList.contains('revealing');
  const dt = Math.min(40, now - (lastFrame || now - 16));
  lastFrame = now;
  const radius = Number(document.querySelector('#lens-size').value);
  const target = { x: position.x / 100 * waterWidth, y: position.y / 100 * waterHeight };
  if (!fluid) fluid = { ...target, strength: 0 };
  const dx = target.x - fluid.x;
  const dy = target.y - fluid.y;
  const smoothing = reducedMotion.matches ? 1 : 1 - Math.exp(-dt / 48);
  fluid.x += dx * smoothing;
  fluid.y += dy * smoothing;
  fluid.strength += ((active ? 1 : 0) - fluid.strength) * (1 - Math.exp(-dt / (active ? 65 : 170)));
  const phase = reducedMotion.matches ? 0 : now / 430;
  const speed = Math.hypot(dx, dy);
  if (active && speed > 2 && now - lastDrop > 28 && !reducedMotion.matches) {
    drops.push({ x: fluid.x, y: fluid.y, born: now, radius: radius * .8, phase });
    lastDrop = now;
  }
  drops = drops.filter(drop => now - drop.born < 650);
  maskContext.setTransform(1, 0, 0, 1, 0, 0);
  maskContext.clearRect(0, 0, mask.width, mask.height);
  maskContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  maskContext.filter = reducedMotion.matches ? 'none' : 'blur(5px)';
  for (const drop of drops) {
    const life = 1 - (now - drop.born) / 650;
    maskContext.fillStyle = `rgba(255,255,255,${life * life * .7})`;
    waterContour(maskContext, drop.x, drop.y, drop.radius * (.55 + life * .45), drop.phase);
    maskContext.fill();
  }
  maskContext.fillStyle = `rgba(255,255,255,${fluid.strength})`;
  waterContour(maskContext, fluid.x, fluid.y, radius, phase, reducedMotion.matches ? 0 : Math.min(.3, speed / 180), Math.atan2(dy, dx));
  maskContext.fill();
  maskContext.filter = 'none';
  waterContext.setTransform(1, 0, 0, 1, 0, 0);
  waterContext.clearRect(0, 0, water.width, water.height);
  if (sketch.complete && sketch.naturalWidth) {
    waterContext.globalCompositeOperation = 'source-over';
    waterContext.drawImage(sketch, 0, 0, water.width, water.height);
    waterContext.globalCompositeOperation = 'destination-in';
    waterContext.drawImage(mask, 0, 0);
    waterContext.globalCompositeOperation = 'source-over';
  }
  if (active || fluid.strength > .01 || drops.length) waterFrame = requestAnimationFrame(animateWater);
  else clearWater();
}
function startWater() {
  if (!waterFrame && viewer.open && !stage.classList.contains('full-sketch')) waterFrame = requestAnimationFrame(animateWater);
}
new MutationObserver(startWater).observe(stage, { attributes: true, attributeFilter: ['class'] });
function setPosition(x, y) {
  position = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  stage.style.setProperty('--x', `${position.x}%`);
  stage.style.setProperty('--y', `${position.y}%`);
}
function resetFullSketch() {
  stage.classList.remove('full-sketch');
  toggle.setAttribute('aria-pressed', 'false');
  toggle.textContent = 'Show full sketch';
}
document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const project = projects[button.dataset.project];
    opener = button;
    document.querySelector('#viewer-title').textContent = project.title;
    document.querySelector('#viewer-category').textContent = project.category;
    const final = document.querySelector('#final-image');
    final.src = `assets/${project.prefix}-final.webp`;
    final.alt = `${project.title} — finished artwork`;
    document.querySelector('#sketch-image').src = `assets/${project.prefix}-sketch.webp`;
    document.querySelector('#book-preview').hidden = button.dataset.project !== 'behar';
    stage.classList.remove('revealing');
    clearWater();
    resetFullSketch();
    setPosition(50, 50);
    viewer.showModal();
    viewer.scrollTop = 0;
    document.body.classList.add('modal-open');
    document.querySelector('#close-viewer').focus();
  });
});
document.querySelector('#close-viewer').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => {
  const rect = viewer.getBoundingClientRect();
  if (event.target === viewer && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) viewer.close();
});
viewer.addEventListener('close', () => {
  clearWater();
  document.body.classList.remove('modal-open');
  opener?.focus();
});
function revealAt(event) {
  const rect = stage.getBoundingClientRect();
  setPosition((event.clientX - rect.left) / rect.width * 100, (event.clientY - rect.top) / rect.height * 100);
  stage.classList.add('revealing');
}
stage.addEventListener('pointermove', revealAt);
stage.addEventListener('pointerdown', event => {
  revealAt(event);
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener('pointerup', event => {
  if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  if (event.pointerType !== 'mouse') stage.classList.remove('revealing');
});
stage.addEventListener('pointercancel', () => stage.classList.remove('revealing'));
stage.addEventListener('pointerleave', () => stage.classList.remove('revealing'));
stage.addEventListener('focus', () => stage.classList.add('revealing'));
stage.addEventListener('blur', () => stage.classList.remove('revealing'));
stage.addEventListener('keydown', event => {
  const moves = { ArrowLeft: [-3, 0], ArrowRight: [3, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] };
  if (!moves[event.key]) return;
  event.preventDefault();
  const [dx, dy] = moves[event.key];
  setPosition(position.x + dx, position.y + dy);
  stage.classList.add('revealing');
});
document.querySelector('#lens-size').addEventListener('input', event => stage.style.setProperty('--radius', `${event.target.value}px`));
toggle.addEventListener('click', () => {
  const full = stage.classList.toggle('full-sketch');
  if (full) clearWater();
  toggle.setAttribute('aria-pressed', String(full));
  toggle.textContent = full ? 'Return to lens view' : 'Show full sketch';
});
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    document.querySelectorAll('.project').forEach(item => {
      item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter;
    });
  });
});

// Scroll choreography follows the native page scroll, with no scrolling lock.
const header = document.querySelector('.header');
const heroArt = document.querySelector('.hero-art');
const hero = document.querySelector('.hero');
const about = document.querySelector('.about');
const ticker = document.querySelector('.ticker');
const tickerTrack = document.createElement('div');
tickerTrack.className = 'ticker-track';
const tickerGroup = document.createElement('div');
tickerGroup.className = 'ticker-group';
while (ticker.firstChild) tickerGroup.append(ticker.firstChild);
tickerTrack.append(tickerGroup, tickerGroup.cloneNode(true), tickerGroup.cloneNode(true));
ticker.append(tickerTrack);
let scrollFrame = 0;
const revealItems = [...document.querySelectorAll('.hero-copy > *, .section-heading, .filters, .project, .about > div:last-child')];
let revealObserver;

function revealItem(element) {
  element.classList.add('is-revealed');
  revealObserver?.unobserve(element);
}
if ('IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) revealItem(entry.target); });
  }, { threshold: .08, rootMargin: '0px 0px -35px 0px' });
  revealItems.forEach((element, index) => {
    element.classList.add('scroll-reveal');
    // Small offsets make neighboring pieces arrive in sequence.
    element.style.setProperty('--reveal-delay', `${element.classList.contains('project') ? (index % 2) * 90 : Math.min(index, 4) * 45}ms`);
    if (reducedMotion.matches) revealItem(element);
    else revealObserver.observe(element);
  });
  document.body.classList.add('motion-ready');
}
document.addEventListener('focusin', event => {
  const element = event.target.closest('.scroll-reveal');
  if (element) revealItem(element);
});

function updateScrollScene() {
  scrollFrame = 0;
  const scroll = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const heroRect = hero.getBoundingClientRect();
  const aboutRect = about.getBoundingClientRect();
  const workTop = document.querySelector('#work').getBoundingClientRect().top;
  const groupWidth = tickerGroup.getBoundingClientRect().width;
  const motion = reducedMotion.matches ? 0 : (window.innerWidth <= 600 ? .55 : 1);
  const heroProgress = Math.min(1, Math.max(0, -heroRect.top / heroRect.height));
  const aboutProgress = Math.min(1, Math.max(0, (window.innerHeight - aboutRect.top) / (window.innerHeight + aboutRect.height)));
  header.classList.toggle('scrolled', scroll > 24);
  header.style.setProperty('--scroll-progress', String(total > 0 ? Math.min(1, scroll / total) : 0));
  heroArt.style.setProperty('--hero-drift', `${heroProgress * 85 * motion}px`);
  heroArt.style.setProperty('--hero-turn', `${heroProgress * -8 * motion}deg`);
  heroArt.style.setProperty('--star-turn', `${heroProgress * 95 * motion}deg`);
  heroArt.style.setProperty('--stamp-drift', `${heroProgress * -45 * motion}px`);
  about.style.setProperty('--about-turn', `${(aboutProgress - .5) * 110 * motion}deg`);
  tickerTrack.style.transform = `translate3d(${-((scroll * .22 * motion) % (groupWidth || 1))}px,0,0)`;
  const activeSection = aboutRect.top < window.innerHeight * .48 ? '#about' : workTop < window.innerHeight * .55 ? '#work' : '';
  header.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === activeSection) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function scheduleScrollScene() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollScene);
}
window.addEventListener('scroll', scheduleScrollScene, { passive: true });
window.addEventListener('resize', scheduleScrollScene);
window.addEventListener('load', scheduleScrollScene);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) revealItems.forEach(revealItem);
  scheduleScrollScene();
});
// Filters and font loading can change section heights without a scroll event.
new ResizeObserver(scheduleScrollScene).observe(document.querySelector('main'));
document.fonts.ready.then(scheduleScrollScene);
updateScrollScene();
