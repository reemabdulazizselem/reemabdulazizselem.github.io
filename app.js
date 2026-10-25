const projects = {
  ouroboros: { title: 'Frankenstein Ouroboros', category: 'Illustration', prefix: 'ouroboros', width: 1357, height: 1800 },
  behar: { title: 'Behar', category: 'Graphic design · Book cover', prefix: 'behar', width: 1268, height: 1800 },
  studio: { title: 'The sunlit studio', category: 'Background art', prefix: 'studio', width: 1800, height: 950 },
  room: { title: 'A room of stories', category: 'Background art', prefix: 'room', width: 1800, height: 967 } ,
  manor: {"title": "The garden house", "category": "Background art", "prefix": "manor", "width": 1800, "height": 949, "hasSketch": true},
  market: {"title": "The cat market", "category": "Background art", "prefix": "market", "width": 1800, "height": 1010, "hasSketch": true},
  shop: {"title": "Inside the little shop", "category": "Background art", "prefix": "shop", "width": 1800, "height": 938, "hasSketch": false},
  journey: {"title": "A home on the move", "category": "Background art", "prefix": "journey", "width": 1547, "height": 1800, "hasSketch": false}
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
const logoEyes = [...document.querySelectorAll('.logo-eye')];
// Hidden dedication: displayed only after the six-eye challenge.
const dedicationMessage = `To the beautiful soul whose art reflects the beauty within.

May your life be filled with joy, laughter, and success. May your inner light keep shining and guide you through the darker days.

Always believe in yourself and in what you can create. Above all, I hope you see in yourself the same beauty you bring into the world.`;
const eyeClicks = new Map();
const eyeStorageKey = 'reem-eye-challenge-v2';
const eyeIdentities = new Set(['eye-left','eye-right','about-eye-left','about-eye-right','footer-eye-left','footer-eye-right']);
const eyeWindowMs = 30_000;
let eyeWindowStarted = null;
let eyeAttemptInvalid = false;
let dedicationDialog;
try {
  const saved = JSON.parse(sessionStorage.getItem(eyeStorageKey));
  if (saved && Number.isFinite(saved.started) && Date.now() >= saved.started && Date.now() - saved.started <= eyeWindowMs && Array.isArray(saved.eyes)) {
    eyeWindowStarted = saved.started;
    eyeAttemptInvalid = saved.invalid === true;
    saved.eyes.filter(id => eyeIdentities.has(id)).forEach(id => eyeClicks.set(id, saved.started));
  }
} catch { /* Storage can be unavailable in private browsing. */ }
function saveEyeAttempt() {
  try {
    if (eyeWindowStarted === null) sessionStorage.removeItem(eyeStorageKey);
    else sessionStorage.setItem(eyeStorageKey, JSON.stringify({started:eyeWindowStarted, invalid:eyeAttemptInvalid, eyes:[...eyeClicks.keys()]}));
  } catch { /* The six-eye challenge still works on the About page. */ }
}

function revealDedication() {
  if (!dedicationMessage.trim()) return;
  if (!dedicationDialog) {
    dedicationDialog = document.createElement('dialog');
    dedicationDialog.className = 'dedication';
    dedicationDialog.setAttribute('aria-labelledby', 'dedication-title');
    const heading = document.createElement('h2');
    heading.id = 'dedication-title';
    heading.textContent = 'For Reem';
    const message = document.createElement('p');
    message.className = 'dedication-message';
    message.textContent = dedicationMessage;
    const close = document.createElement('button');
    close.className = 'pill';
    close.textContent = 'Close';
    close.addEventListener('click', () => dedicationDialog.close());
    dedicationDialog.append(heading, message, close);
    document.body.append(dedicationDialog);
  }
  dedicationDialog.showModal();
}

// A failed attempt stays blocked until its original 30-second window expires.
// Checked only on clicks; the challenge needs no background timer.
logoEyes.forEach(eye => (eye.parentElement?.classList?.contains('eye-hitbox') ? eye.parentElement : eye).addEventListener('click', event => {
  event.preventDefault(); // Clicking an eye must not follow the logo's home link.
  const now = Date.now();
  const identity = eye.dataset.eyeId;
  if (!eyeIdentities.has(identity)) return;
  if (eyeWindowStarted === null || now - eyeWindowStarted > eyeWindowMs) {
    eyeClicks.clear();
    eyeWindowStarted = now;
    eyeAttemptInvalid = false;
  }
  if (eyeClicks.has(identity)) eyeAttemptInvalid = true;
  if (eyeAttemptInvalid) { saveEyeAttempt(); return; }
  eyeClicks.set(identity, now);
  saveEyeAttempt();
  if (eyeClicks.size === eyeIdentities.size) {
    eyeClicks.clear(); // Closing the note requires a fresh complete set to reopen.
    eyeWindowStarted = null;
    saveEyeAttempt();
    revealDedication();
  }
}));
let gazeFrame = 0;
let gazeTarget = null;
let eyeBoundsDirty = true;
let eyeBounds = [];
const pupils = logoEyes.map(eye => eye.querySelector('.eye-pupil'));
function updateGaze() {
  gazeFrame = 0;
  if (eyeBoundsDirty) {
    eyeBounds = logoEyes.map(eye => eye.querySelector('.eye-white').getBoundingClientRect());
    eyeBoundsDirty = false;
  }
  const offsets = eyeBounds.map(bounds => {
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) return null;
    if (!gazeTarget || reducedMotion.matches) return { x: 0, y: 0 };
    const dx = gazeTarget.x - bounds.left - bounds.width / 2;
    const dy = gazeTarget.y - bounds.top - bounds.height / 2;
    const distance = Math.hypot(dx, dy);
    const strength = Math.min(1, distance / 90);
    return { x: distance ? dx / distance * 3 * strength : 0, y: distance ? dy / distance * 1.6 * strength : 0 };
  });
  logoEyes.forEach((eye, index) => {
    if (offsets[index]) pupils[index].style.transform = `translate(${offsets[index].x}px, ${offsets[index].y}px)`;
  });
}
function scheduleGaze() {
  if (!gazeFrame) gazeFrame = requestAnimationFrame(updateGaze);
}
function resetGaze() { gazeTarget = null; scheduleGaze(); }
window.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' || reducedMotion.matches) return;
  gazeTarget = { x: event.clientX, y: event.clientY };
  scheduleGaze();
}, { passive: true });
document.addEventListener('pointerout', event => { if (!event.relatedTarget) resetGaze(); });
window.addEventListener('blur', resetGaze);
function invalidateEyeBounds() { eyeBoundsDirty = true; scheduleGaze(); }
window.addEventListener('scroll', invalidateEyeBounds, { passive: true });
window.addEventListener('resize', invalidateEyeBounds);
document.fonts.ready.then(invalidateEyeBounds);
window.addEventListener('load', invalidateEyeBounds);
reducedMotion.addEventListener('change', resetGaze);

// Eyelids cover only the eye openings, leaving the letter shapes and gaze intact.
const eyelids = new Map();
const blinkAnimations = new Map();
logoEyes.forEach(eye => {
  const lid = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  for (const [name, value] of Object.entries({ cx: 13, cy: 8.6, rx: 6.4, ry: 4.5, class: 'eye-lid' })) {
    lid.setAttribute(name, value);
  }
  eye.append(lid);
  eyelids.set(eye, lid);
  (eye.parentElement?.classList?.contains('eye-hitbox') ? eye.parentElement : eye).addEventListener('click', () => blinkEye(eye));
});
function blinkEye(eye, duration = 240) {
  if (reducedMotion.matches || document.hidden) return;
  blinkAnimations.get(eye)?.cancel();
  const animation = eyelids.get(eye).animate([
    { transform: 'scaleY(0)', offset: 0 },
    { transform: 'scaleY(1)', offset: .4 },
    { transform: 'scaleY(1)', offset: .55 },
    { transform: 'scaleY(0)', offset: 1 }
  ], { duration, easing: 'ease-in-out' });
  blinkAnimations.set(eye, animation);
  animation.onfinish = () => blinkAnimations.delete(eye);
}
const eyePairParent = eye => eye.parentElement?.classList?.contains('eye-hitbox') ? eye.parentElement.parentElement : eye.parentElement;
const eyePairs = [...new Set(logoEyes.map(eyePairParent))].map(parent => ({
  parent, eyes: logoEyes.filter(eye => eyePairParent(eye) === parent)
}));
let blinkTimer;
function scheduleBlink() {
  clearTimeout(blinkTimer);
  if (document.hidden || reducedMotion.matches) {
    blinkAnimations.forEach(animation => animation.cancel());
    blinkAnimations.clear();
    return;
  }
  blinkTimer = setTimeout(() => {
    if (!document.querySelector('dialog[open]')) {
      // Read the three logo bounds before animating, only once per interval.
      const visiblePairs = eyePairs.filter(({ parent }) => {
        const rect = parent.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
      });
      visiblePairs.forEach(({ eyes }) => {
        if (Math.random() < .35) {
          blinkEye(eyes[Math.floor(Math.random() * eyes.length)], 320);
        } else {
          eyes.forEach(eye => blinkEye(eye));
        }
      });
    }
    scheduleBlink();
  }, 4000 + Math.random() * 4000);
}
document.addEventListener('visibilitychange', scheduleBlink);
reducedMotion.addEventListener('change', scheduleBlink);
scheduleBlink();
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
  startWater();
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
  if (stage.classList.contains('artwork-only') || document.hidden || !(viewer.open || viewer.classList?.contains('inline-viewer')) || stage.classList.contains('full-sketch')) { clearWater(); return; }
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
  if (reducedMotion.matches) fluid.strength = active ? 1 : 0;
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
  const moving = Math.hypot(target.x - fluid.x, target.y - fluid.y) > .25;
  const fading = Math.abs((active ? 1 : 0) - fluid.strength) > .01;
  if (!reducedMotion.matches && (moving || fading || drops.length)) waterFrame = requestAnimationFrame(animateWater);
  else if (!active) clearWater();
  else lastFrame = 0; // Keep the settled mask without drawing more frames.
}
function startWater() {
  if (!stage.classList.contains('artwork-only') && !document.hidden && !waterFrame && (viewer.open || viewer.classList?.contains('inline-viewer')) && !stage.classList.contains('full-sketch')) waterFrame = requestAnimationFrame(animateWater);
}
sketch.addEventListener('load', startWater);
reducedMotion.addEventListener('change', () => { clearWater(); startWater(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) clearWater(); else startWater(); });
new MutationObserver(startWater).observe(stage, { attributes: true, attributeFilter: ['class'] });
function setPosition(x, y) {
  position = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  stage.style.setProperty('--x', `${position.x}%`);
  stage.style.setProperty('--y', `${position.y}%`);
  startWater();
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
    final.width = project.width;
    final.height = project.height;
    final.src = `assets/${project.prefix}-final.webp`;
    final.alt = `${project.title} — finished artwork`;
    const hasSketch = project.hasSketch !== false;
    stage.classList.toggle('artwork-only', !hasSketch);
    viewer.classList.toggle('artwork-only-viewer', !hasSketch);
    if (hasSketch) sketch.src = `assets/${project.prefix}-sketch.webp`;
    else sketch.removeAttribute('src');
    stage.tabIndex = hasSketch ? 0 : -1;
    stage.setAttribute('aria-label', hasSketch ? 'Artwork comparison. Use arrow keys to move the sketch lens.' : 'Finished artwork');
    document.querySelector('#viewer-help').textContent = hasSketch ? 'Move your cursor over the artwork to reveal the sketch beneath. On a touch screen, drag your finger across it.' : 'A closer look at the finished artwork.';
    document.querySelector('.keyboard-hint').textContent = hasSketch ? 'Keyboard: focus the artwork and use arrow keys · Escape to close' : 'Escape to close';
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
  if (viewer.classList.contains('inline-viewer')) return;
  const rect = viewer.getBoundingClientRect();
  if (event.target === viewer && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) viewer.close();
});
viewer.addEventListener('close', () => {
  clearWater();
  document.body.classList.remove('modal-open');
  opener?.focus();
});
function revealAt(event) {
  if (stage.classList.contains('artwork-only')) return;
  const rect = stage.getBoundingClientRect();
  setPosition((event.clientX - rect.left) / rect.width * 100, (event.clientY - rect.top) / rect.height * 100);
  stage.classList.add('revealing');
}
stage.addEventListener('pointermove', revealAt);
stage.addEventListener('pointerdown', event => {
  if (stage.classList.contains('artwork-only')) return;
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
  if (stage.classList.contains('artwork-only')) return;
  const moves = { ArrowLeft: [-3, 0], ArrowRight: [3, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] };
  if (!moves[event.key]) return;
  event.preventDefault();
  const [dx, dy] = moves[event.key];
  setPosition(position.x + dx, position.y + dy);
  stage.classList.add('revealing');
});
document.querySelector('#lens-size').addEventListener('input', event => {
  stage.style.setProperty('--radius', `${event.target.value}px`);
  startWater();
});
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
while (ticker?.firstChild) tickerGroup.append(ticker.firstChild);
tickerTrack.append(tickerGroup, tickerGroup.cloneNode(true), tickerGroup.cloneNode(true));
ticker?.append(tickerTrack);
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

const brandSatellites = [...document.querySelectorAll('.brand-satellite')];
const brandClearances = new Map();
function measureBrandClearances() {
  brandSatellites.forEach(satellite => {
    const radius = parseFloat(getComputedStyle(satellite.parentElement).getPropertyValue('--brand-radius'));
    const halfSize = satellite.offsetWidth / 2;
    // The yellow shape fits inside this circle. Keep its edge 2px clear.
    brandClearances.set(satellite, (halfSize + 2) / radius);
  });
}
measureBrandClearances();
window.addEventListener('resize', measureBrandClearances);
// Four concave sides, joined by rounded paths around the sharp tips.
// Arc-length parameterization keeps the speed even without measuring the DOM.
function brandContourPoint(progress, gap = .4) {
  const phase = ((progress % 4) + 4) % 4;
  const quadrant = Math.floor(phase);
  const distance = (phase - quadrant) * (1 + gap);
  let x, y, angle;
  if (distance < gap) {
    angle = -Math.PI / 2 + distance / gap * Math.PI / 2;
    x = gap * Math.cos(angle);
    y = -1 + gap * Math.sin(angle);
  } else if (distance < 1) {
    angle = (distance - gap) / (1 - gap) * Math.PI / 2;
    x = 1 - (1 - gap) * Math.cos(angle);
    y = -1 + (1 - gap) * Math.sin(angle);
  } else {
    angle = -Math.PI / 2 + (distance - 1) / gap * Math.PI / 2;
    x = 1 + gap * Math.cos(angle);
    y = gap * Math.sin(angle);
  }
  const turn = quadrant * Math.PI / 2;
  return { x: x * Math.cos(turn) - y * Math.sin(turn), y: x * Math.sin(turn) + y * Math.cos(turn) };
}
let brandEdgeOffset = 0;
let brandEdgeFrame = 0;
let brandScrollLimit = 0;
let brandTouchY = null;
function advanceBrandAtEdge(delta) {
  if (!delta || reducedMotion.matches || document.hidden || document.body.classList.contains('modal-open')) return;
  const position = Math.max(0, Math.min(brandScrollLimit, window.scrollY));
  if (!((delta < 0 && position <= 1) || (delta > 0 && position >= brandScrollLimit - 1))) return;
  brandEdgeOffset = (brandEdgeOffset + Math.max(-160, Math.min(160, delta))) % 1520;
  if (!brandEdgeFrame) brandEdgeFrame = requestAnimationFrame(() => {
    brandEdgeFrame = 0;
    updateBrandOrbit(Math.max(0, Math.min(brandScrollLimit, window.scrollY)));
  });
}
window.addEventListener('wheel', event => {
  if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
  advanceBrandAtEdge(event.deltaY * unit);
}, { passive: true });
window.addEventListener('touchstart', event => {
  brandTouchY = event.touches.length === 1 ? event.touches[0].clientY : null;
}, { passive: true });
window.addEventListener('touchmove', event => {
  if (event.touches.length !== 1) { brandTouchY = null; return; }
  const nextY = event.touches[0].clientY;
  if (brandTouchY !== null) advanceBrandAtEdge(brandTouchY - nextY);
  brandTouchY = nextY;
}, { passive: true });
window.addEventListener('touchend', () => { brandTouchY = null; }, { passive: true });
window.addEventListener('touchcancel', () => { brandTouchY = null; }, { passive: true });
window.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input,textarea,select,button,a,[contenteditable],[role="group"]')) return;
  const delta = event.key === 'ArrowDown' ? 40 : event.key === 'ArrowUp' ? -40 : event.key === 'PageDown' ? window.innerHeight * .8 : event.key === 'PageUp' ? -window.innerHeight * .8 : event.key === ' ' ? (event.shiftKey ? -1 : 1) * window.innerHeight * .8 : 0;
  advanceBrandAtEdge(delta);
});
function updateBrandOrbit(scroll) {
  const progress = reducedMotion.matches ? .5 : .5 + (scroll + brandEdgeOffset) / 380;
  brandSatellites.forEach(satellite => {
    const { x, y } = brandContourPoint(progress, brandClearances.get(satellite));
    satellite.style.transform = `translate3d(calc(var(--brand-radius) * ${x}),calc(var(--brand-radius) * ${y}),0)`;
  });
}
function updateScrollScene() {
  scrollFrame = 0;
  const scroll = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  brandScrollLimit = Math.max(0, total);
  updateBrandOrbit(Math.max(0, Math.min(brandScrollLimit, scroll)));
  const heroRect = (hero?.getBoundingClientRect() || {top:0,height:1});
  const aboutRect = (about?.getBoundingClientRect() || {top:0,height:1});
  const groupWidth = tickerGroup.getBoundingClientRect().width;
  const motion = reducedMotion.matches ? 0 : (window.innerWidth <= 600 ? .55 : 1);
  const heroProgress = Math.min(1, Math.max(0, -heroRect.top / heroRect.height));
  const aboutProgress = Math.min(1, Math.max(0, (window.innerHeight - aboutRect.top) / (window.innerHeight + aboutRect.height)));
  header.classList.toggle('scrolled', scroll > 24);
  header.style.setProperty('--scroll-progress', String(total > 0 ? Math.min(1, scroll / total) : 0));
  heroArt?.style.setProperty('--hero-drift', `${heroProgress * 85 * motion}px`);
  heroArt?.style.setProperty('--hero-turn', `${heroProgress * -8 * motion}deg`);
  heroArt?.style.setProperty('--star-turn', `${heroProgress * 95 * motion}deg`);
  heroArt?.style.setProperty('--stamp-drift', `${heroProgress * -45 * motion}px`);
  about?.style.setProperty('--about-turn', `${(aboutProgress - .5) * 110 * motion}deg`);
  tickerTrack.style.transform = `translate3d(${-((scroll * .22 * motion) % (groupWidth || 1))}px,0,0)`;

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
new ResizeObserver(() => { scheduleScrollScene(); invalidateEyeBounds(); }).observe(document.querySelector('main'));
document.fonts.ready.then(scheduleScrollScene);
updateScrollScene();

// A single sketch wave previews the featured artwork on hover or keyboard focus.
const featuredArt = document.querySelector('.hero-picture');
let featuredSketch;
let featuredWave;
let featuredPreviewActive = false;
let featuredPreviewVersion = 0;
function waveBand(progress) {
  const center = -35 + progress * 170;
  const edge = (y, side) => `${center + side * 16 + Math.sin(y / 100 * Math.PI * 2 + progress * 4) * 6}% ${y}%`;
  const points = [];
  for (let y = 0; y <= 100; y += 5) points.push(edge(y, -1));
  for (let y = 100; y >= 0; y -= 5) points.push(edge(y, 1));
  return `polygon(${points.join(',')})`;
}
async function previewFeaturedSketch(intro = false) {
  if (featuredPreviewActive || document.hidden || viewer.open) return;
  featuredPreviewActive = true;
  const version = ++featuredPreviewVersion;
  if (!featuredSketch) {
    featuredSketch = new Image();
    featuredSketch.className = 'featured-sketch';
    featuredSketch.alt = '';
    featuredSketch.setAttribute('aria-hidden', 'true');
    featuredSketch.width = 1357;
    featuredSketch.height = 1800;
    featuredSketch.sizes = '(max-width: 600px) 60vw, 480px';
    featuredSketch.srcset = 'assets/ouroboros-sketch-480.webp 480w, assets/ouroboros-sketch-960.webp 960w';
    featuredSketch.src = 'assets/ouroboros-sketch-960.webp';
    const waveLayer = document.createElement('span');
    waveLayer.className = 'featured-wave-layer';
    waveLayer.setAttribute('aria-hidden', 'true');
    waveLayer.append(featuredSketch);
    featuredArt.append(waveLayer);
  }
  try { await featuredSketch.decode(); } catch { stopFeaturedPreview(); return; }
  if (!featuredPreviewActive || version !== featuredPreviewVersion) return;
  if (reducedMotion.matches) {
    featuredSketch.style.clipPath = waveBand(.5);
    return;
  }
  featuredWave = featuredSketch.animate(
    Array.from({ length: 41 }, (_, i) => ({ clipPath: waveBand(i / 40), offset: i / 40 })),
    { duration: 2200, easing: 'ease-in-out' }
  );
  featuredWave.onfinish = () => {
    if (intro && version === featuredPreviewVersion) featuredPreviewActive = false;
  };
}
function stopFeaturedPreview() {
  featuredPreviewActive = false;
  featuredPreviewVersion++;
  featuredWave?.cancel();
  featuredWave = null;
  if (featuredSketch) featuredSketch.style.clipPath = 'inset(0 100% 0 0)';
}
featuredArt?.addEventListener('pointerenter', event => {
  if (event.pointerType !== 'touch') previewFeaturedSketch();
});
featuredArt?.addEventListener('pointerleave', stopFeaturedPreview);
featuredArt?.addEventListener('focus', () => {
  if (featuredArt.matches(':focus-visible')) previewFeaturedSketch();
});
featuredArt?.addEventListener('blur', stopFeaturedPreview);
featuredArt?.addEventListener('click', stopFeaturedPreview);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopFeaturedPreview();
});
reducedMotion.addEventListener('change', stopFeaturedPreview);

// One entrance preview after the final artwork is ready; never a repeating loop.
let introWavePending = true;
async function previewOnArrival() {
  if (!featuredArt || !introWavePending || document.hidden) return;
  introWavePending = false;
  if (reducedMotion.matches) return;
  try { await featuredArt.querySelector('img').decode(); } catch { return; }
  previewFeaturedSketch(true);
}
if (document.readyState === 'complete') previewOnArrival();
else window.addEventListener('load', previewOnArrival, { once: true });
document.addEventListener('visibilitychange', previewOnArrival);

// The actual pointer is a native SVG cursor, so tracking never waits for animation.
// Only the decorative tail/rays use a DOM layer; it rests when the mouse is idle.
const cursorDevice = window.matchMedia('(hover: hover) and (pointer: fine)');
const pointerDecor = document.createElement('span');
pointerDecor.className = 'pointer-decoration';
pointerDecor.setAttribute('aria-hidden', 'true');
pointerDecor.innerHTML = `<svg class="pointer-tail" width="62" height="82" viewBox="0 0 62 82"><g fill="none" stroke="#5661ed" stroke-width="1.2"><path d="M1 1C29 20 22 37 14 51S9 73 19 81"/><path d="M1 24Q4 31 12 28Q5 33 8 39Q2 34-3 36Q3 30 1 24Z"/></g><path fill="#5661ed" d="M25 51Q24 60 35 60Q26 63 28 72Q23 64 15 65Q25 62 25 51Z"/></svg><svg class="pointer-rays" width="30" height="26" viewBox="0 0 60 52"><path d="M30 2L32 13M45 3L42 14M57 12L49 20M4 20L16 24M2 35L15 34M10 49L20 42" fill="none" stroke="#5661ed" stroke-width="3" stroke-linecap="round"/></svg>`;
document.body.append(pointerDecor);
let pointerRestTimer;
let pointerAnimating = false;
function restPointer() {
  clearTimeout(pointerRestTimer);
  pointerAnimating = false;
  pointerDecor.classList.remove('moving');
}
function hidePointerDecor() { restPointer(); pointerDecor.classList.remove('visible'); }
function updatePointerDecor(event) {
  if (event.pointerType !== 'mouse' || !cursorDevice.matches || reducedMotion.matches || document.hidden) { hidePointerDecor(); return; }
  const target = event.target instanceof Element ? event.target : null;
  const interactive = !!target?.closest('a,button,input,select,textarea,[role="button"],.logo-eye,.eye-hitbox');
  const host = target?.closest('dialog[open]') || document.body;
  if (pointerDecor.parentElement !== host) host.append(pointerDecor);
  pointerDecor.classList.toggle('clickable', interactive);
  pointerDecor.classList.add('visible');
  pointerDecor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
  if (!pointerAnimating) { pointerDecor.classList.add('moving'); pointerAnimating = true; }
  clearTimeout(pointerRestTimer);
  pointerRestTimer = setTimeout(restPointer, 180);
}
window.addEventListener('pointermove', updatePointerDecor, {passive:true});
document.addEventListener('pointerover', updatePointerDecor, {passive:true});
document.addEventListener('pointerout', event => { if (!event.relatedTarget) hidePointerDecor(); });
window.addEventListener('blur', hidePointerDecor);
window.addEventListener('scroll', hidePointerDecor, {passive:true});
document.addEventListener('visibilitychange', hidePointerDecor);
document.addEventListener('keydown', hidePointerDecor);
document.addEventListener('close', hidePointerDecor, true);
cursorDevice.addEventListener('change', hidePointerDecor);
reducedMotion.addEventListener('change', hidePointerDecor);

// Move the existing comparison into a top-layer dialog; preserve its reveal state.
const maximizeArtwork = document.querySelector('#maximize-artwork');
if (maximizeArtwork) {
  let expandedArtwork;
  let artworkPlaceholder;
  let originalImageSizes;
  const artworkImage = document.querySelector('#final-image');
  maximizeArtwork.addEventListener('click', () => {
    if (expandedArtwork?.open) { expandedArtwork.close(); return; }
    if (!expandedArtwork) {
      expandedArtwork = document.createElement('dialog');
      expandedArtwork.className = 'art-max-dialog';
      expandedArtwork.setAttribute('aria-label', 'Maximized artwork');
      document.body.append(expandedArtwork);
      expandedArtwork.addEventListener('close', () => {
        artworkPlaceholder.replaceWith(viewer);
        document.body.classList.remove('modal-open');
        maximizeArtwork.setAttribute('aria-expanded', 'false');
        maximizeArtwork.innerHTML = 'Maximize artwork <span aria-hidden="true">⤢</span>';
        if (originalImageSizes === null) artworkImage.removeAttribute('sizes');
        else artworkImage.setAttribute('sizes', originalImageSizes);
        stage.classList.remove('revealing');
        clearWater();
        maximizeArtwork.focus({preventScroll:true});
      });
    }
    artworkPlaceholder = document.createElement('div');
    artworkPlaceholder.style.height = `${viewer.getBoundingClientRect().height}px`;
    viewer.replaceWith(artworkPlaceholder);
    expandedArtwork.append(viewer);
    originalImageSizes = artworkImage.getAttribute('sizes');
    artworkImage.setAttribute('sizes', '100vw');
    maximizeArtwork.setAttribute('aria-expanded', 'true');
    maximizeArtwork.innerHTML = 'Exit enlarged view <span aria-hidden="true">×</span>';
    document.body.classList.add('modal-open');
    expandedArtwork.showModal();
    maximizeArtwork.focus({preventScroll:true});
  });
}
