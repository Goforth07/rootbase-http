// On wide screens, pins the feature cards below the nav and slides them sideways as the page
// scrolls down, then lets the page carry on. Elsewhere the cards swipe (CSS) or sit in a grid.
(function () {
  var pin = document.querySelector('.features-pin');
  var sticky = document.querySelector('.features-sticky');
  var row = document.querySelector('.features-grid');
  var nav = document.querySelector('.site-nav');
  if (!pin || !sticky || !row) return;

  var root = document.documentElement;
  var wide = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
  var distance = 0;
  var navHeight = 0;
  var queued = false;

  function measure() {
    if (!wide.matches) {
      root.classList.remove('has-feature-pin');
      pin.style.height = '';
      row.style.transform = '';
      return;
    }
    navHeight = nav ? nav.offsetHeight : 0;
    root.style.setProperty('--nav-height', navHeight + 'px');
    root.classList.add('has-feature-pin');
    row.style.transform = '';
    var last = row.lastElementChild;
    var padEnd = parseFloat(getComputedStyle(row).paddingRight) || 0;
    distance = Math.max(0, last.offsetLeft + last.offsetWidth + padEnd - row.clientWidth);
    pin.style.height = (sticky.offsetHeight + distance) + 'px';
    update();
  }

  function update() {
    queued = false;
    if (!wide.matches) return;
    var scrolled = navHeight - pin.getBoundingClientRect().top;
    var x = Math.min(Math.max(scrolled, 0), distance);
    row.style.transform = 'translate3d(' + (-x) + 'px, 0, 0)';
  }

  function onScroll() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  if (wide.addEventListener) wide.addEventListener('change', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();
})();
