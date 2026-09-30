// Pins one phone beside the showcase captions on wide screens and shows the screenshot for
// whichever caption is mid-screen. Without this script, each caption keeps its own phone.
(function () {
  var steps = document.querySelectorAll('.showcase-step');
  var shots = document.querySelectorAll('.showcase-shot');
  if (!steps.length || steps.length !== shots.length || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('has-showcase-stage');

  function show(index) {
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.toggle('is-active', i === index);
      shots[i].classList.toggle('is-active', i === index);
    }
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) show(Number(entry.target.getAttribute('data-step')));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  for (var i = 0; i < steps.length; i++) observer.observe(steps[i]);
})();
