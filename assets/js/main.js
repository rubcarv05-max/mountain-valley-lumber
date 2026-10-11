(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var phone = config.phone || {};
  var hasPhone = Boolean(phone.display && phone.dial);
  var phoneText = hasPhone ? phone.display : "[PHONE NUMBER]";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Phone number + year ---------- */
  $$("[data-phone]").forEach(function (el) { el.textContent = phoneText; });
  if (hasPhone) {
    $$("[data-phone-link]").forEach(function (a) {
      a.setAttribute("href", "tel:" + phone.dial);
      if (a.hasAttribute("data-phone-cta")) a.textContent = "Call " + phone.display;
    });
  }
  var callLabel = $("[data-call-label]");
  if (callLabel) callLabel.textContent = hasPhone ? "Call" : "Call us";

  var year = $("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Header: solid bar once the page scrolls ---------- */
  var header = $("[data-header]");
  var ticking = false;
  function updateHeader() {
    header.classList.toggle("is-solid", window.scrollY > 24);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(updateHeader); ticking = true; }
  }, { passive: true });
  updateHeader();

  /* ---------- Current section in the nav ---------- */
  var navLinks = $$(".primary-nav a");
  var sections = ["top", "services", "work", "about", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if ("IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = $("[data-menu-toggle]");
  var menu = $("[data-mobile-menu]");
  var mobileBar = $("[data-mobile-bar]");

  function openMenu() {
    menu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.querySelector(".visually-hidden").textContent = "Close menu";
    document.body.style.overflow = "hidden";
    header.classList.add("is-solid");
    if (mobileBar) mobileBar.setAttribute("inert", "");
    window.requestAnimationFrame(function () {
      menu.classList.add("is-open");
      var first = menu.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    });
  }
  function closeMenu(returnFocus) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector(".visually-hidden").textContent = "Menu";
    menu.classList.remove("is-open");
    document.body.style.overflow = "";
    if (mobileBar) mobileBar.removeAttribute("inert");
    updateHeader();
    window.setTimeout(function () { if (toggle.getAttribute("aria-expanded") === "false") menu.hidden = true; }, reduceMotion ? 0 : 300);
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener("click", function () {
    if (toggle.getAttribute("aria-expanded") === "true") closeMenu(true); else openMenu();
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    if (e.key === "Escape") { closeMenu(true); return; }
    if (e.key === "Tab") {
      // Keep focus within the toggle + menu while open
      var focusables = [toggle].concat($$("a, button", menu));
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia("(min-width: 980px)").addEventListener("change", function (mq) {
    if (mq.matches && toggle.getAttribute("aria-expanded") === "true") closeMenu(false);
  });

  /* ---------- Scroll reveals (service images) ---------- */
  // Observe each reveal's parent: the reveal itself starts fully clipped, and
  // Chrome treats a clipped-away element as never intersecting.
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        $$(".reveal", entry.target).forEach(function (el) { el.classList.add("is-visible"); });
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.1 });
    reveals.forEach(function (el) { revealObserver.observe(el.parentElement); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Mobile contact bar: shown after the hero, hidden at the form ---------- */
  if (mobileBar && "IntersectionObserver" in window) {
    var heroVisible = true, contactVisible = false;
    var setBar = function () { mobileBar.classList.toggle("is-visible", !heroVisible && !contactVisible); };
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting; setBar();
    }, { threshold: 0.15 }).observe($(".hero"));
    new IntersectionObserver(function (entries) {
      contactVisible = entries[0].isIntersecting; setBar();
    }, { rootMargin: "0px 0px -20% 0px" }).observe($("#estimate-form"));
  }

  /* ---------- Service buttons preselect the project type ---------- */
  var typeSelect = $("#f-type");
  $$("[data-project]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (typeSelect) {
        typeSelect.value = btn.getAttribute("data-project");
        clearError(typeSelect);
      }
    });
  });

  /* ---------- Gallery filters ---------- */
  var gallery = $("[data-gallery]");
  var tiles = $$(".tile", gallery);
  var filters = $$("[data-filter]");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-filter");
      filters.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      tiles.forEach(function (tile) {
        var show = value === "all" || tile.getAttribute("data-category") === value;
        if (reduceMotion) { tile.hidden = !show; return; }
        if (show && tile.hidden) {
          tile.classList.add("is-hiding");
          tile.hidden = false;
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () { tile.classList.remove("is-hiding"); });
          });
        } else if (!show && !tile.hidden) {
          tile.classList.add("is-hiding");
          window.setTimeout(function () {
            if (tile.classList.contains("is-hiding")) { tile.hidden = true; tile.classList.remove("is-hiding"); }
          }, 280);
        } else if (show) {
          tile.classList.remove("is-hiding");
        }
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = $("[data-lightbox]");
  var lbImg = $("[data-lightbox-img]");
  var lbCaption = $("[data-lightbox-caption]");
  var lbIndex = 0;
  var lbReturn = null;

  function visibleTiles() { return tiles.filter(function (t) { return !t.hidden && !t.classList.contains("is-hiding"); }); }

  function showTile(index) {
    var list = visibleTiles();
    if (!list.length) return;
    lbIndex = (index + list.length) % list.length;
    var btn = list[lbIndex].querySelector(".tile-btn");
    var thumb = btn.querySelector("img");
    var title = btn.querySelector(".tile-caption strong").textContent;
    var note = btn.querySelector(".tile-caption span").textContent;
    lbImg.src = btn.getAttribute("data-full");
    lbImg.alt = thumb.alt;
    lbCaption.innerHTML = "";
    var strong = document.createElement("strong");
    strong.textContent = title;
    lbCaption.appendChild(strong);
    lbCaption.appendChild(document.createTextNode(note + " (" + (lbIndex + 1) + " of " + list.length + ")"));
  }

  if (lightbox && typeof lightbox.showModal === "function") {
    gallery.addEventListener("click", function (e) {
      var btn = e.target.closest(".tile-btn");
      if (!btn) return;
      lbReturn = btn;
      showTile(visibleTiles().indexOf(btn.closest(".tile")));
      lightbox.showModal();
      document.body.style.overflow = "hidden";
    });
    lightbox.addEventListener("close", function () {
      document.body.style.overflow = "";
      if (lbReturn) lbReturn.focus();
    });
    $("[data-lb-close]").addEventListener("click", function () { lightbox.close(); });
    $("[data-lb-prev]").addEventListener("click", function () { showTile(lbIndex - 1); });
    $("[data-lb-next]").addEventListener("click", function () { showTile(lbIndex + 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) lightbox.close(); // click on the dark backdrop area
    });
    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); showTile(lbIndex - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); showTile(lbIndex + 1); }
    });
    var touchX = null;
    lightbox.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) showTile(lbIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  } else {
    // Very old browsers: open the full image directly
    gallery.addEventListener("click", function (e) {
      var btn = e.target.closest(".tile-btn");
      if (btn) window.open(btn.getAttribute("data-full"), "_blank", "noopener");
    });
  }

  /* ---------- Estimate form ---------- */
  var form = $("[data-estimate-form]");
  var statusBox = $("[data-form-status]");
  var submitBtn = $("[data-submit]");
  var formConfig = config.form || {};

  var messages = {
    "f-name": { valueMissing: "Enter your full name." },
    "f-email": { valueMissing: "Enter your email address.", typeMismatch: "Enter an email address like name@example.com." },
    "f-type": { valueMissing: "Choose a project type." },
    "f-message": { valueMissing: "Tell us a little about your project." }
  };

  function errorEl(field) { return $('[data-error-for="' + field.id + '"]'); }
  function clearError(field) {
    field.removeAttribute("aria-invalid");
    var el = errorEl(field);
    if (el) el.textContent = "";
  }
  function validateField(field) {
    var rules = messages[field.id];
    if (!rules) return true;
    if (field.type === "email") field.value = field.value.trim();
    var v = field.validity;
    var msg = "";
    if (v.valueMissing || (field.required && !field.value.trim())) msg = rules.valueMissing;
    else if (v.typeMismatch) msg = rules.typeMismatch;
    var el = errorEl(field);
    if (msg) { field.setAttribute("aria-invalid", "true"); if (el) el.textContent = msg; return false; }
    clearError(field);
    return true;
  }

  function setStatus(kind, title, body) {
    statusBox.className = "form-status is-" + kind;
    statusBox.innerHTML = "";
    var strong = document.createElement("strong");
    strong.textContent = title;
    statusBox.appendChild(strong);
    if (body) statusBox.appendChild(body);
  }
  function callNode(prefix) {
    var span = document.createElement("span");
    span.appendChild(document.createTextNode(prefix));
    if (hasPhone) {
      var a = document.createElement("a");
      a.href = "tel:" + phone.dial;
      a.textContent = phone.display;
      span.appendChild(a);
    } else {
      span.appendChild(document.createTextNode(phoneText));
    }
    span.appendChild(document.createTextNode("."));
    return span;
  }

  $$("input, select, textarea", form).forEach(function (field) {
    field.addEventListener("blur", function () { if (field.hasAttribute("aria-invalid") || field.value) validateField(field); });
    field.addEventListener("input", function () { if (field.hasAttribute("aria-invalid")) validateField(field); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fields = $$("#f-name, #f-email, #f-type, #f-message", form);
    var firstInvalid = null;
    fields.forEach(function (f) { if (!validateField(f) && !firstInvalid) firstInvalid = f; });
    if (firstInvalid) {
      setStatus("error", "Check the highlighted fields.", null);
      firstInvalid.focus();
      return;
    }

    // Spam trap filled in: stop quietly without claiming anything was sent.
    if ($("#f-company").value) { statusBox.className = "form-status"; statusBox.innerHTML = ""; return; }

    if (!formConfig.endpoint) {
      setStatus("notice", "Online requests aren't connected yet.",
        callNode("Your message has not been sent. Please call Mountain Valley Lumber at "));
      return;
    }

    var data = new FormData(form);
    data.delete("_gotcha");
    Object.keys(formConfig.extraFields || {}).forEach(function (k) { data.append(k, formConfig.extraFields[k]); });
    data.append("_subject", "Estimate request: " + data.get("project_type") + " from " + data.get("name"));

    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");
    submitBtn.querySelector(".btn-label").textContent = "Sending";
    statusBox.className = "form-status";
    statusBox.innerHTML = "";

    fetch(formConfig.endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        var name = String(data.get("name")).split(" ")[0];
        form.reset();
        setStatus("success", "Request sent.",
          document.createTextNode("Thanks, " + name + ". We received your request and will get back to you soon."));
        statusBox.setAttribute("tabindex", "-1");
        statusBox.focus();
      })
      .catch(function () {
        setStatus("error", "Your request didn't go through.",
          callNode("Nothing was sent. Check your connection and try again, or call us at "));
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
        submitBtn.querySelector(".btn-label").textContent = "Send request";
      });
  });
})();
