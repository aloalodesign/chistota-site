/* ===== Popup: заявка, формы, ссылки ===== */
(function () {
  "use strict";

  /* ПОДКЛЮЧЕНИЕ ОТПРАВКИ: вставьте сюда URL формы (Formspree, sheets.google и т.п.)
     Пример: var FORM_ENDPOINT = "https://formspree.io/f/xxxxxxx";
     Пока пусто — форма работает в демо-режиме (показывает успех, ничего не шлёт). */
  var FORM_ENDPOINT = "";

  var PHONE = "+79099035586";

  var SERVICES = [
    "Генеральная уборка квартиры",
    "Уборка после ремонта",
    "Хоумстейджинг",
    "Клининг автодомов и яхт",
    "Переезд под ключ",
    "Поддерживающая уборка",
    "Уборка детской комнаты",
    "Организация порядка и хранения",
    "Зооклининг",
    "Инклюзивная уборка",
    "Другое"
  ];

  var PAGE_SERVICE = {
    "generalnaya.html": 0,
    "posle-remonta.html": 1,
    "homestaging.html": 2,
    "avtodoma-i-yahty.html": 3,
    "pereezd-pod-klyuch.html": 4,
    "podderzhivayushchaya.html": 5,
    "uborka-detskoy.html": 6,
    "organizaciya-hraneniya.html": 7,
    "zooklining.html": 8,
    "inklyuzivnaya.html": 9
  };

  var page = (location.pathname.split("/").pop() || "index.html").split("?")[0];

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------- build popup DOM ---------- */
  var overlay = document.createElement("div");
  overlay.className = "pp-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  var opts = '<option value="">— выберите услугу —</option>';
  for (var i = 0; i < SERVICES.length; i++) {
    opts += '<option value="' + esc(SERVICES[i]) + '">' + esc(SERVICES[i]) + "</option>";
  }

  overlay.innerHTML =
    '<div class="pp-card">' +
      '<button class="pp-close" aria-label="Закрыть">&times;</button>' +
      '<div class="pp-view pp-view-form">' +
        '<h2 class="pp-title">Оставить заявку</h2>' +
        '<p class="pp-sub">Перезвоним в течение 15 минут и рассчитаем стоимость по вашему объекту.</p>' +
        '<form class="pp-form" novalidate>' +
          '<div class="pp-row2">' +
            '<div><label class="lbl" for="pp-name">Ваше имя</label>' +
              '<input class="inp" id="pp-name" type="text" name="name" placeholder="Имя" autocomplete="name"></div>' +
            '<div><label class="lbl" for="pp-phone">Телефон</label>' +
              '<input class="inp" id="pp-phone" type="tel" name="phone" placeholder="+7 (___) ___-__-__" autocomplete="tel">' +
              '<div class="pp-err-msg">Укажите имя и телефон</div></div>' +
          '</div>' +
          '<div class="pp-row"><label class="lbl" for="pp-service">Услуга</label>' +
            '<select id="pp-service" name="service">' + opts + "</select></div>" +
          '<div class="pp-row"><label class="lbl" for="pp-comment">Комментарий</label>' +
            '<textarea id="pp-comment" name="comment" placeholder="Площадь, этаж, особые пожелания..."></textarea></div>' +
          '<label class="pp-consent">' +
            '<input type="checkbox" id="pp-ok">' +
            "<span>Я согласен на обработку персональных данных и принимаю " +
            '<a href="soglasie.html" target="_blank" rel="noopener">Согласие на обработку персональных данных</a>, ' +
            'ознакомился с <a href="politika.html" target="_blank" rel="noopener">Политикой обработки персональных данных</a>.</span>' +
          "</label>" +
          '<button type="submit" class="pp-submit">Отправить заявку</button>' +
          '<p class="pp-note">Или позвоните: <a href="tel:' + PHONE + '">' + "+7 909 903 55 86" + "</a></p>" +
        "</form>" +
      "</div>" +
      '<div class="pp-view pp-view-ok" style="display:none">' +
        '<div class="pp-success">' +
          '<div class="ok-ic">&#10003;</div>' +
          "<h3>Заявка принята!</h3>" +
          "<p>Перезвоним в течение 15 минут в рабочее время.</p>" +
          '<button class="pp-submit pp-ok-close" type="button">Хорошо</button>' +
        "</div>" +
      "</div>" +
    "</div>";
  document.body.appendChild(overlay);

  var viewForm = overlay.querySelector(".pp-view-form");
  var viewOk = overlay.querySelector(".pp-view-ok");
  var form = overlay.querySelector(".pp-form");
  var select = overlay.querySelector("#pp-service");
  var consent = overlay.querySelector(".pp-consent");
  var consentBox = overlay.querySelector("#pp-ok");

  function openPopup(serviceHint) {
    viewForm.style.display = "";
    viewOk.style.display = "none";
    form.reset();
    clearErrors();
    var preset = "";
    if (typeof serviceHint === "number" && SERVICES[serviceHint]) preset = SERVICES[serviceHint];
    else if (PAGE_SERVICE[page] !== undefined) preset = SERVICES[PAGE_SERVICE[page]];
    select.value = preset;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(function () { overlay.querySelector("#pp-name").focus(); }, 60);
  }
  function closePopup() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  overlay.querySelector(".pp-close").addEventListener("click", closePopup);
  overlay.querySelector(".pp-ok-close").addEventListener("click", closePopup);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closePopup(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("open")) closePopup();
  });

  function clearErrors() {
    form.querySelectorAll(".err").forEach(function (el) { el.classList.remove("err"); });
    form.querySelectorAll(".pp-err-msg").forEach(function (el) { el.classList.remove("show"); });
    consent.classList.remove("bad");
  }

  function validate(nameEl, phoneEl) {
    var ok = true;
    if (!nameEl.value.replace(/\s/g, "")) { nameEl.classList.add("err"); ok = false; }
    var digits = (phoneEl.value.match(/\d/g) || []).length;
    if (digits < 6) { phoneEl.classList.add("err"); ok = false; }
    if (!ok) {
      var msg = phoneEl.parentNode.querySelector(".pp-err-msg");
      if (msg) msg.classList.add("show");
      (!nameEl.value ? nameEl : phoneEl).focus();
    }
    return ok;
  }

  function send(data, done) {
    if (!FORM_ENDPOINT) { setTimeout(done, 450); return; } /* демо-режим */
    var fd = new FormData();
    for (var k in data) if (data.hasOwnProperty(k)) fd.append(k, data[k]);
    fetch(FORM_ENDPOINT, { method: "POST", body: fd, headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
      .catch(function () { alert("Не удалось отправить заявку. Позвоните нам: +7 909 903 55 86"); });
  }

  /* popup submit */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    var nameEl = overlay.querySelector("#pp-name");
    var phoneEl = overlay.querySelector("#pp-phone");
    if (!validate(nameEl, phoneEl)) return;
    if (!consentBox.checked) { consent.classList.add("bad"); consentBox.focus(); return; }
    send({
      name: nameEl.value,
      phone: phoneEl.value,
      service: select.value,
      comment: overlay.querySelector("#pp-comment").value,
      page: page
    }, function () {
      viewForm.style.display = "none";
      viewOk.style.display = "";
    });
  });

  /* ---------- intercept CTA anchors: popup, no scroll ---------- */
  function ctaAnchor(el) {
    if (!el || el.tagName !== "A") return false;
    var href = el.getAttribute("href") || "";
    if (el.classList.contains("header-cta")) return true;
    if (href === "#order" || href.indexOf("#order") !== -1) return true;
    if (el.classList.contains("btn-pink") && (href === "" || href === "#")) return true;
    return false;
  }

  document.addEventListener("click", function (e) {
    var el = e.target;
    while (el && el !== document.body) {
      if (ctaAnchor(el)) {
        e.preventDefault();
        var href = el.getAttribute("href") || "";
        var hint;
        var m = href.match(/^([a-z0-9-]+\.html)#/);
        if (m && PAGE_SERVICE[m[1]] !== undefined) hint = PAGE_SERVICE[m[1]];
        openPopup(hint);
        return;
      }
      el = el.parentNode;
    }
  });

  /* ---------- inline forms: validate + success ---------- */
  function okBlock(msg) {
    var d = document.createElement("div");
    d.className = "form-ok";
    d.innerHTML = '<span class="ok-ic">&#10003;</span><b>Заявка отправлена!</b><span>' +
      (msg || "Перезвоним в течение 15 минут в рабочее время.") + "</span>";
    return d;
  }

  function findField(scope, re) {
    var inputs = scope.querySelectorAll("input[type='text'], input[type='tel']");
    for (var i = 0; i < inputs.length; i++) {
      var ph = (inputs[i].getAttribute("placeholder") || "").toLowerCase();
      if (re.test(ph)) return inputs[i];
    }
    return null;
  }

  function inlineSubmit(root) {
    var nameEl = findField(root, /имя|ваше/i) || root.querySelector("input[type='text']");
    var phoneEl = findField(root, /телефон|тел/i);
    if (!phoneEl) {
      var ins = root.querySelectorAll("input[type='text'], input[type='tel']");
      phoneEl = ins.length > 1 ? ins[ins.length - 1] : ins[0];
    }
    root.querySelectorAll(".err").forEach(function (el) { el.classList.remove("err"); });
    var ok = true;
    if (nameEl && !nameEl.value.replace(/\s/g, "")) { nameEl.classList.add("err"); ok = false; }
    if (phoneEl) {
      var digits = (phoneEl.value.match(/\d/g) || []).length;
      if (digits < 6) { phoneEl.classList.add("err"); ok = false; }
    }
    if (!ok) { (nameEl && !nameEl.value ? nameEl : phoneEl || nameEl).focus(); return; }

    var container =
      root.closest(".order5-form") ||
      root.closest(".order-col.right") ||
      root.closest(".hs-order-form, .cta-form, .p8-order-form, form") ||
      root;
    var data = {
      name: nameEl ? nameEl.value : "",
      phone: phoneEl ? phoneEl.value : "",
      page: page
    };
    var textareas = container.querySelectorAll("textarea");
    if (textareas.length) data.comment = textareas[textareas.length - 1].value;
    var servSel = container.querySelector(".select span, select");
    if (servSel) data.service = servSel.textContent;

    var submitBtn = container.querySelector(".order-send, .hs-send");
    if (submitBtn) submitBtn.disabled = true;

    send(data, function () {
      var ok1 = okBlock();
      if (container === root && root.tagName !== "FORM") { root.appendChild(ok1); }
      else { container.innerHTML = ""; container.appendChild(ok1); }
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".order-send, .hs-send") : null;
    if (!btn) return;
    if (btn.tagName === "BUTTON" && btn.getAttribute("type") === "submit") {
      var f = btn.closest("form");
      if (f) return; /* form submit handler поймает */
    }
    e.preventDefault();
    var root = btn.closest("form");
    if (!root) {
      /* подняться до блока, где лежат поля имени и телефона */
      root = btn.parentNode;
      while (root && root !== document.body) {
        var ins = root.querySelectorAll("input[type='text'], input[type='tel']");
        if (ins.length >= 2) break;
        root = root.parentNode;
      }
      if (!root || root === document.body) root = btn.parentNode;
    }
    inlineSubmit(root);
  });

  document.addEventListener("submit", function (e) {
    var f = e.target;
    if (f.tagName !== "FORM") return;
    e.preventDefault();
    inlineSubmit(f);
  });

  /* ---------- upgrade order-note: real links to policy docs ---------- */
  var consentHTML =
    'Отправляя форму, вы даёте <a href="soglasie.html" target="_blank" rel="noopener">согласие на обработку персональных данных</a> ' +
    'и соглашаетесь с <a href="politika.html" target="_blank" rel="noopener">Политикой обработки персональных данных</a>.';
  document.querySelectorAll(".order-note, .hs-order-note, .p8-order-note").forEach(function (n) {
    n.innerHTML = consentHTML;
  });

  /* ---------- real social / write links ---------- */
  document.querySelectorAll("a.soc, a.wa-btn").forEach(function (a) {
    var t = (a.textContent || "").toLowerCase();
    var href = a.getAttribute("href") || "";
    if (href !== "#") return;
    if (t.indexOf("whatsapp") !== -1 || t.indexOf("написать") !== -1 || a.classList.contains("wa-btn")) {
      a.href = "https://wa.me/7" + PHONE.slice(2);
    } else if (t.indexOf("telegram") !== -1) {
      a.href = "https://t.me/chistota_v_detalyah";
    } else if (t.indexOf("vk") !== -1) {
      a.href = "https://vk.com/";
    } else if (t.indexOf("avito") !== -1) {
      a.href = "https://www.avito.ru/";
    } else if (t.indexOf("max") !== -1) {
      a.href = "https://max.ru/";
    }
    if (a.href && a.href.indexOf("http") === 0) {
      a.target = "_blank";
      a.rel = "noopener";
    }
  });
})();
