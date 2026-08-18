(function () {
  var globalCurrentStar = null;
  var globalStarIndex = 0;
  var activeTargetCount = 0;

  function setStarPosition(star, x, y, rotation) {
    star.style.setProperty('--star-x', x + 'px');
    star.style.setProperty('--star-y', y + 'px');
    star.style.setProperty('--star-rotation', rotation + 'deg');
  }

  function clearCursorStars() {
    document.querySelectorAll('.title-cursor-star').forEach(function (star) {
      star.remove();
    });
    globalCurrentStar = null;
    window.__titleCursorPersistentStarVisible = false;
  }

  function ensureCurrentStar() {
    if (globalCurrentStar) return globalCurrentStar;

    globalCurrentStar = document.createElement('span');
    globalCurrentStar.className = 'title-cursor-star title-cursor-star-current';
    globalCurrentStar.style.setProperty('--star-size', '18px');
    document.body.appendChild(globalCurrentStar);

    return globalCurrentStar;
  }

  function updateCurrentStar(event) {
    var star = ensureCurrentStar();
    setStarPosition(star, event.clientX, event.clientY, (globalStarIndex * 22) % 360);
    window.__titleCursorPersistentStarVisible = true;
  }

  function initCursorStarsForTarget(target, trailDisabledSelector) {
    if (!target || target.dataset.titleCursorStarInit) return;

    target.dataset.titleCursorStarInit = 'true';

    target.classList.add('title-cursor-target');

    var lastStar = { x: 0, y: 0, time: 0 };
    var starGap = 110;

    function clearTrailStars() {
      document.querySelectorAll('.title-cursor-star:not(.title-cursor-star-current)').forEach(function (star) {
        star.remove();
      });
      lastStar = { x: 0, y: 0, time: 0 };
    }

    function isOverTrailDisabledTarget(event) {
      if (!trailDisabledSelector) return false;
      return Boolean(event.target.closest && event.target.closest(trailDisabledSelector));
    }

    function spawnTitleStar(event) {
      updateCurrentStar(event);

      if (isOverTrailDisabledTarget(event)) {
        clearTrailStars();
        return;
      }

      var now = performance.now();
      var dx = event.clientX - lastStar.x;
      var dy = event.clientY - lastStar.y;
      var dt = Math.max(now - lastStar.time, 8);
      var distance = Math.sqrt(dx * dx + dy * dy);

      if (lastStar.time && distance < starGap) return;

      var speed = distance / dt;
      var size = Math.max(14, Math.min(44, 16 + speed * 24));
      var star = document.createElement('span');
      var rotation = (globalStarIndex * 22) + (speed * 40);

      star.className = 'title-cursor-star';
      star.style.setProperty('--star-size', size + 'px');
      setStarPosition(star, event.clientX, event.clientY, rotation);

      document.body.appendChild(star);

      window.__titleCursorStarsEnabled = true;
      window.__titleCursorStarGap = starGap;
      window.__titleCursorLastStarSize = size;
      window.__titleCursorStarCount = (window.__titleCursorStarCount || 0) + 1;

      globalStarIndex++;
      lastStar = { x: event.clientX, y: event.clientY, time: now };

      setTimeout(function () {
        star.remove();
      }, 560);
    }

    target.addEventListener('pointermove', spawnTitleStar, { passive: true });
    target.addEventListener('pointerleave', function () {
      activeTargetCount = Math.max(0, activeTargetCount - 1);
      if (activeTargetCount === 0) clearCursorStars();
    });
    target.addEventListener('pointerenter', function (event) {
      activeTargetCount++;
      updateCurrentStar(event);
    });

    if (trailDisabledSelector) {
      target.querySelectorAll(trailDisabledSelector).forEach(function (disabledTarget) {
        disabledTarget.addEventListener('pointerenter', function (event) {
          clearTrailStars();
          updateCurrentStar(event);
        }, { passive: true });
        disabledTarget.addEventListener('pointermove', function (event) {
          clearTrailStars();
          updateCurrentStar(event);
        }, { passive: true });
      });
    }
  }

  function initTitleCursorStars() {
    if (!window.matchMedia('(min-width: 901px)').matches) {
      clearCursorStars();
      return;
    }

    initCursorStarsForTarget(
      document.querySelector('.page'),
      '.wish-card, .reserve-btn, .wish-link, .nav-brand, .nav-status'
    );

    window.__titleCursorStarsEnabled = true;
    window.__titleCursorPersistentStar = true;
    window.__titleCursorTrailDisabledTargets = '.hero-object, .cards-row-wrap .card, .contact-link';
    window.__titleCursorGlyphOnly = false;
    window.__titleCursorScope = 'hero,contact';
    window.__titleCursorStarGap = 110;
  }

  window.initTitleCursorStars = initTitleCursorStars;

  function bootTitleCursorStars() {
    if (window.matchMedia('(min-width: 901px)').matches) {
      initTitleCursorStars();
    }
  }

  var titleCursorMq = window.matchMedia('(min-width: 901px)');
  titleCursorMq.addEventListener('change', function (event) {
    if (event.matches) {
      bootTitleCursorStars();
    } else {
      clearCursorStars();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootTitleCursorStars);
  } else {
    bootTitleCursorStars();
  }
})();
