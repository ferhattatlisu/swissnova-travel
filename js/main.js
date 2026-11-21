/* SwissNova Travel demo — içerik ve sayfa üretimi (menü, ana sayfa, tur listesi, tur sayfası).
   Hareket katmanı js/fx.js içinde. Tur verisi js/tours-data.js (canlı siteden).
   Arayüz dilleri: EN / DE. DE çevirisi TASLAKTIR, yayından önce anadili konuşan biri kontrol etmeli. Tur metinleri yalnız İngilizce. */
(function () {
  "use strict";
  var TOURS = window.TOURS || [];
  var BY = {}; TOURS.forEach(function (t) { BY[t.slug] = t; });
  var FX = window.FX || {   /* fx.js yüklenemezse sade yedek: her şey görünür kalır */
    chars: function (s) { return s; }, tween: function (el, a, b, d, f) { if (el) el.textContent = f(b); },
    enhance: function (r) { [].forEach.call(document.querySelectorAll("[data-rv]"), function (e) { e.classList.add("in"); }); },
    boot: function (o) { document.documentElement.classList.remove("is-loading", "mid-transition"); document.body.classList.add("ready"); if (o && o.onReady) o.onReady(); }, swap: function (f) { f(); }
  };
  var WA = "41767355560";               // Impressum'daki +41 76 735 55 60
  var MAIL = "info@swissnovatravel.com";
  var page = document.body.getAttribute("data-page");

  var CREDITS = [
    ["pilatus-luzern", "Luzern lake view from Pilatus", "Ermell", "CC BY-SA 4.0"],
    ["jungfrau", "Eiger Mönch Jungfrau 01", "Kuebi (Armin Kübelbeck)", "CC BY-SA 3.0"],
    ["rheinfall", "Neuhausen Rhine Falls panorama 3", "Ymblanter", "CC BY-SA 4.0"],
    ["titlis", "Engelberg – Titlis und Fürenalb", "W. Bulach", "CC BY-SA 4.0"],
    ["blausee", "Blausee, Alpine Lake, Kandersteg", "Banu Srini", "CC BY-SA 4.0"]
  ];
  var HERO = [
    { img: "blausee", cap: "Blausee, Kandersteg" },
    { img: "titlis", cap: "Engelberg, Central Switzerland" },
    { img: "pilatus-luzern", cap: "Lake Lucerne from Mount Pilatus" },
    { img: "rheinfall", cap: "Rhine Falls, Neuhausen" }
  ];
  var PLACES = ["Lucerne", "Jungfrau", "Titlis", "Pilatus", "Rhine Falls", "Blausee", "Interlaken", "Lauterbrunnen", "Iseltwald", "Rigi", "Lungern", "Zurich", "Bern", "Basel", "Geneva", "Montreux"];
  var DREAM_DAYS = [
    ["Day 1", "Zurich Airport · Rheinfall · Zurich city tour · overnight in Flüelen"],
    ["Day 2", "Staubbach Falls · Stanserhorn · Rodelbahn Fräkigaudi · Rigi Kulm · Lucerne boat cruise & city · overnight in Lungern"],
    ["Day 3", "Rosenlaui · Giessbach Falls · Iseltwald · Lauterbrunnen & Wengen · Grindelwald (mountain bike) · overnight in Spiez"],
    ["Day 4", "Blausee · Thun · Bern · Basel city tour · Basel Airport"]
  ];

  var I = {
    en: {
      n_tours: "Tours", n_why: "Why us", n_plan: "Plan your day", n_contact: "Contact", wa: "WhatsApp", menu: "Menu", scroll: "Scroll", view: "View",
      h1: ["PRIVATE DAYS", "IN THE ALPS"], h2: ["YOUR PACE", "YOUR ROUTE"], h3: ["ONE VAN", "ONE DAY"], h4: ["LAKES PEAKS", "AND PICNICS"],
      hero_sub: "Private day tours from Lucerne, Zurich and Interlaken in a Mercedes V-Class. Up to six guests, one group price.",
      cta_tours: "See the tours", cta_plan: "Plan your day",
      t_reg: "Kapti Swissnova Travel", t_form: "Sole proprietorship, Lucerne", t_hr: "Commercial register Canton Lucerne · CHE-204.582.938", t_car: "Mercedes-Benz V-Class · up to 6 guests",
      mani: "Every tour is private. One <u>Mercedes V-Class</u>, up to <u>six guests</u>, pickup and drop-off at your <u>hotel</u>, and a <u>picnic</u> where the lake or the peak is.",
      mani_note: "Flexible schedule, several stops, your pace. Tell us what you want to see and we shape the day around it.",
      st1: "Private day tours", st2: "Days in the Swiss Dream Tour", st3: "Guests per vehicle",
      sel: "Selected tours", all_tours: "All tours", per_group: "per group", per_person: "per person", up6: "up to 6 guests",
      k_lake: "Lakes", k_mountain: "Mountains", k_city: "Cities", k_package: "4-day package", k_all: "All",
      why_t: "Why Swissnova", w1: "Private, always", w1t: "Your group only. The price is for the whole vehicle, up to six guests.", w2: "Hotel to hotel", w2t: "Pickup and drop-off at your accommodation in Lucerne, Zurich, Interlaken or nearby.", w3: "A picnic on the way", w3t: "On most tours we prepare a private picnic. Vegetarian options on request.", w4: "Your day, your stops", w4t: "Add or remove stops and change the schedule. The price may change with the changes.",
      calc_t: "What does a tour cost per person?", calc_s: "The price is per group. Move the slider to see the share per guest.", guests: "Guests", each: "each", approx: "about", calc_note: "Tickets for cable cars, trains and entrances are listed separately on each tour.",
      pack_price: "per person, based on a group of 6 (minimum 4 travelers)",
      pic_t: "The picnic", pic_p: "Most tours include a private picnic prepared to your preferences: Swiss cheese and local specialties, fresh bread, seasonal fruit, light snacks. Vegetarian options on request.", pic_n: "City tours do not include a picnic.",
      wx_t: "If the weather turns", wx_p: "Mountain weather changes fast. On high-altitude tours we can suggest a nearby alternative for the same day.", wx_note: "Draft pairings, to be confirmed by Swissnova.", wx_label: "Weather plan B", wx_instead: "Plan B for this tour", wx_if: "If the mountain is clouded in:",
      plan_t: "Plan your day", plan_p: "Choose a tour, change the stops, tell us the date. We receive it on WhatsApp and reply with availability.", f_tour: "Tour", f_custom: "Not sure yet, show me ideas", f_date: "Date", f_guests: "Guests", f_pick: "Pickup hotel or area", f_stops: "Stops you want", f_notes: "Anything else", send: "Send on WhatsApp", not_booking: "This is a request, not a confirmed booking.", msg_prev: "Message preview",
      c_t: "Talk to us", c_p: "WhatsApp is the fastest way. We answer by e-mail and phone as well.",
      back: "← All tours", next: "Next tour", facts_p: "Price", facts_t: "Day", facts_pick: "Pickup areas", pickup_time: "Pickup 08:00 · return 18:00", pickup_note: "Typical schedule shown on the current site, to be confirmed per tour.", vehicle: "Mercedes-Benz V-Class · 7 seats · private",
      inc: "Included", exc: "Not included", tips: "Tips and personal expenses", hl: "Highlights", book_wa: "Ask about this tour", custom: "Customize this tour",
      s_year: "Year-round, winter alternatives", s_swim: "Swimming, weather permitting", s_alt: "High altitude, weather dependent", s_snow: "Snow and ice all year", s_boat: "Boat on the lake",
      itin: "Itinerary", pay_tbc: "Payment terms to be confirmed.", price_check: "Price check pending: the current site shows two different prices for this tour.",
      foot_p: "Private day tours and transfers in Switzerland.", foot_demo: "Demo design. Content taken from swissnovatravel.com on 19 Nov 2026, not yet approved.", photos: "Photos: Wikimedia Commons, representative only, to be replaced with Swissnova's own pictures.", rib: "Demo design: not the final site. Content from swissnovatravel.com, approval pending."
    },
    de: {
      n_tours: "Touren", n_why: "Warum wir", n_plan: "Tag planen", n_contact: "Kontakt", wa: "WhatsApp", menu: "Menü", scroll: "Scrollen", view: "Ansehen",
      h1: ["PRIVATE TAGE", "IN DEN ALPEN"], h2: ["DEIN TEMPO", "DEINE ROUTE"], h3: ["EIN VAN", "EIN TAG"], h4: ["SEEN GIPFEL", "UND PICKNICK"],
      hero_sub: "Private Tagestouren ab Luzern, Zürich und Interlaken im Mercedes V-Klasse. Bis zu sechs Gäste, ein Gruppenpreis.",
      cta_tours: "Touren ansehen", cta_plan: "Tag planen",
      t_reg: "Kapti Swissnova Travel", t_form: "Einzelunternehmen, Luzern", t_hr: "Handelsregister Kanton Luzern · CHE-204.582.938", t_car: "Mercedes-Benz V-Klasse · bis 6 Gäste",
      mani: "Jede Tour ist privat. Eine <u>V-Klasse</u>, bis zu <u>sechs Gäste</u>, Abholung und Rückfahrt am <u>Hotel</u> und ein <u>Picknick</u> am See oder auf dem Berg.",
      mani_note: "Flexibler Ablauf, mehrere Stopps, Ihr Tempo. Sagen Sie uns, was Sie sehen möchten, wir gestalten den Tag danach.",
      st1: "Private Tagestouren", st2: "Tage in der Swiss Dream Tour", st3: "Gäste pro Fahrzeug",
      sel: "Ausgewählte Touren", all_tours: "Alle Touren", per_group: "pro Gruppe", per_person: "pro Person", up6: "bis zu 6 Gäste",
      k_lake: "Seen", k_mountain: "Berge", k_city: "Städte", k_package: "4-Tage-Paket", k_all: "Alle",
      why_t: "Warum Swissnova", w1: "Immer privat", w1t: "Nur Ihre Gruppe. Der Preis gilt für das ganze Fahrzeug, bis zu sechs Gäste.", w2: "Von Hotel zu Hotel", w2t: "Abholung und Rückfahrt an Ihrer Unterkunft in Luzern, Zürich, Interlaken oder Umgebung.", w3: "Picknick unterwegs", w3t: "Auf den meisten Touren bereiten wir ein privates Picknick vor. Vegetarisch auf Anfrage.", w4: "Ihr Tag, Ihre Stopps", w4t: "Stopps hinzufügen oder streichen und den Ablauf ändern. Der Preis kann sich ändern.",
      calc_t: "Was kostet eine Tour pro Person?", calc_s: "Der Preis gilt pro Gruppe. Mit dem Regler sehen Sie den Anteil pro Gast.", guests: "Gäste", each: "pro Person", approx: "etwa", calc_note: "Tickets für Bergbahnen, Züge und Eintritte sind bei jeder Tour separat aufgeführt.",
      pack_price: "pro Person, basierend auf 6 Personen (mind. 4 Reisende)",
      pic_t: "Das Picknick", pic_p: "Die meisten Touren enthalten ein privates Picknick nach Ihren Wünschen: Schweizer Käse und lokale Spezialitäten, frisches Brot, Saisonfrüchte, kleine Snacks. Vegetarisch auf Anfrage.", pic_n: "Städtetouren enthalten kein Picknick.",
      wx_t: "Wenn das Wetter kippt", wx_p: "Das Bergwetter ändert sich schnell. Bei Touren in grosser Höhe schlagen wir eine nahe Alternative für denselben Tag vor.", wx_note: "Entwurf, von Swissnova zu bestätigen.", wx_label: "Wetter-Plan B", wx_instead: "Plan B für diese Tour", wx_if: "Wenn der Berg in Wolken steckt:",
      plan_t: "Tag planen", plan_p: "Tour wählen, Stopps anpassen, Datum angeben. Die Anfrage kommt per WhatsApp, wir melden uns mit der Verfügbarkeit.", f_tour: "Tour", f_custom: "Noch unsicher, zeigt mir Ideen", f_date: "Datum", f_guests: "Gäste", f_pick: "Abholhotel oder Gebiet", f_stops: "Gewünschte Stopps", f_notes: "Sonstiges", send: "Per WhatsApp senden", not_booking: "Dies ist eine Anfrage, keine bestätigte Buchung.", msg_prev: "Nachrichtenvorschau",
      c_t: "Schreiben Sie uns", c_p: "Am schnellsten per WhatsApp. Wir antworten auch per E-Mail und Telefon.",
      back: "← Alle Touren", next: "Nächste Tour", facts_p: "Preis", facts_t: "Tag", facts_pick: "Abholgebiete", pickup_time: "Abholung 08:00 · Rückkehr 18:00", pickup_note: "Typischer Ablauf der aktuellen Website, pro Tour zu bestätigen.", vehicle: "Mercedes-Benz V-Klasse · 7 Sitze · privat",
      inc: "Inbegriffen", exc: "Nicht inbegriffen", tips: "Trinkgeld und persönliche Ausgaben", hl: "Highlights", book_wa: "Zu dieser Tour fragen", custom: "Tour anpassen",
      s_year: "Ganzjährig, Winteralternativen", s_swim: "Baden, wetterabhängig", s_alt: "Grosse Höhe, wetterabhängig", s_snow: "Ganzjährig Schnee und Eis", s_boat: "Boot auf dem See",
      itin: "Programm", pay_tbc: "Zahlungsbedingungen noch zu bestätigen.", price_check: "Preisprüfung offen: Die aktuelle Website nennt für diese Tour zwei verschiedene Preise.",
      foot_p: "Private Tagestouren und Transfers in der Schweiz.", foot_demo: "Demo-Design. Inhalte von swissnovatravel.com (19.11.2026), noch nicht freigegeben.", photos: "Fotos: Wikimedia Commons, nur stellvertretend, werden durch eigene Bilder von Swissnova ersetzt.", rib: "Demo-Design: nicht die endgültige Seite. Inhalte von swissnovatravel.com, Freigabe ausstehend."
    }
  };

  var lang = "en";
  try { var saved = localStorage.getItem("sn-lang"); lang = (saved === "en" || saved === "de") ? saved : (/^de/i.test(navigator.language) ? "de" : "en"); } catch (e) {}
  function t(k) { var v = (I[lang] && I[lang][k]); return v == null ? I.en[k] : v; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function chf(n) { return "CHF " + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "’"); }
  function photo(x) { return x ? "images/" + x + ".jpg" : ""; }
  function wa(msg) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg); }
  function kindLabel(k) { return t("k_" + k); }
  function waIcon() { return '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/><path class="h" d="M8.4 7.6c-.5 1-.4 2.2.6 3.6 1.2 1.7 2.6 2.8 4.3 3.3 1 .3 2-.2 2.3-1l-1.7-1-.9.8c-.9-.3-2.2-1.5-2.8-2.5l.8-.8-.9-1.9z"/></svg>'; }
  /* hero başlığı: her satır harf harf (FX.chars ile aynı biçim) */
  function heroChars(s) {
    var n = 0;
    return String(s).split(" ").map(function (w) { return '<span class="w">' + w.split("").map(function (c) { return '<i style="--c:' + (n++) + '">' + esc(c) + "</i>"; }).join("") + "</span>"; }).join(" ");
  }

  /* ---------- ortak: menü, altbilgi ---------- */
  function langSwitch() {
    return '<span class="lang" style="--i:' + (lang === "de" ? 1 : 0) + '"><i class="thumb"></i>' +
      ["en", "de"].map(function (l) { return '<button type="button" data-l="' + l + '" class="' + (l === lang ? "on" : "") + '">' + l.toUpperCase() + "</button>"; }).join("") + "</span>";
  }
  function nav() {
    var home = page === "home" ? "" : "index.html";
    var on = (page === "tours" || page === "tour") ? " on" : "";
    return '<div class="nav" id="nav"><a class="logo" href="index.html" data-label="Swissnova"><span class="logo-a">Swissnova</span><i>Travel</i></a><div class="pills">' +
      '<a class="pill' + on + '" href="turlar.html" data-label="' + t("n_tours") + '">' + t("n_tours") + '</a>' +
      '<a class="pill" href="' + home + '#neden" data-label="' + t("n_why") + '">' + t("n_why") + '</a>' +
      '<a class="pill" href="' + home + '#planla" data-label="' + t("n_plan") + '">' + t("n_plan") + '</a>' +
      langSwitch() +
      '<a class="pill wa" href="' + wa("Hello Swissnova Travel") + '" target="_blank" rel="noopener">' + t("wa") + '</a>' +
      '<button class="burger" id="burger" type="button" aria-label="' + t("menu") + '" aria-expanded="false"><i></i><i></i></button></div></div>';
  }
  function menu() {
    var home = page === "home" ? "" : "index.html";
    var items = [["turlar.html", t("n_tours")], [home + "#neden", t("n_why")], [home + "#planla", t("n_plan")], [(page === "home" ? "" : "index.html") + "#iletisim", t("n_contact")]];
    return '<div class="menu" id="menu"><nav>' + items.map(function (it, i) {
      return '<a href="' + it[0] + '" data-label="' + esc(it[1]) + '" style="--i:' + i + '"><span class="mk"><b>' + esc(it[1]) + '</b></span><em>0' + (i + 1) + "</em></a>";
    }).join("") + '</nav><div class="menu-foot">' + langSwitch() + '<a href="' + wa("Hello Swissnova Travel") + '" target="_blank" rel="noopener">' + t("wa") + ' +41 76 735 55 60</a><a href="mailto:' + MAIL + '">' + MAIL + "</a></div></div>";
  }
  function footer() {
    return '<footer class="foot dark"><div class="wrap"><div class="fw" data-rv="chars" aria-hidden="true">SWISSNOVA</div><div class="cols"><div><div class="logo" style="font-size:26px">Swissnova<i>Travel</i></div><p style="margin-top:12px;opacity:.7;max-width:36ch">' + t("foot_p") + '</p></div>' +
      '<div><p class="label" style="margin-bottom:10px">' + t("n_contact") + '</p><a href="' + wa("Hello Swissnova Travel") + '">' + t("wa") + ' +41 76 735 55 60</a><br><a href="mailto:' + MAIL + '">' + MAIL + '</a></div>' +
      '<div><p class="label" style="margin-bottom:10px">Swissnova</p><a href="turlar.html" data-label="' + t("n_tours") + '">' + t("n_tours") + '</a><br><a href="index.html#planla" data-label="' + t("n_plan") + '">' + t("n_plan") + '</a></div></div>' +
      '<small>' + t("t_reg") + ' · ' + t("t_form") + ' · ' + t("t_hr") + '<br>' + t("foot_demo") + '<br>' + t("photos") + ' ' +
      CREDITS.map(function (c) { return esc(c[1]) + " — " + esc(c[2]) + ", " + c[3]; }).join(" · ") + '</small></div></footer>';
  }
  function chrome(body) {
    document.title = (page === "tour" && window.__cur ? window.__cur.title + " · " : "") + "Swissnova Travel";
    document.getElementById("app").innerHTML = nav() + menu() + '<div id="page">' + body + footer() + '</div>' +
      '<a class="wafab" href="' + wa("Hello Swissnova Travel") + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + waIcon() + '</a>' +
      '<div class="ribbon" id="rib"><button type="button" aria-label="x" id="ribx">×</button>' + t("rib") + '</div><div class="peek" id="peek"><i class="pi"></i><i class="pi"></i></div>';
  }

  /* ---------- parçalar ---------- */
  function rowsHtml(list) {
    return '<div class="list">' + list.map(function (x, i) {
      var pr = x.kind === "package" ? chf(x.price) + "<small>" + t("per_person") + "</small>" : chf(x.price) + "<small>" + t("per_group") + " · " + t("up6") + "</small>";
      return '<a class="row" data-rv="row" data-cur="' + t("view") + '" data-label="' + esc(x.title) + '" href="tur.html?id=' + x.slug + '" data-img="' + photo(x.img) + '"><span class="r-n">' + String(i + 1).padStart(2, "0") + '</span><span class="r-t">' + esc(x.title) + '<small>' + esc(x.sub) + '</small></span><span class="r-k">' + kindLabel(x.kind) + '</span><span class="r-p">' + pr + "</span></a>";
    }).join("") + "</div>";
  }
  function calcHtml(id, fixed) {
    var opts = TOURS.filter(function (x) { return x.kind !== "package"; }).map(function (x) { return '<option value="' + x.slug + '">' + esc(x.title) + " — " + chf(x.price) + "</option>"; }).join("");
    var seats = [0, 1, 2, 3, 4, 5].map(function (k) { return '<i style="--k:' + k + '"></i>'; }).join("");
    return '<div class="calc" id="' + id + '" data-rv="io">' + (fixed ? "" : '<select class="c-sel" aria-label="tour">' + opts + "</select>") +
      '<div class="fl">' + t("guests") + ': <b class="c-n">4</b></div><input class="c-rng" type="range" min="1" max="6" value="4" aria-label="guests"><div class="seats" aria-hidden="true">' + seats + "</div>" +
      '<div class="big"><span class="c-each"></span><small>' + t("each") + '</small></div><div class="hint c-grp"></div><div class="hint">' + t("calc_note") + "</div></div>";
  }
  function wireCalc(id, slug) {
    var el = document.getElementById(id); if (!el) return;
    var sel = el.querySelector(".c-sel"), rng = el.querySelector(".c-rng"), each = el.querySelector(".c-each"), nEl = el.querySelector(".c-n"), grp = el.querySelector(".c-grp");
    var seats = [].slice.call(el.querySelectorAll(".seats i")), shown = null;
    function upd(dur) {
      var tour = BY[sel ? sel.value : slug], n = +rng.value, v = tour.price / n;
      nEl.textContent = n; nEl.classList.remove("pop"); void nEl.offsetWidth; nEl.classList.add("pop");
      rng.style.setProperty("--p", ((n - 1) / 5 * 100) + "%");
      seats.forEach(function (s, i) { s.classList.toggle("on", i < n); });
      grp.textContent = chf(tour.price) + " " + t("per_group") + " · " + t("up6");
      FX.tween(each, shown == null ? v : shown, v, dur, function (x) { return t("approx") + " " + chf(x); }); shown = v;
    }
    if (sel) sel.addEventListener("change", function () { upd(650); });
    rng.addEventListener("input", function () { upd(520); });
    upd(0);
    /* görünür olunca bir kez 0'dan say */
    el.addEventListener("fxin", function () { shown = 0; upd(1300); });
  }
  function plannerHtml(pre) {
    var opts = '<option value="">' + t("f_custom") + "</option>" + TOURS.map(function (x) { return '<option value="' + x.slug + '"' + (x.slug === pre ? " selected" : "") + ">" + esc(x.title) + "</option>"; }).join("");
    return '<form class="calc" id="plan" onsubmit="return false"><div><label class="fl">' + t("f_tour") + '</label><select id="p-tour">' + opts + '</select></div>' +
      '<div class="fgrid"><div><label class="fl">' + t("f_date") + '</label><input id="p-date" type="date"></div><div><label class="fl">' + t("f_guests") + '</label><select id="p-n">' + [1, 2, 3, 4, 5, 6].map(function (n) { return "<option" + (n === 2 ? " selected" : "") + ">" + n + "</option>"; }).join("") + "</select></div></div>" +
      '<div><label class="fl">' + t("f_pick") + '</label><input id="p-pick" type="text" placeholder="Lucerne, Zurich, Interlaken …"></div>' +
      '<div><label class="fl">' + t("f_stops") + '</label><div class="stops" id="p-stops"></div></div>' +
      '<div><label class="fl">' + t("f_notes") + '</label><textarea id="p-notes" rows="3"></textarea></div>' +
      '<div class="preview" id="p-prev" aria-label="' + t("msg_prev") + '"></div>' +
      '<a class="btn red" id="p-send" target="_blank" rel="noopener">' + waIcon().replace("<svg", '<svg style="width:20px;height:20px;fill:#fff"') + " " + t("send") + '</a><div class="hint">' + t("not_booking") + "</div></form>";
  }
  function wirePlanner() {
    var f = document.getElementById("plan"); if (!f) return;
    var tour = f.querySelector("#p-tour"), stops = f.querySelector("#p-stops"), prev = f.querySelector("#p-prev");
    function drawStops() {
      var x = BY[tour.value];
      stops.innerHTML = x ? x.hl.map(function (h, i) { return '<label class="on" style="--k:' + i + '"><input type="checkbox" checked data-s="' + i + '">' + esc(h) + "</label>"; }).join("") : "";
      stops.parentNode.style.display = x ? "" : "none";
    }
    function msg() {
      var x = BY[tour.value], L = ["Hello Swissnova Travel, I would like to request a private tour."];
      L.push("Tour: " + (x ? x.title : "not sure yet, please suggest"));
      var d = f.querySelector("#p-date").value; if (d) L.push("Date: " + d);
      L.push("Guests: " + f.querySelector("#p-n").value);
      var p = f.querySelector("#p-pick").value.trim(); if (p) L.push("Pickup: " + p);
      if (x) { var s = [].slice.call(stops.querySelectorAll("input:checked")).map(function (c) { return x.hl[+c.getAttribute("data-s")]; }); if (s.length) L.push("Stops: " + s.join("; ")); }
      var n = f.querySelector("#p-notes").value.trim(); if (n) L.push("Notes: " + n);
      return L.join("\n");
    }
    function upd(flash) {
      var m = msg(); prev.textContent = m; f.querySelector("#p-send").href = wa(m);
      if (flash) { prev.classList.remove("flash"); void prev.offsetWidth; prev.classList.add("flash"); }
    }
    tour.addEventListener("change", function () { drawStops(); upd(true); });
    f.addEventListener("input", function () { upd(false); });
    f.addEventListener("change", function (e) {
      if (e.target.type === "checkbox") e.target.parentNode.classList.toggle("on", e.target.checked);
      upd(true);
    });
    drawStops(); upd(false);
  }
  function badges(x) {
    var b = [];
    if (x.kind === "package") b.push(t("s_year"));
    if (x.planb) b.push(t("s_alt"));
    if (x.swim) b.push(t("s_swim"));
    if (x.slug === "engelberg-mount-titlis-tour") b.push(t("s_snow"));
    if (/boat/i.test(x.hl.join(" ")) && x.kind !== "package") b.push(t("s_boat"));
    if (x.picnic) b.push(t("pic_t"));
    return b.map(function (s, i) { return '<span class="tag" data-rv="pop" data-d="' + (750 + i * 90) + '">' + s + "</span>"; }).join("");
  }

  /* ---------- sayfalar ---------- */
  function homeBody() {
    var feat = ["grindelwald-jungfrau-tour", "engelberg-mount-titlis-tour", "lucerne-mount-pilatus-tour", "blausee-and-oeschinensee-tour", "zurich-rhein-fall-tour", "swiss-dream-tour"].map(function (s) { return BY[s]; }).filter(Boolean);
    var ex = BY["grindelwald-jungfrau-tour"], alt = ex && BY[ex.planb];
    var mt = '<div class="mt">' + PLACES.map(function (p) { return "<b>" + esc(p) + "</b><em></em>"; }).join("") + "</div>";
    return '<section class="hero dark" id="hero"><div class="slides" data-par=".2">' +
      HERO.map(function (h, i) { return '<div class="slide' + (i ? "" : " on first") + '"><div class="img" style="background-image:url(images/' + h.img + '.jpg)"></div></div>'; }).join("") + '</div><div class="hero-shade"></div>' +
      '<div class="cap"><span id="cap">' + HERO[0].cap + '</span></div>' +
      '<div class="hp" id="hp">' + HERO.map(function (h, i) { return '<button type="button" data-i="' + i + '" aria-label="' + (i + 1) + '"><i></i></button>'; }).join("") + '<span id="hpn">01</span></div>' +
      '<div class="wrap hero-in"><div class="hl" id="hl">' +
      ["h1", "h2", "h3", "h4"].map(function (k, i) { var a = t(k); return '<div class="hl-set' + (i ? "" : " first") + '"><span class="ln">' + heroChars(a[0]) + '</span><span class="ln">' + heroChars(a[1]) + "</span></div>"; }).join("") +
      '</div><div class="hero-row"><p class="hero-sub" data-rv="up" data-d="900">' + t("hero_sub") + '</p><div class="hero-cta" data-rv="up" data-d="1050"><a class="btn fill" href="turlar.html" data-label="' + t("n_tours") + '">' + t("cta_tours") + '</a><a class="btn" href="#planla">' + t("cta_plan") + "</a></div></div></div>" +
      '<div class="cue" aria-hidden="true"><span>' + t("scroll") + "</span><i></i></div></section>" +
      '<section class="light sec"><div class="wrap"><p class="mani" data-rv="split">' + t("mani") + '</p><p class="mani-note" data-rv="up" data-d="350">' + t("mani_note") + '</p>' +
      '<div class="stats" data-rv="io"><div data-rv="up"><b data-count="19" data-rv="io">0</b><span>' + t("st1") + '</span></div><div data-rv="up"><b data-count="4" data-rv="io">0</b><span>' + t("st2") + '</span></div><div data-rv="up"><b data-count="6" data-rv="io">0</b><span>' + t("st3") + "</span></div></div>" +
      '<p class="meta" data-rv="up" data-d="200">' + [t("t_reg"), t("t_hr"), t("t_car")].map(function (s) { return "<span>" + s + "</span>"; }).join("") + "</p></div></section>" +
      '<div class="marq" data-marq aria-hidden="true"><div class="marq-in">' + mt + mt + "</div></div>" +
      '<section class="light" style="padding-block:clamp(70px,10vw,140px)"><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:34px;flex-wrap:wrap"><h2 class="h-lg" data-rv="split">' + t("sel") + '</h2><a class="btn" href="turlar.html" data-label="' + t("n_tours") + '" data-rv="up">' + t("all_tours") + " →</a></div>" + rowsHtml(feat) + "</div></section>" +
      '<section class="light" id="neden" style="padding-bottom:clamp(70px,10vw,140px)"><div class="wrap"><p class="label" data-rv="up">' + t("why_t") + '</p><div class="feat">' +
      [1, 2, 3, 4].map(function (n) { return '<div data-rv="up"><b>0' + n + "</b><h3>" + t("w" + n) + "</h3><p>" + t("w" + n + "t") + "</p></div>"; }).join("") + "</div></div></section>" +
      '<section class="dark sec"><div class="wrap two"><div><p class="label" data-rv="up">' + t("n_tours") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 18px">' + t("calc_t") + '</h2><p data-rv="up" data-d="300" style="opacity:.7;max-width:38ch">' + t("calc_s") + '</p></div><div class="card" data-rv="right">' + calcHtml("calc-home") + "</div></div></section>" +
      '<section class="band dark" data-rv="io"><div class="band-img" data-par=".16"><div class="band-bg" style="background-image:url(images/blausee.jpg)"></div></div><div class="wrap"><p class="label" data-rv="up">01</p><h2 class="h-xl" data-rv="split" style="margin-top:12px;font-size:clamp(40px,7vw,110px)">' + t("pic_t") + '</h2><p data-rv="up" data-d="350">' + t("pic_p") + '</p><p data-rv="up" data-d="450" style="font-size:14px;opacity:.7">' + t("pic_n") + "</p></div></section>" +
      '<section class="light sec"><div class="wrap two"><div><p class="label" data-rv="up">' + t("wx_label") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 18px">' + t("wx_t") + '</h2><p data-rv="up" data-d="300" style="opacity:.75;max-width:40ch">' + t("wx_p") + '</p></div>' +
      (ex && alt ? '<div class="card" data-rv="right"><div class="demo">' + t("wx_note") + '</div><p class="label">' + t("wx_if") + '</p><p style="font-size:24px;font-weight:700;margin:6px 0 16px">' + esc(ex.title) + '</p><p class="label">' + t("wx_instead") + '</p><a class="lnk" href="tur.html?id=' + alt.slug + '" data-label="' + esc(alt.title) + '" style="display:block;color:var(--red)">' + esc(alt.title) + " →</a></div>" : "") + "</div></section>" +
      '<section class="dark sec" id="planla"><div class="wrap two"><div><p class="label" data-rv="up">' + t("n_plan") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 18px">' + t("plan_t") + '</h2><p data-rv="up" data-d="300" style="opacity:.7;max-width:38ch">' + t("plan_p") + '</p></div><div class="card" data-rv="right">' + plannerHtml("") + "</div></div></section>" +
      '<section class="light sec" id="iletisim"><div class="wrap"><h2 class="h-xl" data-rv="split">' + t("c_t") + '</h2><p data-rv="up" data-d="300" style="margin:24px 0 30px;max-width:40ch;opacity:.75;font-size:18px">' + t("c_p") + '</p><div class="hero-cta" data-rv="up" data-d="450"><a class="btn red" href="' + wa("Hello Swissnova Travel") + '" target="_blank" rel="noopener">' + t("wa") + '</a><a class="btn" href="mailto:' + MAIL + '">' + MAIL + "</a></div></div></section>";
  }
  function toursBody() {
    var kinds = ["all", "lake", "mountain", "city", "package"];
    return '<section class="light" style="padding-top:150px;padding-bottom:clamp(70px,10vw,140px);min-height:100svh"><div class="wrap"><h1 class="h-xl" data-rv="split" style="margin-bottom:40px">' + t("n_tours") + '</h1><div class="tbar" data-rv="up" data-d="300"><div class="chips" id="chips">' +
      kinds.map(function (k) { return '<button type="button" class="chip' + (k === "all" ? " on" : "") + '" data-k="' + k + '">' + t("k_" + k) + "</button>"; }).join("") + '</div><p class="tcount"><b id="tcount">' + TOURS.length + "</b>" + (lang === "en" ? t("n_tours").toLowerCase() : t("n_tours")) + '</p></div><div id="tlist">' + rowsHtml(TOURS) + "</div></div></section>";
  }
  function tourBody(x) {
    var inc = x.incl.slice(), exc = x.excl.slice();
    var alt = x.planb && BY[x.planb];
    var idx = TOURS.indexOf(x), nx = TOURS[(idx + 1) % TOURS.length];
    return '<section class="thero dark' + (x.img ? "" : " nophoto") + '"><div class="thero-img" data-par=".2"><div class="thero-bg"' + (x.img ? ' style="background-image:url(' + photo(x.img) + ')"' : "") + '></div></div><div class="wrap"><a class="label back" href="turlar.html" data-label="' + t("n_tours") + '">' + t("back") + '</a><h1 class="h-xl" data-rv="split" data-d="150" style="font-size:clamp(34px,6.6vw,104px)">' + esc(x.title) + '</h1><p class="serif" data-rv="up" data-d="600" style="font-size:clamp(18px,2.2vw,30px);margin-top:14px;max-width:34em;opacity:.92">' + esc(x.sub) + '</p><div style="margin-top:18px">' + badges(x) + "</div></div></section>" +
      '<section class="light"><div class="wrap facts"><div data-rv="up"><p class="label">' + t("facts_p") + "</p>" +
      (x.kind === "package" ? '<div class="big" style="margin-top:14px">' + chf(x.price) + '</div><p class="hint" style="margin-top:8px;opacity:.7">' + t("pack_price") + " " + t("pay_tbc") + "</p>" : '<div style="margin-top:14px">' + calcHtml("calc-tour", true) + "</div>") +
      (x.priceCheck ? '<p class="demo" style="margin-top:12px">' + t("price_check") + "</p>" : "") + '</div>' +
      '<div data-rv="up" data-d="120"><p class="label">' + t("facts_t") + '</p><p style="font-size:22px;font-weight:700;margin:14px 0 6px">' + (x.kind === "package" ? "3 nights · 4 days" : t("pickup_time")) + '</p>' + (x.kind === "package" ? "" : '<p class="hint" style="opacity:.6;font-size:13px">' + t("pickup_note") + "</p>") + '<p class="label" style="margin-top:22px">' + t("facts_pick") + '</p><p style="margin-top:6px">' + esc(x.pickup) + '</p></div>' +
      '<div data-rv="up" data-d="240"><p class="label">Vehicle</p><p style="font-size:22px;font-weight:700;margin:14px 0 6px">' + t("vehicle") + '</p><a class="btn red" style="margin-top:20px" target="_blank" rel="noopener" href="' + wa("Hello Swissnova Travel, I have a question about: " + x.title) + '">' + t("book_wa") + "</a></div></div></section>" +
      '<section class="light" style="padding-bottom:clamp(50px,8vw,100px)"><div class="wrap"><div class="inex"><div><h2 class="h-lg" data-rv="split" style="font-size:clamp(26px,3.4vw,44px);margin-bottom:18px">' + t("inc") + '</h2><ul class="ck">' + inc.map(function (s) { return '<li data-rv="io">' + esc(s) + "</li>"; }).join("") + '</ul></div><div><h2 class="h-lg" data-rv="split" style="font-size:clamp(26px,3.4vw,44px);margin-bottom:18px">' + t("exc") + '</h2><ul class="ck no">' + exc.map(function (s) { return '<li data-rv="io">' + esc(s) + "</li>"; }).join("") + '<li data-rv="io">' + t("tips") + "</li></ul></div></div></div></section>" +
      '<section class="dark sec"><div class="wrap two"><div><p class="label" data-rv="up">' + (x.kind === "package" ? t("itin") : t("hl")) + '</p>' + (x.kind === "package" ? '<div class="days" style="margin-top:20px">' + DREAM_DAYS.map(function (d) { return '<div class="day" data-rv="io"><b>' + d[0] + "</b><p>" + esc(d[1]) + "</p></div>"; }).join("") + "</div>" : '<ul class="ck" style="margin-top:20px">' + x.hl.map(function (s) { return '<li data-rv="io">' + esc(s) + "</li>"; }).join("") + "</ul>") + "</div>" +
      '<div>' + (alt ? '<div class="card" data-rv="right" style="margin-bottom:24px"><div class="demo">' + t("wx_note") + '</div><p class="label">' + t("wx_label") + '</p><p style="margin:8px 0 12px;opacity:.8">' + t("wx_p") + '</p><a class="lnk" href="tur.html?id=' + alt.slug + '" data-label="' + esc(alt.title) + '" style="font-size:22px;color:#ff7a72">' + esc(alt.title) + " →</a></div>" : "") +
      (x.picnic ? '<div class="card" data-rv="right" data-d="120" style="margin-bottom:24px"><p class="label">' + t("pic_t") + '</p><p style="margin-top:8px;opacity:.85">' + t("pic_p") + "</p></div>" : "") + "</div></div></section>" +
      '<section class="light sec" id="planla"><div class="wrap two"><div><p class="label" data-rv="up">' + t("n_plan") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 18px">' + t("custom") + '</h2><p data-rv="up" data-d="300" style="opacity:.75;max-width:38ch">' + t("plan_p") + '</p></div><div class="card" data-rv="right">' + plannerHtml(x.slug) + "</div></div></section>" +
      '<a class="next dark" href="tur.html?id=' + nx.slug + '" data-label="' + esc(nx.title) + '" data-cur="' + t("view") + '"><div class="next-bg"' + (nx.img ? ' style="background-image:url(' + photo(nx.img) + ')"' : "") + '></div><div class="wrap"><p class="label">' + t("next") + '</p><span class="h-xl nx" data-rv="split" style="font-size:clamp(32px,6vw,96px)">' + esc(nx.title) + '<span class="arr">→</span></span></div></a>';
  }

  /* ---------- davranışlar ---------- */
  function behaviours() {
    var app = document.getElementById("app");
    [].forEach.call(app.querySelectorAll(".lang button"), function (b) {
      b.addEventListener("click", function () {
        var l = b.getAttribute("data-l"); if (l === lang) return;
        lang = l; try { localStorage.setItem("sn-lang", l); } catch (e) {}
        [].forEach.call(document.querySelectorAll(".lang"), function (w) {
          w.style.setProperty("--i", l === "de" ? 1 : 0);
          [].forEach.call(w.querySelectorAll("button"), function (x) { x.classList.toggle("on", x.getAttribute("data-l") === l); });
        });
        FX.swap(render);
      });
    });
    var rx = document.getElementById("ribx");
    function closeRib() { var r = document.getElementById("rib"); if (!r) return; r.classList.add("bye"); setTimeout(function () { r.remove(); }, 520); }
    if (rx) rx.addEventListener("click", closeRib);
    setTimeout(closeRib, 13000);   /* demo notu birkaç saniye sonra kendiliğinden çekilsin, düğmelerin üstünde kalmasın */
    wirePlanner();
    if (page === "home") wireCalc("calc-home");
    if (page === "tour") wireCalc("calc-tour", window.__cur.slug);
    if (page === "tours") {
      var cs = document.getElementById("chips"), tl = document.getElementById("tlist"), cnt = document.getElementById("tcount"), busy = false;
      cs.addEventListener("click", function (e) {
        var b = e.target.closest(".chip"); if (!b || busy || b.classList.contains("on")) return; busy = true;
        [].forEach.call(cs.children, function (c) { c.classList.toggle("on", c === b); });
        var k = b.getAttribute("data-k"), list = TOURS.filter(function (x) { return k === "all" || x.kind === k; });
        tl.classList.add("out");
        FX.tween(cnt, +cnt.textContent, list.length, 650, function (v) { return String(Math.round(v)); });
        setTimeout(function () { tl.innerHTML = rowsHtml(list); FX.enhance(tl, true); tl.classList.remove("out"); busy = false; }, 290);
      });
    }
  }

  /* ---------- hero: slayt + başlık + sayaç çubukları tek takvimle ---------- */
  var heroT = null, heroResume = null;
  function hero() {
    clearTimeout(heroT);
    var slides = [].slice.call(document.querySelectorAll(".slide")), sets = [].slice.call(document.querySelectorAll(".hl-set")),
        bars = [].slice.call(document.querySelectorAll(".hp button")), cap = document.getElementById("cap"), num = document.getElementById("hpn");
    if (!slides.length) return;
    var cur = 0, busy = false, DUR = 6500;
    function mark(i) {
      bars.forEach(function (b, k) { b.classList.remove("on"); if (k === i) { void b.offsetWidth; b.classList.add("on"); } });
      num.textContent = "0" + (i + 1);
    }
    function sched() { clearTimeout(heroT); heroT = setTimeout(function () { go((cur + 1) % slides.length); }, DUR); }
    function go(n) {
      if (busy || n === cur) return; busy = true;
      var s = slides[cur], ns = slides[n], o = sets[cur], nw = sets[n];
      slides.forEach(function (x) { x.classList.remove("first"); x.classList.remove("prev"); });
      s.classList.remove("on"); s.classList.add("prev"); ns.classList.add("on");
      setTimeout(function () { s.classList.remove("prev"); }, 1700);
      o.classList.remove("on"); o.classList.add("out");
      setTimeout(function () { o.classList.add("reset"); o.classList.remove("out"); void o.offsetWidth; o.classList.remove("reset"); }, 950);
      setTimeout(function () { nw.classList.add("on"); }, 430);
      cap.classList.add("swap"); setTimeout(function () { cap.textContent = HERO[n].cap; cap.classList.remove("swap"); }, 420);
      cur = n; mark(n); sched(); setTimeout(function () { busy = false; }, 1550);
    }
    bars.forEach(function (b) { b.addEventListener("click", function () { go(+b.getAttribute("data-i")); }); });
    sets[0].classList.add("on"); mark(0); sched();
    heroResume = function (vis) { if (vis) { mark(cur); sched(); } else clearTimeout(heroT); };
  }
  document.addEventListener("visibilitychange", function () { if (heroResume) heroResume(!document.hidden); });

  var booted = false;
  function preloadList() {
    if (page === "home") return [photo(HERO[0].img)];
    if (page === "tour" && window.__cur) return [photo(window.__cur.img)];
    return [];
  }
  function render() {
    document.documentElement.lang = lang;
    if (page === "home") chrome(homeBody());
    else if (page === "tours") chrome(toursBody());
    else { var id = new URLSearchParams(location.search).get("id"), x = BY[id] || TOURS[0]; window.__cur = x; chrome(tourBody(x)); }
    behaviours();
    FX.enhance(document.getElementById("app"));
    if (!booted) { booted = true; FX.boot({ preload: preloadList(), onReady: function () { if (page === "home") hero(); } }); }
    else if (page === "home") hero();
  }
  render();
})();
