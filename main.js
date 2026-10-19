(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 960px)');
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  document.getElementById('yr').textContent = new Date().getFullYear();

  // Conversion events, picked up by GA4/GTM once a container is added
  window.dataLayer = window.dataLayer || [];
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (el) window.dataLayer.push({ event: 'cta_click', cta: el.getAttribute('data-track') });
  });

  // Open / closed status, in Colorado time (Mon–Fri 8–17)
  (function () {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', weekday: 'short', hour: 'numeric', hourCycle: 'h23', minute: 'numeric' })
      .formatToParts(new Date())
      .reduce(function (o, p) { o[p.type] = p.value; return o; }, {});
    var day = parts.weekday, h = +parts.hour + (+parts.minute) / 60;
    var weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(day) !== -1;
    var open = weekday && h >= 8 && h < 17;
    var text;
    if (open) text = 'Open now · until 5pm';
    else if (weekday && h < 8) text = 'Closed · opens 8am today';
    else if (day === 'Fri' || day === 'Sat' || day === 'Sun') text = 'Closed · opens Monday 8am';
    else text = 'Closed · opens 8am tomorrow';
    document.querySelectorAll('[data-open-status]').forEach(function (el) {
      el.classList.toggle('is-open', open);
      el.querySelector('.status-text').textContent = text;
    });
  })();

  // Split the statement into words for the scroll reveal
  var statement = document.querySelector('[data-words]');
  var words = [];
  if (statement && !reduce) {
    var text = statement.textContent.trim().split(/\s+/);
    statement.textContent = '';
    text.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = w;
      statement.appendChild(span);
      if (i < text.length - 1) statement.appendChild(document.createTextNode(' '));
    });
    words = statement.querySelectorAll('.w');
  }

  // Fade-up reveals
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('in');
        io.unobserve(el);
        // Drop the reveal styles once played so they don't delay hover transitions
        var delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
        setTimeout(function () {
          el.classList.remove('reveal', 'in');
          el.style.removeProperty('--d');
        }, (delay + 0.9) * 1000);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.section-head, .story-intro, .offer, .review, .faq-list, .contact-info, .lead-form, .gallery-head').forEach(function (el) {
      var siblings = el.parentElement.children;
      var i = Array.prototype.indexOf.call(siblings, el);
      if (el.matches('.offer, .review')) el.style.setProperty('--d', (i * 0.12) + 's');
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // Story: swap the pinned image to match the step in view
  var steps = document.querySelectorAll('.story-step');
  var storyImgs = document.querySelectorAll('.story-img');
  var storyBar = document.querySelector('.story-progress');
  function setStep(n) {
    steps.forEach(function (s, i) { s.classList.toggle('is-active', i === n); });
    storyImgs.forEach(function (img, i) { img.classList.toggle('is-active', i === n); });
    if (storyBar) storyBar.style.setProperty('--sp', (n + 1) / steps.length);
  }
  if ('IntersectionObserver' in window) {
    var stepIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setStep(+entry.target.getAttribute('data-step'));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { stepIo.observe(s); });
  }

  // Horizontal gallery driven by vertical scroll (desktop only)
  var gallery = document.querySelector('.gallery');
  var track = document.querySelector('.gallery-track');
  var hDistance = 0;
  function setupGallery() {
    var on = desktop.matches && !reduce;
    root.classList.toggle('hscroll', on);
    if (!on) { gallery.style.height = ''; track.style.removeProperty('--gx'); return; }
    hDistance = Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
    gallery.style.height = (hDistance + window.innerHeight) + 'px';
  }

  // Keyboard users: scroll the page so a focused gallery item slides into view.
  // The browser may also try to scroll the clipped container itself; undo that.
  var sticky = gallery.querySelector('.gallery-sticky');
  sticky.addEventListener('scroll', function () { if (sticky.scrollLeft) sticky.scrollLeft = 0; });
  track.addEventListener('focusin', function (e) {
    if (!root.classList.contains('hscroll')) return;
    sticky.scrollLeft = 0;
    var item = e.target.closest('.g-item');
    var x = clamp(item.offsetLeft + item.offsetWidth - document.documentElement.clientWidth * 0.9, 0, hDistance);
    var top = gallery.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + x, behavior: 'auto' });
  });

  // Scroll-linked effects
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  var mobileBar = document.querySelector('.mobile-bar');
  var stepsList = document.querySelector('.steps');
  var stepItems = stepsList.querySelectorAll('li');
  var lastY = window.scrollY;
  var ticking = false;

  function frame() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;
    var heroH = hero.offsetHeight;

    // Header: transparent over the hero, hides on scroll down, returns on scroll up
    header.classList.toggle('on-hero', y < heroH - 90);
    if (y <= heroH) header.classList.remove('hidden');
    if (Math.abs(y - lastY) > 6) {
      if (y > lastY && y > heroH) header.classList.add('hidden');
      else if (y < lastY) header.classList.remove('hidden');
      lastY = y;
    }
    mobileBar.classList.toggle('show', y > vh * 0.6);

    if (reduce) return;

    // Hero parallax
    if (y < heroH) {
      var p = y / heroH;
      hero.style.setProperty('--hero-scale', (1.08 + p * 0.12).toFixed(4));
      hero.style.setProperty('--hero-shift', (p * heroH * 0.25).toFixed(1) + 'px');
      hero.style.setProperty('--hero-fade', (1 - p * 1.4).toFixed(3));
      hero.style.setProperty('--hero-lift', (p * -60).toFixed(1) + 'px');
    }

    // Statement word reveal
    if (words.length) {
      var r = statement.getBoundingClientRect();
      var wp = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      var lit = Math.round(wp * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < lit);
    }

    // Gallery horizontal travel
    if (root.classList.contains('hscroll')) {
      var g = gallery.getBoundingClientRect();
      var gp = clamp(-g.top / Math.max(1, hDistance), 0, 1);
      track.style.setProperty('--gx', (-gp * hDistance).toFixed(1) + 'px');
    }

    // Process line fill
    var s = stepsList.getBoundingClientRect();
    var sp = clamp((vh * 0.85 - s.top) / Math.max(s.height, vh * 0.45), 0, 1);
    stepsList.style.setProperty('--p', sp.toFixed(3));
    stepItems.forEach(function (li, i) { li.classList.toggle('lit', sp >= (i + 0.5) / stepItems.length - 0.08); });
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { setupGallery(); onScroll(); });
  window.addEventListener('load', function () { setupGallery(); onScroll(); });
  setupGallery();
  frame();

  // Lead form
  var form = document.querySelector('.lead-form');
  var status = form.querySelector('.form-status');
  var submit = form.querySelector('button[type="submit"]');

  function check(id, test) {
    var input = document.getElementById(id);
    var ok = test(input.value.trim());
    input.closest('.field').classList.toggle('invalid', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    if (!ok) input.setAttribute('aria-describedby', id + '-err');
    else input.removeAttribute('aria-describedby');
    return ok;
  }
  var notEmpty = function (v) { return v.length > 1; };
  var reachable = function (v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || v.replace(/\D/g, '').length >= 7;
  };

  ['f-name', 'f-contact'].forEach(function (id) {
    document.getElementById(id).addEventListener('blur', function () {
      if (this.value) check(id, id === 'f-name' ? notEmpty : reachable);
    });
  });

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = 'form-status ' + kind;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var a = check('f-name', notEmpty);
    var b = check('f-contact', reachable);
    if (!a || !b) {
      form.querySelector('.invalid input').focus();
      return;
    }

    if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
      setStatus("Sorry, online booking isn't connected yet. Please call us at (719) 655-2400 and we'll set up your free call.", 'bad');
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Sending…';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        form.reset();
        setStatus("Thanks! We got your message and we'll be in touch soon to set up your free call.", 'ok');
        window.dataLayer.push({ event: 'generate_lead', form: 'free_call' });
      })
      .catch(function () {
        setStatus('Something went wrong sending your message. Please try again, or call us at (719) 655-2400.', 'bad');
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = 'Request my free call';
      });
  });
})();
