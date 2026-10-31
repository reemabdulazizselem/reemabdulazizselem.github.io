(() => {
  const dialog = document.querySelector('#timeline-viewer');
  if (!dialog) return;
  const image = dialog.querySelector('#timeline-image');
  const caption = dialog.querySelector('#timeline-caption');
  const prev = dialog.querySelector('#timeline-prev');
  const next = dialog.querySelector('#timeline-next');
  let photos = [], index = 0, opener;
  function show(n) {
    index = n;
    const photo = photos[index];
    image.src = photo.href;
    image.alt = photo.dataset.caption;
    caption.textContent = photo.dataset.caption;
    prev.disabled = index === 0;
    next.disabled = index === photos.length - 1;
  }
  document.querySelectorAll('.timeline-photo').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      photos = [...link.closest('.timeline-photos').querySelectorAll('.timeline-photo')];
      show(photos.indexOf(link));
      dialog.showModal();
    });
  });
  prev.addEventListener('click', () => { if (index > 0) show(index - 1); });
  next.addEventListener('click', () => { if (index < photos.length - 1) show(index + 1); });
  dialog.querySelector('#timeline-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); show(index - 1); }
    if (event.key === 'ArrowRight' && index < photos.length - 1) { event.preventDefault(); show(index + 1); }
  });
  dialog.addEventListener('close', () => { image.removeAttribute('src'); opener?.focus({preventScroll:true}); });
})();
