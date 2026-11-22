/**
 * Cascade Biofuels - professional enhancements
 * Scroll progress bar, scroll-to-top progress ring, 3D cards & logo,
 * Adds UI only - no page content is changed.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  root.removeAttribute("data-theme");
  try { localStorage.removeItem("cbpl-theme"); } catch (e) { /* ignore */ }

  /* ---------- Always open at the top ----------
   * Runs immediately (before the page "load" event, where main.js would
   * jump to a #section in the URL).
   * - Refresh / reopen / bookmark / typed URL  -> start at the top
   * - Link from another page of this site (e.g. Contact from a service
   *   page) -> still goes to that section                              */
  (function startAtTop() {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    var navType = "navigate";
    try {
      var nav = performance.getEntriesByType("navigation")[0];
      if (nav && nav.type) navType = nav.type;
    } catch (e) { /* ignore */ }
    var fromOwnSite = false;
    try { fromOwnSite = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) { /* ignore */ }
    var keepHash = location.hash && navType === "navigate" && fromOwnSite;
    if (!keepHash) {
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
      window.scrollTo(0, 0);
      window.addEventListener("load", function () { window.scrollTo(0, 0); });
    }
  })();

  /* ---------- In-page menu links: smooth scroll, keep URL clean ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var hash = a.getAttribute("href");
    if (hash.length < 2) return;                 // "#" (back-to-top) is handled by main.js
    var target = document.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" }); // respects scroll-margin-top
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  });

  /* ---------- Scroll progress bar ---------- */
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");

  /* ---------- Scroll-top progress ring ---------- */
  var RADIUS = 23;
  var CIRC = 2 * Math.PI * RADIUS;
  var ringBar = null;

  function initScrollTopRing() {
    var btn = document.querySelector(".scroll-top");
    if (!btn) return;
    btn.setAttribute("aria-label", "Back to top");
    btn.insertAdjacentHTML("afterbegin",
      '<svg class="progress-ring" viewBox="0 0 52 52" aria-hidden="true">' +
        '<defs><linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#1e88e5"/><stop offset="100%" stop-color="#3fa34d"/>' +
        "</linearGradient></defs>" +
        '<circle class="track" cx="26" cy="26" r="' + RADIUS + '"/>' +
        '<circle class="bar" cx="26" cy="26" r="' + RADIUS + '"/>' +
      "</svg>");
    ringBar = btn.querySelector(".progress-ring .bar");
    ringBar.style.strokeDasharray = CIRC;
    ringBar.style.strokeDashoffset = CIRC;
  }

  /* ---------- Team: initials avatar when a photo is missing ---------- */
  function initTeamAvatars() {
    document.querySelectorAll(".team .member").forEach(function (m) {
      var img = m.querySelector(".pic img");
      var nameEl = m.querySelector("h4");
      if (!img || !nameEl) return;
      function swap() {
        var parts = nameEl.textContent.trim().split(/\s+/);
        var initials = (parts[0].charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : "")).toUpperCase();
        var av = document.createElement("div");
        av.className = "avatar";
        av.setAttribute("aria-hidden", "true");
        av.textContent = initials;
        img.replaceWith(av);
      }
      var src = img.getAttribute("src");
      if (!src || src === "#") { swap(); return; }
      if (img.complete && img.naturalWidth === 0) { swap(); return; }
      img.addEventListener("error", swap);
    });
  }

  /* ---------- 3D depth effects ---------- */
  var canHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var allow3D = canHover && !reduceMotion;

  var TILT_SELECTOR = [
    ".services .service-item",
    ".service-switcher",
    ".service-details .services-list",
    ".service-details .services-img",
    ".service-details .col-lg-4 > img",
    "#about .content ul",
    "#about img",
    "#future-outlook img"
  ].join(",");

  function initTilt() {
    if (!allow3D) return;
    document.querySelectorAll(TILT_SELECTOR).forEach(function (el) {
      var target = el;
      // images can't hold the glare layer - wrap them
      if (el.tagName === "IMG") {
        var wrap = document.createElement("div");
        wrap.className = "tilt-wrap";
        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(el);
        target = wrap;
      }
      target.classList.add("tilt-3d");
      var glare = document.createElement("span");
      glare.className = "tilt-glare";
      glare.setAttribute("aria-hidden", "true");
      target.appendChild(glare);

      var max = target.classList.contains("tilt-wrap") ? 6 : 8; // degrees
      var raf = null;
      target.addEventListener("mousemove", function (e) {
        var r = target.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;   // 0..1
        var y = (e.clientY - r.top) / r.height;   // 0..1
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          target.style.transform =
            "perspective(1000px) rotateX(" + ((0.5 - y) * max).toFixed(2) + "deg) rotateY(" +
            ((x - 0.5) * max).toFixed(2) + "deg) translateY(-6px) scale(1.015)";
          glare.style.background =
            "radial-gradient(circle at " + (x * 100) + "% " + (y * 100) +
            "%, rgba(255,255,255,.35), rgba(255,255,255,0) 55%)";
          glare.style.opacity = "1";
        });
      });
      target.addEventListener("mouseleave", function () {
        if (raf) cancelAnimationFrame(raf);
        target.style.transform = "";
        glare.style.opacity = "0";
      });
    });
  }

  /* ---------- 3D logo ---------- */
  function make3DLogo(img, extraClass) {
    if (!img || img.closest(".logo-3d")) return;
    var wrap = document.createElement("span");
    wrap.className = "logo-3d" + (extraClass ? " " + extraClass : "");
    // shine is masked to the logo's own shape, so the logo itself is untouched
    wrap.style.setProperty("--logo-mask", 'url("' + img.getAttribute("src").replace(/\\/g, "/") + '")');
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
    var shine = document.createElement("span");
    shine.className = "logo-shine";
    shine.setAttribute("aria-hidden", "true");
    wrap.appendChild(shine);

    if (!allow3D) return;
    var host = wrap.closest("a") || wrap;
    host.addEventListener("mousemove", function (e) {
      var r = wrap.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      wrap.style.setProperty("--logo-ry", (x * 26).toFixed(1) + "deg");
      wrap.style.setProperty("--logo-rx", (y * -18).toFixed(1) + "deg");
    });
    host.addEventListener("mouseleave", function () {
      wrap.style.setProperty("--logo-ry", "0deg");
      wrap.style.setProperty("--logo-rx", "0deg");
    });
  }

  function initLogos() {
    // header logo on every page
    make3DLogo(document.querySelector("#header .logo img"), "logo-header");

    // inner-page banners: show the emblem as a floating 3D badge
    document.querySelectorAll(".page-title").forEach(function (pt) {
      var holder = pt.querySelector(".container");
      if (!holder || pt.querySelector(".page-emblem")) return;
      if (/loggo\.png/.test(pt.getAttribute("style") || "")) pt.style.backgroundImage = "none";
      var emblem = document.createElement("div");
      emblem.className = "page-emblem";
      var img = document.createElement("img");
      img.src = "assets/img/loggo.png";
      img.alt = "";
      emblem.appendChild(img);
      holder.insertBefore(emblem, holder.firstChild);
      make3DLogo(img, "logo-emblem");
    });
  }

  /* ---------- Staggered reveal for list items + section "in view" ---------- */
  function initReveals() {
    var items = document.querySelectorAll(
      "#why-partner ul li, #future-outlook ul li, .service-details ul li, " +
      ".footer .footer-contact ul li, .service-switcher a, .service-details .services-list a"
    );
    var sections = document.querySelectorAll("section, .page-title, .footer");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      sections.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    // index items within their own list for the stagger delay
    items.forEach(function (el) {
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty("--reveal-delay", (idx * 90) + "ms");
      el.classList.add("reveal-item");
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add(en.target.classList.contains("reveal-item") ? "is-visible" : "in-view");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
    sections.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Bento grid: "Why Partner with Us?" ---------- */
  function initBento() {
    var list = document.querySelector("#why-partner ul");
    if (!list) return;
    var icons = ["bi-globe-americas", "bi-graph-down-arrow", "bi-shield-check", "bi-lightning-charge", "bi-award"];
    list.classList.add("bento");
    list.querySelectorAll(":scope > li").forEach(function (li, i) {
      li.classList.add("bento-tile", "bento-" + (i + 1));
      var title = li.querySelector("b");
      if (!title) return;
      // dot bullet is replaced by an icon
      var dot = li.querySelector(":scope > span:first-child");
      if (dot) dot.classList.add("bento-dot");
      // put everything after the title into a description paragraph
      var desc = document.createElement("p");
      desc.className = "bento-desc";
      while (title.nextSibling) desc.appendChild(title.nextSibling);
      if (desc.firstChild && desc.firstChild.nodeType === 3) {
        desc.firstChild.textContent = desc.firstChild.textContent.replace(/^\s*[–-]\s*/, "");
      }
      title.classList.add("bento-title");
      var icon = document.createElement("span");
      icon.className = "bento-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = '<i class="bi ' + (icons[i] || "bi-check2-circle") + '"></i>';
      li.insertBefore(icon, title);
      li.appendChild(desc);

      // soft spotlight that follows the cursor
      if (allow3D) {
        li.addEventListener("mousemove", function (e) {
          var r = li.getBoundingClientRect();
          li.style.setProperty("--spot-x", (e.clientX - r.left) + "px");
          li.style.setProperty("--spot-y", (e.clientY - r.top) + "px");
        });
      }
    });
  }

  /* ---------- Phone field with country flags (intl-tel-input) ---------- */
  function initPhoneField() {
    var input = document.querySelector("#contact-phone");
    if (!input || typeof window.intlTelInput !== "function") return;
    var iti = window.intlTelInput(input, {
      initialCountry: "in",
      preferredCountries: ["in", "ae", "sa", "qa", "om", "kw", "bh", "us", "gb"],
      separateDialCode: true,
      autoPlaceholder: "off",          // keep our own "Phone Number" placeholder
      utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js"
    });
    return iti;
  }

  /* ---------- Enquiry form validation ----------
   * Clear inline messages under each field, checked when the visitor
   * leaves a field and again on submit. Invalid forms are never sent.  */
  function initFormValidation(iti) {
    var form = document.querySelector("#enquiry .php-email-form");
    if (!form) return;
    form.noValidate = true;   // we show our own messages instead of browser pop-ups

    var NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ.' -]+$/;
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
    var PLACE_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9.,' ()-]+$/;
    var BLOCKED_EMAIL_DOMAINS = /@(example\.com|test\.com|mailinator\.com)$/i;

    var rules = {
      name: function (v) {
        if (!v) return "Please enter your name.";
        if (v.length < 2) return "Name must be at least 2 characters.";
        if (v.length > 60) return "Name must be 60 characters or fewer.";
        if (!NAME_RE.test(v)) return "Name can contain letters, spaces, dots and hyphens only.";
        return "";
      },
      email: function (v) {
        if (!v) return "Please enter your email address.";
        if (v.length > 100 || !EMAIL_RE.test(v)) return "Please enter a valid email address, e.g. name@company.com.";
        if (BLOCKED_EMAIL_DOMAINS.test(v)) return "Please use your real email address.";
        return "";
      },
      phone: function (v) {
        if (!v) return "Please enter your phone number.";
        if (!/^[0-9\s()-]+$/.test(v)) return "Phone number can contain digits only.";
        if (iti && typeof iti.isValidNumber === "function" && window.intlTelInputUtils) {
          if (!iti.isValidNumber()) {
            var c = iti.getSelectedCountryData();
            return "Please enter a valid " + (c && c.name ? c.name.replace(/\s*\(.*\)$/, "") + " " : "") + "phone number.";
          }
        } else {
          var digits = v.replace(/\D/g, "");
          if (digits.length < 6 || digits.length > 15) return "Please enter a valid phone number.";
        }
        return "";
      },
      company: function (v) {
        if (v.length > 100) return "Company name must be 100 characters or fewer.";
        return "";
      },
      location: function (v) {
        if (!v) return "";
        if (v.length < 2) return "Please enter a valid city or location.";
        if (v.length > 80) return "Location must be 80 characters or fewer.";
        if (!PLACE_RE.test(v)) return "Location contains characters that aren't allowed.";
        return "";
      },
      subject: function (v) {
        if (!v) return "Please enter a subject.";
        if (v.length < 3) return "Subject must be at least 3 characters.";
        if (v.length > 120) return "Subject must be 120 characters or fewer.";
        return "";
      },
      message: function (v) {
        if (!v) return "Please enter your message.";
        if (v.length < 10) return "Please write a little more (at least 10 characters).";
        if (v.length > 1000) return "Message must be 1000 characters or fewer.";
        return "";
      },
      consent: function (v, el) {
        return el.checked ? "" : "Please tick the box so we can contact you about your enquiry.";
      }
    };

    // error holder under each field
    function errorBox(el) {
      var id = "err-" + el.name;
      var box = document.getElementById(id);
      if (!box) {
        box = document.createElement("div");
        box.className = "field-error";
        box.id = id;
        box.setAttribute("role", "alert");
        var anchor = el.closest(".iti") || el.closest(".form-consent") || el;
        anchor.insertAdjacentElement("afterend", box);
        el.setAttribute("aria-describedby", id);
      }
      return box;
    }

    function validate(el) {
      var rule = rules[el.name];
      if (!rule) return true;
      if (el.type !== "checkbox") {
        var trimmed = el.value.replace(/\s+/g, " ").trim();
        if (el.tagName !== "TEXTAREA" && el.value !== trimmed) el.value = trimmed;
      }
      var msg = rule(el.type === "checkbox" ? "" : el.value.trim(), el);
      var box = errorBox(el);
      box.textContent = msg;
      box.classList.toggle("show", !!msg);
      el.classList.toggle("is-invalid", !!msg);
      el.classList.toggle("is-valid", !msg && (el.type === "checkbox" ? el.checked : el.value.trim() !== ""));
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }

    var fields = Array.prototype.filter.call(form.elements, function (el) { return rules[el.name]; });

    fields.forEach(function (el) {
      // gentle: check when leaving a field; re-check live once an error is showing
      el.addEventListener("blur", function () { if (el.value || el.dataset.touched) validate(el); el.dataset.touched = "1"; });
      el.addEventListener(el.type === "checkbox" ? "change" : "input", function () {
        if (el.classList.contains("is-invalid") || el.type === "checkbox") validate(el);
      });
    });
    var phone = form.querySelector("#contact-phone");
    if (phone) phone.addEventListener("countrychange", function () { if (phone.value) validate(phone); });

    // message character counter
    var msgEl = form.querySelector('textarea[name="message"]');
    if (msgEl) {
      msgEl.setAttribute("maxlength", "1000");
      var counter = document.createElement("div");
      counter.className = "char-counter";
      msgEl.insertAdjacentElement("afterend", counter);
      var updateCount = function () {
        var n = msgEl.value.length;
        counter.textContent = n + " / 1000";
        counter.classList.toggle("near", n > 900);
      };
      msgEl.addEventListener("input", updateCount);
      updateCount();
    }

    // capture phase: runs before the template's submit handler (validate.js)
    form.addEventListener("submit", function (e) {
      // spam trap: real visitors never see or fill this field
      var trap = form.querySelector('input[name="website"]');
      if (trap && trap.value) { e.preventDefault(); e.stopImmediatePropagation(); return; }

      var firstBad = null;
      fields.forEach(function (el) { if (!validate(el) && !firstBad) firstBad = el; });

      var full = form.querySelector("#contact-phone-full");
      if (full && iti) full.value = iti.getNumber() || "";

      if (firstBad) {
        e.preventDefault();
        e.stopImmediatePropagation();
        firstBad.focus({ preventScroll: true });
        firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, true);

    // after a successful send, clear the green ticks
    form.addEventListener("reset", function () {
      fields.forEach(function (el) {
        el.classList.remove("is-valid", "is-invalid");
        delete el.dataset.touched;
        var b = document.getElementById("err-" + el.name);
        if (b) { b.textContent = ""; b.classList.remove("show"); }
      });
      if (msgEl) setTimeout(function () { msgEl.dispatchEvent(new Event("input")); }, 0);
    });
  }

  /* ---------- Scroll handler ---------- */
  var ticking = false;
  function update() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    bar.style.transform = "scaleX(" + p + ")";
    if (ringBar) ringBar.style.strokeDashoffset = CIRC * (1 - p);
    ticking = false;
  }
  function onScroll() {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }

  /* ---------- Init ---------- */
  function init() {
    // Show the page as soon as the HTML is ready - don't wait for every image
    var preloader = document.querySelector("#preloader");
    if (preloader) preloader.remove();
    document.body.appendChild(bar);
    initScrollTopRing();
    initTeamAvatars();
    initBento();
    initTilt();
    initLogos();
    initFormValidation(initPhoneField());
    initReveals();
    update();
    document.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
