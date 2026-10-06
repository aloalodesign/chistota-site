/* Чистота в деталях — interactivity */
(function () {
  "use strict";

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    item.addEventListener("click", function () {
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(function (i) {
        i.classList.remove("open");
        i.querySelector(".faq-tog").textContent = "+";
      });
      if (!open) {
        item.classList.add("open");
        item.querySelector(".faq-tog").textContent = "−";
      }
    });
  });

  /* ---- generic carousel (refs + reviews) ---- */
  function carousel(trackSel, prevSel, nextSel, dotsSel) {
    var track = document.querySelector(trackSel);
    if (!track) return;
    var prev = document.querySelector(prevSel);
    var next = document.querySelector(nextSel);
    var wrap = track.parentElement;
    var index = 0;

    function step() {
      var first = track.children[0];
      if (!first) return 400;
      var gap = parseFloat(getComputedStyle(track).gap) || 24;
      return first.getBoundingClientRect().width + gap;
    }
    function visible() {
      return Math.max(1, Math.floor(wrap.clientWidth / step()));
    }
    function maxIndex() {
      return Math.max(0, track.children.length - visible());
    }
    function apply() {
      index = Math.min(index, maxIndex());
      track.style.transform = "translateX(" + -index * step() + "px)";
      if (dotsSel) {
        var dots = document.querySelectorAll(dotsSel + " .dot");
        dots.forEach(function (d, i) {
          d.classList.toggle("on", i === Math.min(index, dots.length - 1));
        });
      }
    }
    if (prev) prev.addEventListener("click", function () { index = Math.max(0, index - 1); apply(); });
    if (next) next.addEventListener("click", function () { index = Math.min(maxIndex(), index + 1); apply(); });
    window.addEventListener("resize", apply);
    apply();
  }
  carousel("[data-refs-track]", "[data-refs-prev]", "[data-refs-next]", ".refs .dots");
  carousel("[data-rev-track]", "[data-rev-prev]", "[data-rev-next]", ".reviews .dots");

  /* ---- order form calculator ---- */
  var range = document.querySelector("[data-area-range]");
  var areaOut = document.querySelector("[data-area]");
  var estOut = document.querySelector("[data-estimate]");
  var estSub = document.querySelector("[data-estimate-sub]");
  function rub(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function calc() {
    if (!range) return;
    var a = parseInt(range.value, 10);
    var price = Math.round((a * 95 + 1300) / 100) * 100;
    areaOut.textContent = a + " м²";
    estOut.textContent = "от " + rub(price) + " ₽";
    estSub.textContent = "Генеральная уборка, " + a + " м²";
    var pct = ((a - range.min) / (range.max - range.min)) * 100;
    range.style.background =
      "linear-gradient(90deg,#E5537E 0%,#E5537E " + pct + "%,#ffffff " + pct + "%,#ffffff 100%)";
  }
  if (range) { range.addEventListener("input", calc); calc(); }

  /* ---- mobile burger (added in mobile pass) ---- */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      document.querySelector(".nav") &&
        document.querySelector(".nav").classList.toggle("open");
    });
  }
})();
