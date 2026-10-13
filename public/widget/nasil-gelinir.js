/*!
 * "Biz neredeyiz? Nasıl gelebilirsiniz?" widget'ı
 * Bağımsız, bağımlılıksız (harita için yerel Leaflet 1.9.4, yalnızca panel açılınca yüklenir).
 * Tüm içerik public/widget/config.json'dan gelir. Konum verisi saklanmaz.
 *
 * Ekleme: tek satır  <Script src="/widget/nasil-gelinir.js" strategy="lazyOnload" />
 * Kaldırma: o satırı silmek yeterli. (Ayrıntı: public/widget/README.md)
 *
 * Yüzen widget her sayfa açılışında kendiliğinden açılır; "kapatıldı" bilgisi saklanmaz.
 * Sayfaya gömülü (sabit) kopya: window.NasilGelinir.mount(el) → kaldırma fonksiyonu döner.
 * Gömülü kopya ekrandayken yüzen widget gizlenir.
 */
(function () {
  "use strict";
  if (window.__nasilGelinir) return;
  window.__nasilGelinir = true;

  var script = document.currentScript;
  var BASE = (script && script.src ? script.src : location.origin + "/widget/nasil-gelinir.js").replace(/[^/]*$/, "");
  var SVG_NS = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var cfg = null;
  var uidSeq = 0;

  /* ------------------------------------------------------------ yardımcılar */
  function h(tag, props, children) {
    var el = document.createElement(tag);
    if (props) {
      for (var k in props) {
        if (!Object.prototype.hasOwnProperty.call(props, k) || props[k] == null) continue;
        if (k === "class") el.className = props[k];
        else if (k === "text") el.textContent = props[k];
        else if (k === "on") for (var ev in props.on) el.addEventListener(ev, props.on[ev]);
        else el.setAttribute(k, props[k]);
      }
    }
    append(el, children);
    return el;
  }

  function append(el, children) {
    if (children == null) return;
    if (!Array.isArray(children)) children = [children];
    children.forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
  }

  var ICONS = {
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    car: '<path d="M3.5 14.5l1.7-4.7a2 2 0 0 1 1.9-1.3h9.8a2 2 0 0 1 1.9 1.3l1.7 4.7"/><rect x="3" y="14.5" width="18" height="4.2" rx="1.6"/><circle cx="7.5" cy="16.6" r="0.6"/><circle cx="16.5" cy="16.6" r="0.6"/><path d="M6 18.7V20.5M18 18.7V20.5"/>',
    bus: '<rect x="4.5" y="3.5" width="15" height="14" rx="3"/><path d="M4.5 11h15"/><circle cx="8.3" cy="14.2" r="0.7"/><circle cx="15.7" cy="14.2" r="0.7"/><path d="M7 17.5V20M17 17.5V20"/>',
    walk: '<circle cx="13" cy="4.6" r="1.8"/><path d="M12.4 8.6L10.9 13l3.1 2.9.7 5M10.9 13L8.9 21M12.4 8.6l-3.3 1.6L7.9 13M12.4 8.6l3.1 2.4 2.6.5"/>',
    train: '<rect x="5" y="3.5" width="14" height="14" rx="3.5"/><path d="M5 11h14"/><circle cx="9" cy="14.2" r="0.7"/><circle cx="15" cy="14.2" r="0.7"/><path d="M8 20.5l1.6-3M16 20.5l-1.6-3"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    nav: '<path d="M3 11l18-8-8 18-2-8-8-2z"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6"/>'
  };

  function icon(name, cls) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.9");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    if (cls) svg.setAttribute("class", cls);
    svg.innerHTML = ICONS[name]; // sabit, kod içi sabit dizgeler — kullanıcı/yapılandırma verisi değil
    return svg;
  }

  function fmtDist(m) {
    return m >= 1000 ? (m / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + " km" : Math.round(m) + " m";
  }

  function isApple() {
    var ua = navigator.userAgent || "";
    return /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  /* ------------------------------------------------------------ bağlantılar */
  function gmapsNav() {
    var a = cfg.academy;
    return "https://www.google.com/maps/dir/?api=1&destination=" + a.lat + "," + a.lon + "&travelmode=driving&dir_action=navigate";
  }

  function appleNav() {
    var a = cfg.academy;
    return "https://maps.apple.com/?daddr=" + a.lat + "," + a.lon + "&dirflg=d";
  }

  function gmapsWalk(fromLat, fromLon) {
    var a = cfg.academy;
    return "https://www.google.com/maps/dir/?api=1&origin=" + fromLat + "," + fromLon + "&destination=" + a.lat + "," + a.lon + "&travelmode=walking";
  }

  function extLink(href, children, cls, label) {
    return h("a", { href: href, target: "_blank", rel: "noopener noreferrer", class: cls, "aria-label": label }, children);
  }

  /* ------------------------------------------------------------ Leaflet (tembel) */
  var leafletPromise = null;
  function loadLeaflet() {
    if (window.L && window.L.map) return Promise.resolve(window.L);
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise(function (resolve, reject) {
      var css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = BASE + "vendor/leaflet.css";
      document.head.appendChild(css);
      var js = document.createElement("script");
      js.src = BASE + "vendor/leaflet.js";
      js.onload = function () {
        resolve(window.L);
      };
      js.onerror = function () {
        leafletPromise = null;
        reject(new Error("leaflet"));
      };
      document.head.appendChild(js);
    });
    return leafletPromise;
  }

  /* ------------------------------------------------------------ widget örneği (yüzen ya da sayfaya gömülü) */
  function createWidget(opts) {
    var inline = !!(opts && opts.inline);
    var uid = "ng" + ++uidSeq;
    var els = {};
    var phase = "idle";
    var activeMode = null;
    var mapState = null; // { map, raf }
    var timers = [];

    function later(fn, ms) {
      var t = setTimeout(fn, ms);
      timers.push(t);
      return t;
    }

    function clearTimers() {
      timers.forEach(clearTimeout);
      timers = [];
    }

    function destroyMap() {
      if (!mapState) return;
      if (mapState.raf) cancelAnimationFrame(mapState.raf);
      try {
        mapState.map.remove();
      } catch (e) {
        /* zaten kaldırılmış */
      }
      mapState = null;
    }

    function pinHtml() {
      var wrap = h("div", { class: "ng-pin" }, [
        h("span", { class: "ng-ring", style: "--d:0" }),
        h("span", { class: "ng-ring", style: "--d:1" }),
        h("span", { class: "ng-ring", style: "--d:2" }),
        h("span", { class: "ng-pin-body" })
      ]);
      var body = wrap.querySelector(".ng-pin-body");
      body.innerHTML =
        '<svg viewBox="0 0 40 52" aria-hidden="true"><path d="M20 51C20 51 4 33.5 4 20a16 16 0 0 1 32 0c0 13.5-16 31-16 31z" fill="#ea580c" stroke="#fff" stroke-width="2.5"/><circle cx="20" cy="20" r="6" fill="#fff"/></svg>';
      return wrap.outerHTML;
    }

    /** Haritayı panel içindeki kapsayıcıda kurar; hazır olunca callback(L, map) çağrılır. */
    function mountMap(container, build) {
      var loading = h("div", { class: "ng-map-loading", text: "Harita yükleniyor…" });
      container.appendChild(loading);
      var token = (mountMap.token = (mountMap.token || 0) + 1);
      loadLeaflet().then(
        function (L) {
          if (token !== mountMap.token || !container.isConnected) return;
          loading.remove();
          destroyMap();
          var map = L.map(container, {
            zoomControl: true,
            scrollWheelZoom: false,
            dragging: !L.Browser.mobile,
            tap: false,
            attributionControl: true,
            zoomSnap: 0.5
          });
          map.attributionControl.setPrefix(false);
          L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
          }).addTo(map);
          mapState = { map: map, raf: 0 };
          build(L, map);
          later(function () {
            if (mapState && mapState.map === map) map.invalidateSize();
          }, 900);
        },
        function () {
          loading.textContent = "Harita yüklenemedi. Aşağıdaki adres ve bağlantıları kullanabilirsiniz.";
        }
      );
    }

    function academyMarker(L, map) {
      var a = cfg.academy;
      var icon = L.divIcon({ className: "", html: pinHtml(), iconSize: [40, 52], iconAnchor: [20, 50] });
      return L.marker([a.lat, a.lon], { icon: icon, interactive: false, keyboard: false, title: a.name, zIndexOffset: 1000 }).addTo(map);
    }

    /** Yolu hızlı başlayıp yavaşlayan bir eğriyle çizer. */
    function drawPath(L, map, points, style) {
      var line = L.polyline([], style).addTo(map);
      if (reduceMotion || points.length < 3) {
        line.setLatLngs(points);
        return line;
      }
      var start = performance.now();
      var dur = 1300;
      (function frame(now) {
        if (!mapState || mapState.map !== map) return;
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        line.setLatLngs(points.slice(0, Math.max(2, Math.ceil(points.length * eased))));
        if (t < 1) mapState.raf = requestAnimationFrame(frame);
      })(start);
      return line;
    }

    var DOTTED = { color: "#fb923c", weight: 5, opacity: 0.95, dashArray: "1 10", lineCap: "round", className: "ng-path-dotted" };

    /* ------------------------------------------------------------ panel içerikleri */
    var rIndex = 0;
    function rise(el) {
      el.classList.add("ng-rise");
      el.style.setProperty("--r", String(rIndex++));
      return el;
    }

    function panelFoot() {
      var a = cfg.academy;
      var hours = h(
        "ul",
        { class: "ng-hours", "aria-label": "Çalışma saatleri" },
        (a.hours || []).map(function (x) {
          return h("li", { text: x.label + ": " + x.value });
        })
      );
      return rise(
        h("div", { class: "ng-foot" }, [
          h("address", { class: "ng-addr" }, [icon("pin"), h("span", { text: a.name + " — " + a.address })]),
          hours,
          h("a", { class: "ng-btn", href: "tel:" + a.phoneTel }, [icon("phone"), "Ara: " + a.phoneDisplay])
        ])
      );
    }

    function soonBlock(text) {
      return rise(h("p", { class: "ng-soon", role: "status", text: text }));
    }

    function carBody() {
      var a = cfg.academy;
      var mapEl = rise(h("div", { class: "ng-map", role: "region", "aria-label": "Akademi konumu haritası" }));
      var statEl = h("div", { class: "ng-stat", "aria-live": "polite" });
      var noteEl = h("p", { class: "ng-note", "aria-live": "polite", hidden: "" });
      var consentSlot = h("div");

      var actions = h("div", { class: "ng-actions" });
      actions.appendChild(extLink(gmapsNav(), [icon("nav"), "Navigasyonu başlat"], "ng-btn ng-btn-primary", "Navigasyonu başlat (Google Haritalar, yeni sekmede açılır)"));
      if (isApple()) {
        actions.appendChild(extLink(appleNav(), [icon("nav"), "Apple Haritalar'da aç"], "ng-btn", "Apple Haritalar'da aç (yeni sekmede açılır)"));
      }

      var previewCfg = cfg.routing && cfg.routing.carPreview;
      var previewBtn = null;
      if (previewCfg && previewCfg.enabled && navigator.geolocation) {
        previewBtn = h("button", { type: "button", class: "ng-btn", "aria-expanded": "false" }, [icon("route"), "Konumumdan rota önizle"]);
        previewBtn.addEventListener("click", function () {
          showConsent();
        });
        actions.appendChild(previewBtn);
      }
      rise(actions);

      function say(text) {
        noteEl.textContent = text;
        noteEl.hidden = !text;
      }

      function showConsent() {
        if (consentSlot.firstChild) return;
        previewBtn.setAttribute("aria-expanded", "true");
        var title = h("p", { id: uid + "-consent-title", tabindex: "-1", text: "Konumunuz neden isteniyor?" });
        title.style.fontWeight = "700";
        var go = h("button", { type: "button", class: "ng-btn ng-btn-primary", text: "Konumumu kullan" });
        var no = h("button", { type: "button", class: "ng-btn", text: "Vazgeç" });
        var box = h("div", { class: "ng-consent", role: "group", "aria-labelledby": uid + "-consent-title" }, [
          title,
          h("p", {
            text:
              "Rota önizlemesini çizebilmemiz için tarayıcınız cihazınızın konumunu soracak. Konumunuz kaydedilmez ve sitemizin sunucusuna gönderilmez; yalnızca rotayı hesaplamak için harita rota servisine (OSRM) iletilir. İzin vermezseniz de “Navigasyonu başlat” ile yol tarifi alabilirsiniz."
          }),
          h("div", { class: "ng-consent-actions" }, [go, no])
        ]);
        consentSlot.appendChild(box);
        title.focus({ preventScroll: true });
        title.scrollIntoView({ block: "nearest" });
        no.addEventListener("click", function () {
          consentSlot.textContent = "";
          previewBtn.setAttribute("aria-expanded", "false");
          previewBtn.focus();
        });
        go.addEventListener("click", function () {
          consentSlot.textContent = "";
          previewBtn.setAttribute("aria-expanded", "false");
          previewRoute();
        });
      }

      function previewRoute() {
        say("Konumunuz alınıyor…");
        statEl.textContent = "";
        navigator.geolocation.getCurrentPosition(
          function (pos) {
            // ~11 m hassasiyete yuvarla; hiçbir yere kaydedilmez
            var la = Math.round(pos.coords.latitude * 1e4) / 1e4;
            var lo = Math.round(pos.coords.longitude * 1e4) / 1e4;
            var url = previewCfg.endpoint + "/" + lo + "," + la + ";" + a.lon + "," + a.lat + "?overview=full&geometries=geojson";
            fetch(url, { referrerPolicy: "no-referrer", cache: "no-store" })
              .then(function (r) {
                if (!r.ok) throw new Error("http");
                return r.json();
              })
              .then(function (j) {
                var route = j && j.routes && j.routes[0];
                if (!route || !mapState) throw new Error("rota");
                var pts = route.geometry.coordinates.map(function (c) {
                  return [c[1], c[0]];
                });
                var L = window.L;
                var map = mapState.map;
                L.marker([la, lo], {
                  icon: L.divIcon({ className: "", html: '<div class="ng-me"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }),
                  interactive: false,
                  keyboard: false
                }).addTo(map);
                drawPath(L, map, pts, { color: "#fb923c", weight: 5, opacity: 0.95, lineCap: "round", lineJoin: "round" });
                map.fitBounds(L.latLngBounds(pts).extend([a.lat, a.lon]), { padding: [30, 30], animate: !reduceMotion });
                say("");
                statEl.textContent = "";
                statEl.appendChild(h("strong", { text: fmtDist(route.distance) }));
                statEl.appendChild(h("span", { text: "≈ " + Math.max(1, Math.round(route.duration / 60)) + " dk (trafik hariç)" }));
              })
              .catch(function () {
                say("Rota önizlemesi şu an yüklenemedi. “Navigasyonu başlat” ile yol tarifi alabilirsiniz.");
              });
          },
          function (err) {
            say(
              err && err.code === 1
                ? "Konum izni verilmedi. Sorun değil; “Navigasyonu başlat” ile yol tarifi alabilirsiniz."
                : "Konumunuz alınamadı. “Navigasyonu başlat” ile yol tarifi alabilirsiniz."
            );
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      }

      mountMap(mapEl, function (L, map) {
        map.setView([a.lat, a.lon], 15.5);
        academyMarker(L, map);
      });

      return [mapEl, actions, consentSlot, rise(statEl), rise(noteEl)];
    }

    /* ------------------------------------------------------------ toplu taşıma: başlangıç seç → otobüs/metro → ortak son adım */
    /** İETT'nin BÜYÜK HARFLİ resmî adları Türkçe başlık biçimine çevrilir ("S.GÖKÇEN" → "S.Gökçen"). */
    function titleCaseTr(s) {
      return (s || "")
        .toLocaleLowerCase("tr-TR")
        .replace(/(^|[\s\-\/(.])(\S)/g, function (m, p, c) {
          return p + c.toLocaleUpperCase("tr-TR");
        });
    }

    function gmapsTransit(from, to) {
      return "https://www.google.com/maps/dir/?api=1&origin=" + from[0] + "," + from[1] + "&destination=" + to[0] + "," + to[1] + "&travelmode=transit";
    }

    function gmapsWalkPair(from, to) {
      return "https://www.google.com/maps/dir/?api=1&origin=" + from[0] + "," + from[1] + "&destination=" + to[0] + "," + to[1] + "&travelmode=walking";
    }

    function transitBody() {
      var a = cfg.academy;
      var tp = cfg.toplutasima;
      var out = [];
      var mapEl = rise(h("div", { class: "ng-map", role: "region", "aria-label": "Samandıra Merkez Metro'dan akademiye yürüme yolu haritası" }));
      out.push(mapEl);

      if (!tp || !tp.baslangiclar || !tp.baslangiclar.length) {
        out.push(soonBlock("Hat bilgisi yakında"));
        mountMap(mapEl, function (L, map) {
          map.setView([a.lat, a.lon], 15.5);
          academyMarker(L, map);
        });
        return out;
      }

      var walk = tp.yurume || {};
      var origins = tp.baslangiclar;
      var dyn = h("div", { class: "ng-dyn" });
      out.push(rise(dyn));
      var state = { origin: null, tab: "otobus", more: false };

      function stagger(el, i) {
        el.classList.add("ng-in");
        el.style.setProperty("--c", String(i));
        return el;
      }

      function setBackLabel() {
        var bk = els.panel.querySelector(".ng-back");
        if (bk) bk.setAttribute("aria-label", state.origin ? "Geri, başlangıç noktası seçimine dön" : "Geri, ulaşım seçeneklerine dön");
      }

      panelBack = function () {
        if (!state.origin) return false;
        var backId = state.origin.id;
        state.origin = null;
        state.tab = "otobus";
        state.more = false;
        renderOrigins();
        var again = dyn.querySelector('[data-origin="' + backId + '"]');
        if (again) again.focus();
        return true;
      };

      /* ---- adım 1: nereden geliyorsunuz? ---- */
      function renderOrigins() {
        dyn.textContent = "";
        setBackLabel();
        var q = stagger(h("p", { class: "ng-q", id: uid + "-q", tabindex: "-1", text: "Nereden geliyorsunuz?" }), 0);
        var list = h("ul", { class: "ng-origins", "aria-labelledby": uid + "-q" });
        origins.forEach(function (o, i) {
          var btn = h("button", { type: "button", class: "ng-origin ng-glass", "data-origin": o.id }, [
            h("span", { class: "ng-origin-icon", "aria-hidden": "true" }, [icon("pin")]),
            h("span", { class: "ng-origin-name", text: o.ad }),
            icon("chevron", "ng-origin-arrow")
          ]);
          btn.addEventListener("click", function () {
            selectOrigin(o);
          });
          list.appendChild(stagger(h("li", null, [btn]), i + 1));
        });
        dyn.appendChild(q);
        dyn.appendChild(list);
      }

      /* ---- adım 2: otobüs / metro ---- */
      function visibleLines(arr) {
        return (arr || []).filter(function (l) {
          return !l.gizle;
        });
      }

      function lineCard(l, i) {
        var name = titleCaseTr(l.ad);
        var inis = l.inisDurak ? titleCaseTr(l.inisDurak.ad) : null;
        var label = l.hat + ", " + name + (inis ? ". İniş durağı: " + inis : "") + (l.not ? ". " + l.not : "");
        var li = h("li", { class: "ng-card", tabindex: "-1", "aria-label": label }, [
          h("span", { class: "ng-badge", "aria-hidden": "true", text: l.hat }),
          h("span", { class: "ng-card-body", "aria-hidden": "true" }, [
            h("span", { class: "ng-card-name", text: name }),
            inis ? h("span", { class: "ng-card-inis", text: "İniş durağı: " + inis }) : null,
            l.not ? h("span", { class: "ng-card-note", text: l.not }) : null
          ])
        ]);
        return stagger(li, i);
      }

      function metroCard(o) {
        var m = o.metro;
        var route = m.kalkisIstasyonu && m.varisIstasyonu ? m.kalkisIstasyonu + " → " + m.varisIstasyonu : tp.varis.metro;
        var meta = [];
        if (m.yon) meta.push(m.yon);
        if (m.araIstasyonlar && m.araIstasyonlar.length) meta.push("Ara istasyonlar: " + m.araIstasyonlar.join(", "));
        var label = m.hat + ", " + route + (meta.length ? ". " + meta.join(". ") : "");
        var li = h("li", { class: "ng-card ng-card-metro", tabindex: "-1", "aria-label": label }, [
          h("span", { class: "ng-badge ng-badge-metro", "aria-hidden": "true", text: m.hat }),
          h("span", { class: "ng-card-body", "aria-hidden": "true" }, [
            h("span", { class: "ng-card-name", text: route }),
            meta.length ? h("span", { class: "ng-card-note", text: meta.join(" · ") }) : null
          ])
        ]);
        return stagger(li, 0);
      }

      /** Roving tabindex: oklar kartlar arasında gezinir. */
      function rovingList(ul) {
        var items = [].slice.call(ul.querySelectorAll(".ng-card"));
        if (!items.length) return;
        items[0].tabIndex = 0;
        ul.addEventListener("keydown", function (e) {
          var cur = items.indexOf(document.activeElement);
          if (cur < 0) return;
          var next = cur;
          if (e.key === "ArrowDown") next = Math.min(items.length - 1, cur + 1);
          else if (e.key === "ArrowUp") next = Math.max(0, cur - 1);
          else if (e.key === "Home") next = 0;
          else if (e.key === "End") next = items.length - 1;
          else return;
          e.preventDefault();
          items[cur].tabIndex = -1;
          items[next].tabIndex = 0;
          items[next].focus();
        });
      }

      function selectOrigin(o) {
        state.origin = o;
        state.tab = "otobus";
        state.more = false;
        renderOrigin();
      }

      function renderOrigin() {
        var o = state.origin;
        dyn.textContent = "";
        setBackLabel();
        var hasMetro = !!(o.metro && o.metro.hat);
        var buses = visibleLines(o.otobus);
        var extra = visibleLines(o.otobusDiger);

        var from = stagger(
          h("div", { class: "ng-from", tabindex: "-1", id: uid + "-from" }, [
            h("span", { class: "ng-from-label", text: "Nereden" }),
            h("strong", { class: "ng-from-name", text: o.ad })
          ]),
          0
        );
        var change = h("button", { type: "button", class: "ng-change", "aria-label": "Başlangıç noktasını değiştir" }, "Değiştir");
        change.addEventListener("click", function () {
          panelBack();
        });
        from.appendChild(change);
        dyn.appendChild(from);

        var tabArea = h("div", { class: "ng-tabarea" });
        var finalArea = h("div", { class: "ng-final" });

        if (hasMetro) {
          var tabs = h("div", { class: "ng-tabs", role: "tablist", "aria-label": "Ulaşım türü" });
          var defs = [
            { id: "otobus", label: "Otobüs" },
            { id: "metro", label: "Metro" }
          ];
          var btns = {};
          defs.forEach(function (d) {
            var b = h("button", { type: "button", class: "ng-tab", role: "tab", id: uid + "-tab-" + d.id, "aria-controls": uid + "-tabpanel", "aria-selected": String(state.tab === d.id), tabindex: state.tab === d.id ? "0" : "-1", text: d.label });
            b.addEventListener("click", function () {
              setTab(d.id);
            });
            btns[d.id] = b;
            tabs.appendChild(b);
          });
          tabs.addEventListener("keydown", function (e) {
            var idx = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? 0 : e.key === "Home" ? 0 : e.key === "End" ? 1 : -1;
            if (idx < 0) return;
            e.preventDefault();
            setTab(defs[idx].id);
            btns[defs[idx].id].focus();
          });
          dyn.appendChild(stagger(tabs, 1));
          var setTab = function (id) {
            state.tab = id;
            defs.forEach(function (d) {
              btns[d.id].setAttribute("aria-selected", String(d.id === id));
              btns[d.id].tabIndex = d.id === id ? 0 : -1;
            });
            fillTab();
          };
        }

        dyn.appendChild(tabArea);
        dyn.appendChild(finalArea);

        function fillTab() {
          tabArea.textContent = "";
          tabArea.setAttribute("role", hasMetro ? "tabpanel" : "group");
          tabArea.id = uid + "-tabpanel";
          tabArea.setAttribute(hasMetro ? "aria-labelledby" : "aria-label", hasMetro ? uid + "-tab-" + state.tab : "Otobüs hatları");
          if (state.tab === "otobus") {
            if (!hasMetro && buses.length) tabArea.appendChild(stagger(h("p", { class: "ng-sub", text: "Otobüs hatları" }), 1));
            if (!buses.length) {
              // Doğrudan hat yoksa config'teki aktarma notu gösterilir (uydurma hat yok)
              tabArea.appendChild(stagger(h("p", { class: "ng-soon", role: "status", text: o.aktarmaNotu || "Hat bilgisi yakında" }), 1));
            } else {
              var ul = h("ul", { class: "ng-cards", "aria-label": o.ad + " başlangıçlı otobüs hatları, " + buses.length + " hat. Gezinmek için ok tuşlarını kullanın." });
              buses.forEach(function (l, i) {
                ul.appendChild(lineCard(l, i));
              });
              tabArea.appendChild(ul);
              rovingList(ul);
              if (extra.length) {
                var more = h("button", { type: "button", class: "ng-more", "aria-expanded": String(state.more) }, [state.more ? "Diğer hatları gizle" : "Diğer hatlar (" + extra.length + ")", icon("chevron", "ng-origin-arrow")]);
                more.addEventListener("click", function () {
                  state.more = !state.more;
                  fillTab();
                  var again = tabArea.querySelector(".ng-more");
                  if (again) again.focus();
                });
                tabArea.appendChild(more);
                if (state.more) {
                  var ul2 = h("ul", { class: "ng-cards ng-cards-extra", "aria-label": "Diğer hatlar" });
                  extra.forEach(function (l, i) {
                    ul2.appendChild(lineCard(l, i));
                  });
                  tabArea.appendChild(ul2);
                  rovingList(ul2);
                }
              }
            }
          } else {
            tabArea.appendChild(h("ul", { class: "ng-cards ng-cards-metro", "aria-label": "Metro" }, [metroCard(o)]));
          }
          fillFinal();
        }

        /* ---- ortak son adım: in → yürü ---- */
        function fillFinal() {
          finalArea.textContent = "";
          var isMetro = state.tab === "metro";
          var noDirect = !buses.length && !hasMetro;
          // İniş durağı: her hattın kendi durağı (inisDurak). Hepsi aynıysa tek cümle; farklıysa kartlara yönlendirilir.
          var stopNames = [];
          visibleLines(o.otobus).concat(extra).forEach(function (l) {
            var n = l.inisDurak ? titleCaseTr(l.inisDurak.ad) : null;
            if (n && stopNames.indexOf(n) < 0) stopNames.push(n);
          });
          var getOff;
          var getOffMeta = null;
          if (isMetro) getOff = tp.varis.metro + " istasyonunda inin";
          else if (stopNames.length === 1) getOff = stopNames[0] + " durağında inin";
          else if (stopNames.length > 1) {
            getOff = "Hattınızın kartında yazan durakta inin";
            getOffMeta = stopNames.join(" · ");
          } else getOff = tp.varis.otobusDuragi + " durağında inin";
          var haveWalk = walk && walk.mesafeMetre != null && walk.sureDakika != null;
          var walkPair = walk.baslangicKoordinat && walk.hedefKoordinat ? [walk.baslangicKoordinat, walk.hedefKoordinat] : null;

          var walkBody = [h("span", { class: "ng-step-title", text: "Oradan akademiye yürüyün" })];
          if (haveWalk) {
            walkBody.push(h("span", { class: "ng-step-meta", text: fmtDist(walk.mesafeMetre) + " · ≈ " + walk.sureDakika + " dk yürüyüş" }));
          } else if (walkPair) {
            walkBody.push(extLink(gmapsWalkPair(walkPair[0], walkPair[1]), "Yürüme süresi için Google Haritalar'da aç", "ng-link ng-link-block", "Yürüme süresi için Google Haritalar'da aç (yeni sekmede açılır)"));
          }

          var steps = h("ol", { class: "ng-steps", "aria-label": "Son adımlar" }, [
            h("li", { class: "ng-step" }, [h("span", { class: "ng-step-icon", "aria-hidden": "true" }, [icon(isMetro ? "train" : "bus")]), h("span", { class: "ng-step-body" }, [h("span", { class: "ng-step-title", text: getOff }), getOffMeta ? h("span", { class: "ng-step-meta", text: getOffMeta }) : null])]),
            h("li", { class: "ng-step" }, [h("span", { class: "ng-step-icon", "aria-hidden": "true" }, [icon("walk")]), h("span", { class: "ng-step-body" }, walkBody)])
          ]);
          // Doğrudan hat yoksa "inin / yürüyün" adımları gösterilmez; yalnızca not ve Google Haritalar düğmesi
          if (!noDirect) finalArea.appendChild(stagger(steps, 2));

          if (o.koordinat) {
            var cta = extLink(gmapsTransit(o.koordinat, [a.lat, a.lon]), [icon("route"), "Google Haritalar'da aç"], "ng-btn ng-btn-primary", o.ad + " noktasından akademiye toplu taşıma yol tarifi, Google Haritalar (yeni sekmede açılır)");
            finalArea.appendChild(stagger(h("div", { class: "ng-actions" }, [cta]), 3));
            finalArea.appendChild(stagger(h("p", { class: "ng-note", text: "Bu bağlantı güncel hat ve sefer bilgisini canlı gösterir." }), 4));
          }
        }

        fillTab();
        later(function () {
          from.focus({ preventScroll: true });
        }, 60);
      }

      renderOrigins();

      mountMap(mapEl, function (L, map) {
        map.setView([a.lat, a.lon], 15.5);
        academyMarker(L, map);
        if (walk.baslangicKoordinat) {
          L.marker(walk.baslangicKoordinat, {
            icon: L.divIcon({ className: "", html: '<div class="ng-dot" data-active="true">M</div>', iconSize: [21, 21], iconAnchor: [10, 10] }),
            title: walk.baslangic || "Samandıra Merkez Metro",
            interactive: false,
            keyboard: false
          }).addTo(map);
        }
        if (walk.yol && walk.yol.length > 1) {
          map.fitBounds(L.latLngBounds(walk.yol), { paddingTopLeft: [34, 72], paddingBottomRight: [34, 30], animate: false, maxZoom: 17 });
          drawPath(L, map, walk.yol, DOTTED);
        }
      });
      return out;
    }

    function walkBody() {
      var a = cfg.academy;
      var w = cfg.walking || {};
      var out = [];
      var mapEl = rise(h("div", { class: "ng-map", role: "region", "aria-label": "Yürüme yolu haritası" }));
      out.push(mapEl);

      if (!w.origin || !w.meters || !w.path) {
        out.push(soonBlock("Yürüme rotası yakında"));
        mountMap(mapEl, function (L, map) {
          map.setView([a.lat, a.lon], 15.5);
          academyMarker(L, map);
        });
        return out;
      }

      out.push(
        rise(
          h("div", { class: "ng-stat" }, [
            h("strong", { text: fmtDist(w.meters) }),
            h("span", { text: "≈ " + w.minutes + " dk yürüyüş · " + w.origin.name + " noktasından" })
          ])
        )
      );
      out.push(
        rise(
          h("div", { class: "ng-actions" }, [
            extLink(gmapsWalk(w.origin.lat, w.origin.lon), [icon("walk"), "Yürüyerek yol tarifi"], "ng-btn ng-btn-primary", "Yürüyerek yol tarifi (Google Haritalar, yeni sekmede açılır)")
          ])
        )
      );

      mountMap(mapEl, function (L, map) {
        academyMarker(L, map);
        L.marker([w.origin.lat, w.origin.lon], {
          icon: L.divIcon({ className: "", html: '<div class="ng-dot" data-active="true">' + "•" + "</div>", iconSize: [21, 21], iconAnchor: [10, 10] }),
          title: w.origin.name,
          interactive: false,
          keyboard: false
        }).addTo(map);
        map.fitBounds(L.latLngBounds(w.path), { paddingTopLeft: [34, 72], paddingBottomRight: [34, 30], animate: false, maxZoom: 17 });
        drawPath(L, map, w.path, DOTTED);
      });
      return out;
    }

    var MODES = [
      { id: "car", label: "Otomobil", title: "Otomobil ile", icon: "car", body: carBody },
      { id: "transit", label: "Toplu taşıma", title: "Toplu taşıma ile", icon: "bus", body: transitBody },
      { id: "walk", label: "Yürüme", title: "Yürüyerek", icon: "walk", body: walkBody }
    ];

    /* ------------------------------------------------------------ panel yönetimi */
    var closePanelTimer = 0;
    /** Panel içeriği, 'Geri' düğmesini bir alt adıma yönlendirmek isterse true döndüren fonksiyonu buraya koyar. */
    var panelBack = null;

    function renderPanel(mode) {
      rIndex = 0;
      panelBack = null;
      destroyMap();
      mountMap.token = (mountMap.token || 0) + 1;
      var panel = els.panel;
      panel.textContent = "";
      var title = h("h2", { class: "ng-panel-title", id: uid + "-panel-title", tabindex: "-1", text: mode.title });
      var back = h("button", { type: "button", class: "ng-back", "aria-label": "Geri, ulaşım seçeneklerine dön" }, [icon("back"), "Geri"]);
      back.addEventListener("click", function () {
        if (panelBack && panelBack()) return;
        closePanel(true);
      });
      panel.appendChild(h("div", { class: "ng-panel-head" }, [back, title]));
      append(panel, mode.body());
      panel.appendChild(panelFoot());
      panel.setAttribute("aria-labelledby", uid + "-panel-title");
      panel.scrollTop = 0;
      return title;
    }

    function openPanel(modeId, quiet) {
      var mode = MODES.filter(function (m) {
        return m.id === modeId;
      })[0];
      if (!mode) return;
      clearTimeout(closePanelTimer);
      var wasOpen = els.panelwrap.dataset.open === "true";
      activeMode = modeId;
      MODES.forEach(function (m) {
        els.buttons[m.id].setAttribute("aria-expanded", String(m.id === modeId));
      });
      var title = renderPanel(mode);
      els.panelwrap.dataset.open = "true";
      // quiet: sayfa yüklenirken açılan gömülü panel odağı çalmaz
      if (quiet) return;
      later(
        function () {
          title.focus({ preventScroll: true });
        },
        wasOpen ? 60 : 350
      );
    }

    function closePanel(refocus) {
      var id = activeMode;
      activeMode = null;
      MODES.forEach(function (m) {
        els.buttons[m.id].setAttribute("aria-expanded", "false");
      });
      els.panelwrap.dataset.open = "false";
      closePanelTimer = setTimeout(function () {
        destroyMap();
        mountMap.token = (mountMap.token || 0) + 1;
        els.panel.textContent = "";
      }, reduceMotion ? 20 : 900);
      if (refocus && id && els.buttons[id]) els.buttons[id].focus();
    }

    /* ------------------------------------------------------------ açılış / kapanış sekansı */
    function openWidget(userInitiated) {
      if (phase !== "idle") return;
      clearTimers();
      els.launcher.hidden = true;
      els.stack.hidden = false;
      void els.root.offsetWidth; // başlangıç durumunu uygula, geçişler çalışsın
      if (reduceMotion) {
        setPhase("open");
        if (userInitiated) els.buttons.car.focus();
        return;
      }
      setPhase("drop");
      later(function () {
        setPhase("capsule");
      }, 650);
      later(function () {
        setPhase("open");
        if (userInitiated) els.buttons.car.focus({ preventScroll: true });
      }, 1750);
    }

    function setPhase(p) {
      phase = p;
      els.root.dataset.phase = p;
    }

    function closeWidget(userInitiated) {
      if (phase === "idle") return;
      clearTimers();
      if (activeMode) closePanel(false);
      setPhase("idle");
      later(function () {
        els.stack.hidden = true;
        els.launcher.hidden = false;
        if (userInitiated) els.launcher.focus({ preventScroll: true });
      }, reduceMotion ? 20 : 850);
    }

    /* ------------------------------------------------------------ DOM */
    function onKeydown(e) {
      if (e.key !== "Escape" || phase === "idle" || !els.root.contains(document.activeElement)) return;
      e.preventDefault();
      if (activeMode) closePanel(true);
      else if (!inline) closeWidget(true);
    }

    function build() {
      var a = cfg.academy;
      var launcher = h(
        "button",
        { type: "button", class: "ng-launcher ng-glass", "aria-label": "Biz neredeyiz? Nasıl gelinir bilgisini aç", title: "Biz neredeyiz?" },
        [icon("pin")]
      );

      // Gömülü kopyada kapatma düğmesi yoktur; sayfanın parçası olarak hep açık durur
      var closeBtn = inline ? null : h("button", { type: "button", class: "ng-close", "aria-label": "Kapat" }, [icon("close")]);
      var capsule = h("div", { class: "ng-capsule ng-glass" }, [
        h("span", { class: "ng-capsule-icon", "aria-hidden": "true" }, [icon("pin")]),
        h("h2", { class: "ng-capsule-text", style: "margin:0", id: uid + "-heading" }, [
          h("span", { class: "ng-mask" }, [h("span", { class: "ng-line ng-line-title", text: "Biz Neredeyiz?" })]),
          h("span", { class: "ng-mask" }, [h("span", { class: "ng-line ng-line-sub", text: "Nasıl gelebilirsiniz?" })])
        ]),
        closeBtn
      ]);

      var buttons = {};
      var modes = h("div", { class: "ng-modes", role: "group", "aria-label": "Ulaşım şekli seçin" });
      MODES.forEach(function (m, i) {
        var b = h("button", { type: "button", class: "ng-mode ng-glass", "aria-expanded": "false", "aria-controls": uid + "-panel", style: "--i:" + i }, [icon(m.icon), m.label]);
        b.addEventListener("click", function () {
          if (activeMode === m.id) closePanel(true);
          else openPanel(m.id);
        });
        buttons[m.id] = b;
        modes.appendChild(b);
      });

      var panel = h("div", { class: "ng-panel", id: uid + "-panel", role: "region" });
      var panelwrap = h("div", { class: "ng-panelwrap", "data-open": "false" }, [h("div", { class: "ng-panel-clip ng-glass" }, [panel])]);

      var stack = h("div", { class: "ng-stack", hidden: "" }, [capsule, modes, panelwrap]);
      var root = h(inline ? "section" : "aside", { class: inline ? "ng ng-inline" : "ng", "data-phase": "idle", "aria-label": "Biz neredeyiz? " + a.name + " ulaşım bilgisi" }, [launcher, stack]);
      launcher.hidden = true;

      if (closeBtn) {
        closeBtn.addEventListener("click", function () {
          closeWidget(true);
        });
      }
      launcher.addEventListener("click", function () {
        openWidget(true);
      });
      document.addEventListener("keydown", onKeydown);

      els = { root: root, launcher: launcher, stack: stack, buttons: buttons, panel: panel, panelwrap: panelwrap };
    }

    build();

    /* ------------------------------------------------------------ dışa açılan arayüz */
    var suppressed = false;
    var autoOpenPending = !inline;

    function scheduleAutoOpen() {
      later(function () {
        if (suppressed || !autoOpenPending) return;
        autoOpenPending = false;
        openWidget(false);
      }, cfg.behavior.openDelayMs || 2500);
    }

    if (inline) {
      // Gömülü kopya doğrudan açık başlar ve otomobil paneli hazır gelir
      opts.host.appendChild(els.root);
      openWidget(false);
      openPanel("car", true);
    } else {
      document.body.appendChild(els.root);
      scheduleAutoOpen();
    }

    return {
      /** Yüzen widget'ı, sayfada gömülü kopya varken gizler. */
      suppress: function (on) {
        if (on === suppressed) return;
        suppressed = on;
        els.root.hidden = on;
        if (on) {
          // Açılış animasyonu yarıda kaldıysa son duruma atla
          if (phase === "drop" || phase === "capsule") {
            clearTimers();
            setPhase("open");
          }
        } else if (autoOpenPending) {
          scheduleAutoOpen();
        }
      },
      destroy: function () {
        clearTimers();
        clearTimeout(closePanelTimer);
        destroyMap();
        mountMap.token = (mountMap.token || 0) + 1;
        document.removeEventListener("keydown", onKeydown);
        els.root.remove();
      }
    };
  }

  /* ------------------------------------------------------------ başlangıç */
  var floating = null;
  var inlines = [];
  var ready = null;

  function loadCss() {
    return new Promise(function (resolve) {
      var css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = BASE + "nasil-gelinir.css";
      // CSS yüklenmeden widget kurulursa biçimsiz bir an görünür; hata olsa da devam edilir
      css.onload = css.onerror = function () {
        resolve();
      };
      document.head.appendChild(css);
    });
  }

  function syncFloating() {
    if (floating) floating.suppress(inlines.length > 0);
  }

  /** Sayfaya gömülü (sabit) bir kopya kurar; kaldırmak için dönen fonksiyonu çağırın. */
  function mount(host) {
    var entry = { widget: null, gone: false };
    ready.then(function () {
      if (entry.gone || !host.isConnected) return;
      entry.widget = createWidget({ inline: true, host: host });
      inlines.push(entry);
      syncFloating();
    }, function () {});
    return function unmount() {
      if (entry.gone) return;
      entry.gone = true;
      var i = inlines.indexOf(entry);
      if (i >= 0) inlines.splice(i, 1);
      if (entry.widget) entry.widget.destroy();
      syncFloating();
    };
  }

  function start() {
    var config = fetch(BASE + "config.json", { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("config");
      return r.json();
    });
    ready = Promise.all([config, loadCss()]).then(function (res) {
      cfg = res[0];
    });
    ready.then(
      function () {
        floating = createWidget({ inline: false });
        syncFloating();
      },
      function () {
        /* yapılandırma yoksa widget sessizce devre dışı kalır; sayfaya zarar vermez */
      }
    );

    window.NasilGelinir = { mount: mount };
    window.dispatchEvent(new Event("nasil-gelinir:ready"));
  }

  start();
})();
