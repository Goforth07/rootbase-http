// Loaded synchronously in <head> so a saved theme applies before first paint.
(function () {
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function saved() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }

  var initial = saved();
  if (initial === 'light' || initial === 'dark') root.setAttribute('data-theme', initial);

  function current() {
    return root.getAttribute('data-theme') || (media.matches ? 'dark' : 'light');
  }

  function label(button) {
    var next = current() === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    button.setAttribute('title', 'Switch to ' + next + ' mode');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.querySelector('.theme-toggle');
    if (!button) return;
    button.hidden = false;
    label(button);
    button.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      label(button);
    });
    media.addEventListener('change', function () { label(button); });
  });
})();
