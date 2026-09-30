// Turns the "A closer look" steps into tabs beside one phone, advancing every few seconds until
// the visitor takes over. Without this script the steps stay a list, each caption with its phone.
(function () {
  var section = document.querySelector('.showcase');
  var list = section && section.querySelector('.showcase-steps');
  if (!list) return;

  var steps = list.querySelectorAll('.showcase-step');
  var count = steps.length;
  if (!count) return;

  var tour = list.parentNode;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var tabs = [];
  var fills = [];
  var panels = [];
  var shots = [];
  var index = 0;
  var stopped = false;
  var holds = { offscreen: 'IntersectionObserver' in window, hidden: document.hidden, hover: false, focus: false };

  function make(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  var side = make('div', 'showcase-side');
  var scroller = make('div', 'showcase-tabs');
  var tablist = make('div', 'showcase-tablist');
  var panelWrap = make('div', 'showcase-panels');
  var controls = make('div', 'showcase-controls');
  var toggle = make('button', 'showcase-toggle');
  var counter = make('p', 'showcase-count');
  var phone = make('div', 'showcase-phone');

  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'App screens');

  for (var i = 0; i < count; i++) {
    var n = i + 1;
    var tab = make('button', 'showcase-tab');
    tab.type = 'button';
    tab.id = 'showcase-tab-' + n;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', 'showcase-panel-' + n);
    tab.innerHTML =
      '<span class="showcase-tab-num" aria-hidden="true">' + (n < 10 ? '0' : '') + n + '</span>' +
      '<span class="showcase-tab-label"></span>' +
      '<span class="showcase-tab-track" aria-hidden="true"><span class="showcase-tab-fill"></span></span>';
    tab.querySelector('.showcase-tab-label').textContent = steps[i].getAttribute('data-tab');
    tablist.appendChild(tab);
    tabs.push(tab);
    fills.push(tab.querySelector('.showcase-tab-fill'));

    var panel = steps[i].querySelector('.showcase-copy');
    panel.id = 'showcase-panel-' + n;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    panelWrap.appendChild(panel);
    panels.push(panel);

    var shot = steps[i].querySelector('.showcase-shot');
    phone.appendChild(shot);
    shots.push(shot);
  }

  toggle.type = 'button';
  toggle.innerHTML =
    '<svg class="icon-pause" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M9 6v12M15 6v12"/></svg>' +
    '<svg class="icon-play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
  controls.appendChild(toggle);
  controls.appendChild(counter);

  scroller.appendChild(tablist);
  side.appendChild(scroller);
  side.appendChild(panelWrap);
  side.appendChild(controls);
  tour.appendChild(side);
  tour.appendChild(phone);
  tour.removeChild(list);
  tour.classList.add('is-tabbed');

  // Keeps the active pill in view when the tabs are a scrolling row on narrow screens.
  function reveal(tab) {
    if (scroller.scrollWidth <= scroller.clientWidth) return;
    var inset = parseFloat(getComputedStyle(tablist).paddingLeft) || 0;
    var left = tab.offsetLeft - inset;
    var right = tab.offsetLeft + tab.offsetWidth + inset - scroller.clientWidth;
    var target = scroller.scrollLeft > left ? left : scroller.scrollLeft < right ? right : null;
    if (target !== null) scroller.scrollTo({ left: target, behavior: motion.matches ? 'auto' : 'smooth' });
  }

  function select(next) {
    index = (next + count) % count;
    for (var i = 0; i < count; i++) {
      var active = i === index;
      tabs[i].setAttribute('aria-selected', active ? 'true' : 'false');
      tabs[i].tabIndex = active ? 0 : -1;
      tabs[i].classList.toggle('is-current', active);
      tabs[i].classList.toggle('is-done', i < index);
      panels[i].hidden = !active;
      shots[i].classList.toggle('is-active', active);
      if (active) shots[i].removeAttribute('aria-hidden');
      else shots[i].setAttribute('aria-hidden', 'true');
    }
    counter.textContent = (index + 1) + ' of ' + count;
    reveal(tabs[index]);
  }

  // Stopped means the visitor is driving: the active bar fills and changes get announced.
  function setStopped(value) {
    stopped = value;
    tour.classList.toggle('is-stopped', stopped);
    if (stopped) panelWrap.setAttribute('aria-live', 'polite');
    else panelWrap.removeAttribute('aria-live');
    toggle.setAttribute('aria-label', stopped ? 'Play auto-advance' : 'Pause auto-advance');
  }

  // Held pauses the progress bar where it is; it carries on once nothing holds it.
  function hold(reason, value) {
    holds[reason] = value;
    tour.classList.toggle('is-held', holds.offscreen || holds.hidden || holds.hover || holds.focus);
  }

  function applyMotion() {
    toggle.hidden = motion.matches;
    if (motion.matches) setStopped(true);
  }

  tablist.addEventListener('click', function (event) {
    var tab = event.target.closest('[role="tab"]');
    if (!tab) return;
    setStopped(true);
    select(tabs.indexOf(tab));
  });

  tablist.addEventListener('keydown', function (event) {
    var keys = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: count - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    setStopped(true);
    select(keys[event.key]);
    tabs[index].focus();
  });

  tablist.addEventListener('animationend', function (event) {
    if (!stopped && event.target === fills[index]) select(index + 1);
  });

  toggle.addEventListener('click', function () { setStopped(!stopped); });

  // Pointer or keyboard focus in the section pauses it, except focus on the play button itself.
  section.addEventListener('pointerenter', function (event) {
    if (event.pointerType === 'mouse') hold('hover', true);
  });
  section.addEventListener('pointerleave', function () { hold('hover', false); });
  section.addEventListener('focusin', function (event) { hold('focus', event.target !== toggle); });
  section.addEventListener('focusout', function (event) {
    if (!section.contains(event.relatedTarget)) hold('focus', false);
  });

  document.addEventListener('visibilitychange', function () { hold('hidden', document.hidden); });

  if (holds.offscreen) {
    new IntersectionObserver(function (entries) {
      hold('offscreen', !entries[entries.length - 1].isIntersecting);
    }).observe(tour);
  }

  if (motion.addEventListener) motion.addEventListener('change', applyMotion);

  setStopped(false);
  applyMotion();
  hold('hidden', document.hidden);
  select(0);
})();
