// Galleries load a single full-size image at a time and have no autoplay timer.
(() => {
  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;
  const images = JSON.parse(document.querySelector('#gallery-data').textContent);
  const image = gallery.querySelector('#final-image');
  const stage = gallery.querySelector('#art-stage');
  const strip = gallery.querySelector('.gallery-thumbnails');
  const thumbs = [...strip.querySelectorAll('button')];
  const previous = gallery.querySelector('.gallery-prev');
  const next = gallery.querySelector('.gallery-next');
  const position = gallery.querySelector('.gallery-position');
  let current = 0;
  let gesture = null;

  function select(index) {
    index = Math.max(0, Math.min(images.length - 1, index));
    if (index === current) return;
    current = index;
    const item = images[index];
    image.alt = item.alt;
    image.width = item.width;
    image.height = item.height;
    image.srcset = `${item.small} ${item.smallWidth}w, ${item.src} ${item.width}w`;
    image.src = item.small;
    position.textContent = `${index + 1} / ${images.length}`;
    previous.disabled = index === 0;
    next.disabled = index === images.length - 1;
    thumbs.forEach((thumb, i) => thumb.setAttribute('aria-current', String(i === index)));
    // Scroll only the thumbnail strip, keeping the page at the same position.
    const selected = thumbs[index].getBoundingClientRect();
    const bounds = strip.getBoundingClientRect();
    if (selected.left < bounds.left) strip.scrollLeft -= bounds.left - selected.left + 8;
    else if (selected.right > bounds.right) strip.scrollLeft += selected.right - bounds.right + 8;
  }

  previous.addEventListener('click', () => select(current - 1));
  next.addEventListener('click', () => select(current + 1));
  thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => select(index)));
  gallery.addEventListener('keydown', event => {
    if (event.target === gallery.querySelector('#maximize-artwork')) return;
    const keys = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: images.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    select(keys[event.key]);
    if (strip.contains(event.target)) thumbs[current].focus({ preventScroll: true });
  });
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.3) select(current + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => { gesture = null; });

  let wheelAmount = 0;
  let lastWheelTime = -Infinity;
  let lastWheelChange = -Infinity;
  gallery.addEventListener('wheel', event => {
    if (!gallery.closest('.art-max-dialog[open]') || event.ctrlKey) return;
    // Horizontal scrolling over the queue still scrolls its thumbnails.
    if (strip.contains(event.target) && Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!delta) return;
    event.preventDefault();
    const now = event.timeStamp;
    if (now - lastWheelTime > 200 || Math.sign(delta) !== Math.sign(wheelAmount)) wheelAmount = 0;
    lastWheelTime = now;
    if (now - lastWheelChange < 350) { wheelAmount = 0; return; }
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
    wheelAmount += delta * unit;
    if (Math.abs(wheelAmount) < 48) return;
    select(current + Math.sign(wheelAmount));
    wheelAmount = 0;
    lastWheelChange = now;
  }, { passive: false });
})();
