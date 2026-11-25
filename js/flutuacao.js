
(() => {
  const floatingSurfaces = document.querySelectorAll(
    '.overview > .introCopy, .overview > .heroBalance, .overview > .summary, .windowDeck > .windowTile, #inicio > footer',
  );
  const onScreen = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.toggleAttribute('data-in-view', entry.isIntersecting);
  });
  for (const surface of floatingSurfaces) {
    surface.classList.add('floatSurface');
    onScreen.observe(surface);
  }
})();
