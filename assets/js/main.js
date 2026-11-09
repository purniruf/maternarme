/* Maternar(me) · interacciones lentas y ligeras */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Año del footer */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* Header al hacer scroll */
  var header = document.getElementById("header");
  function onScrollHeader() { header.classList.toggle("is-scrolled", window.scrollY > 24); }
  onScrollHeader();

  /* Menú móvil */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* Revelado al hacer scroll */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Sección activa en el menú */
  var links = Array.prototype.slice.call(nav.querySelectorAll("a:not(.btn)"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a, i) { a.classList.toggle("is-active", sections[i] === en.target); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) so.observe(s); });
  }

  /* Parallax suave */
  var px = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;
  function parallax() {
    var vh = window.innerHeight;
    px.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0;
      var offset = (r.top + r.height / 2 - vh / 2) * speed;
      var base = el.classList.contains("hero__giant") ? "translateX(-50%) " : "";
      el.style.transform = base + "translate3d(0," + offset.toFixed(1) + "px,0)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    onScrollHeader();
    if (!reduce && px.length && !ticking) { ticking = true; requestAnimationFrame(parallax); }
  }, { passive: true });
  if (!reduce) parallax();

  /* Pausa de respiración (4s inhala · 6s exhala · 6 ciclos ≈ 1 min) */
  var btn = document.getElementById("breathBtn");
  var circle = document.getElementById("breathCircle");
  var label = document.getElementById("breathLabel");
  var status = document.getElementById("breathStatus");
  var timer = null, cycles = 0, running = false;
  function stopBreath(done) {
    clearTimeout(timer); running = false; cycles = 0;
    circle.classList.remove("is-in", "is-out");
    label.textContent = done ? "Gracias" : "Lista";
    btn.textContent = done ? "Repetir pausa" : "Comenzar pausa";
    btn.setAttribute("aria-pressed", "false");
    if (done) status.textContent = "Pausa terminada. Gracias por regalarte este minuto.";
  }
  function inhale() {
    if (!running) return;
    if (cycles >= 6) { stopBreath(true); return; }
    cycles++;
    circle.classList.remove("is-out"); circle.classList.add("is-in");
    label.textContent = "Inhala"; status.textContent = "Inhala";
    timer = setTimeout(exhale, 4000);
  }
  function exhale() {
    if (!running) return;
    circle.classList.remove("is-in"); circle.classList.add("is-out");
    label.textContent = "Exhala"; status.textContent = "Exhala";
    timer = setTimeout(inhale, 6000);
  }
  if (btn) btn.addEventListener("click", function () {
    if (running) { stopBreath(false); return; }
    running = true; cycles = 0;
    btn.textContent = "Detener"; btn.setAttribute("aria-pressed", "true");
    inhale();
  });
})();
