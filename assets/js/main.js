/* Maternar(me) · interacciones lentas y ligeras */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = false; // la marca pidió animaciones visibles siempre
  var soft = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.5 : 1;

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
  if (!("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    function show(el) {
      el.classList.add("is-in");
      // al terminar, se liberan las clases para que el hover funcione normal
      var d = parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0;
      setTimeout(function () {
        Array.prototype.slice.call(el.classList).forEach(function (c) {
          if (c === "is-in" || c.indexOf("reveal") === 0) el.classList.remove(c);
        });
      }, 2400 + d * 1000);
    }
    // Los elementos con máscara (clip-path) se activan observando a su contenedor
    var targets = new Map();
    reveals.forEach(function (el) {
      var masked = el.classList.contains("reveal--title") || el.classList.contains("reveal--mask");
      var t = masked ? el.parentElement : el;
      if (!targets.has(t)) targets.set(t, []);
      targets.get(t).push(el);
    });
    function reveal(t) {
      if (!targets.has(t)) return;
      targets.get(t).forEach(function (el) { if (!el.classList.contains("is-in")) show(el); });
      targets.delete(t);
      if (io) io.unobserve(t);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) reveal(en.target); });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (_, t) { io.observe(t); });
    // Respaldo por posición (navegadores o vistas donde el observer no dispara)
    window.checkReveals = function () {
      var vh = window.innerHeight;
      targets.forEach(function (_, t) {
        var r = t.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) reveal(t);
      });
    };
    window.addEventListener("load", window.checkReveals);
    setTimeout(window.checkReveals, 300);
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
      var offset = (r.top + r.height / 2 - vh / 2) * speed * soft;
      el.style.translate = "0 " + offset.toFixed(1) + "px";
    });
    ticking = false;
  }
  /* Barra de progreso, header que se oculta y cinta que reacciona al scroll */
  var progress = document.getElementById("progress");
  var track = document.querySelector(".marquee__track");
  var lastY = window.scrollY, shift = 0;
  function onScrollFx() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    var down = y > lastY;
    header.classList.toggle("is-hidden", down && y > 400 && !nav.classList.contains("is-open"));
    if (track && !reduce) { shift += (y - lastY) * 0.25; track.style.translate = (-shift % 400).toFixed(1) + "px 0"; }
    lastY = y;
  }
  window.addEventListener("scroll", function () {
    onScrollHeader();
    onScrollFx();
    if (window.checkReveals) window.checkReveals();
    if (!reduce && px.length && !ticking) { ticking = true; requestAnimationFrame(parallax); }
  }, { passive: true });
  if (!reduce) parallax();

})();
