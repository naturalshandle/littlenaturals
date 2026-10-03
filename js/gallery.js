/* ==========================================================================
   Little Naturals — gallery.js  (our-salon.html)
   Keyboard-accessible lightbox: arrow keys, Esc, swipe on touch.
   Uses the native <dialog> element for focus handling.
   ========================================================================== */
(function () {
  "use strict";

  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery__btn"));
  var box = document.getElementById("lightbox");
  if (!items.length || !box || typeof box.showModal !== "function") return;

  var img = box.querySelector(".lightbox__stage img");
  var cap = box.querySelector(".lightbox__caption strong");
  var count = box.querySelector(".lightbox__count");
  var stage = box.querySelector(".lightbox__stage");
  var index = 0;
  var opener = null;

  function show(i) {
    index = (i + items.length) % items.length;
    var btn = items[index];
    var thumb = btn.querySelector("img");
    img.src = btn.getAttribute("data-full");
    img.alt = thumb.alt;
    img.width = parseInt(btn.getAttribute("data-w"), 10);
    img.height = parseInt(btn.getAttribute("data-h"), 10);
    cap.textContent = btn.getAttribute("data-label");
    count.textContent = (index + 1) + " / " + items.length;
    // warm the next image
    var next = items[(index + 1) % items.length];
    (new Image()).src = next.getAttribute("data-full");
  }

  items.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      opener = btn;
      show(i);
      box.showModal();
      document.documentElement.style.overflow = "hidden";
    });
  });

  box.querySelector(".lightbox__prev").addEventListener("click", function () { show(index - 1); });
  box.querySelector(".lightbox__next").addEventListener("click", function () { show(index + 1); });
  box.querySelector(".lightbox__close").addEventListener("click", function () { box.close(); });
  box.addEventListener("close", function () {
    document.documentElement.style.overflow = "";
    if (opener) opener.focus();
  });
  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
  });
  // click on the dark area (not the image or controls) closes
  stage.addEventListener("click", function (e) {
    if (swiped) { swiped = false; return; }
    if (e.target === stage) box.close();
  });

  // swipe
  var startX = null, startY = null, swiped = false;
  stage.addEventListener("pointerdown", function (e) { startX = e.clientX; startY = e.clientY; });
  stage.addEventListener("pointerup", function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { swiped = true; show(index + (dx < 0 ? 1 : -1)); }
    startX = null;
  });
})();
