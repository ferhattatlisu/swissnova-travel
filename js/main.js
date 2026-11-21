/* SwissNova Travel demo — içerik ve sayfa üretimi (menü, ana sayfa, tur listesi, tur sayfası, transfer sayfası, 404).
   Hareket katmanı js/fx.js içinde. Tur verisi js/tours-data.js (canlı siteden).
   Sayfalar tools/build.js ile önceden statik HTML'e de basılır (Google ve yapay zekâ botları JS çalıştırmadan okusun diye).
   Tarayıcıda bu dosya aynı içeriği yeniden çizer. Build sırasında window.__SN_BUILD__ tanımlıdır; o zaman DOM'a dokunulmaz.
   Adresler: ana sayfa ./ · turlar tours/ · tur tours/<slug>/ · transfer transfers/ (alt sayfalarda <base> kökü gösterir).
   Arayüz dilleri: EN / DE. DE çevirisi TASLAKTIR, yayından önce anadili konuşan biri kontrol etmeli. Tur metinleri yalnız İngilizce.
   Metinlerin kaynağı swissnovatravel.com (tur sayfaları, Hakkımızda, İptal politikası, Transfer sayfası); uydurma bilgi yok. */
(function () {
  "use strict";
  var BUILD = window.__SN_BUILD__ || null;
  var TOURS = window.TOURS || [];
  var BY = {}; TOURS.forEach(function (t) { BY[t.slug] = t; });
  var FX = window.FX || {   /* fx.js yüklenemezse sade yedek: her şey görünür kalır */
    chars: function (s) { return s; }, tween: function (el, a, b, d, f) { if (el) el.textContent = f(b); },
    enhance: function (r) { [].forEach.call(document.querySelectorAll("[data-rv]"), function (e) { e.classList.add("in"); }); },
    boot: function (o) { document.documentElement.classList.remove("is-loading", "mid-transition"); document.body.classList.add("ready"); if (o && o.onReady) o.onReady(); }, swap: function (f) { f(); },
    scrollTo: function (y) { window.scrollTo(0, y); }
  };
  var WA = "41767355560";               // Impressum'daki +41 76 735 55 60
  var MAIL = "info@swissnovatravel.com";
  var TEL = "+41767355560";                              // aynı numara (Impressum): arama bağlantısı için
  var IG = "https://www.instagram.com/swissnova_travel/", IGH = "@swissnova_travel";   // gerçek hesap (canlı sitedeki simgeler tema firmasına gidiyor, kullanılmadı)
  var LIVE = "https://www.swissnovatravel.com/";        // yasal sayfalar şimdilik canlı sitede
  var LEGAL = { imp: LIVE + "impressum-legal-notice/", priv: LIVE + "privacy-policy-3/", cancel: LIVE + "tour-cancellation-refund-policy/" };
  var page = BUILD ? BUILD.page : document.body.getAttribute("data-page");
  var slugAttr = BUILD ? BUILD.slug : document.body.getAttribute("data-slug");
  var cur = null;   // açık tur sayfasının turu

  var CREDITS = [
    ["pilatus-luzern", "Luzern lake view from Pilatus", "Ermell", "CC BY-SA 4.0"],
    ["jungfrau", "Eiger Mönch Jungfrau 01", "Kuebi (Armin Kübelbeck)", "CC BY-SA 3.0"],
    ["rheinfall", "Neuhausen Rhine Falls panorama 3", "Ymblanter", "CC BY-SA 4.0"],
    ["titlis", "Engelberg – Titlis und Fürenalb", "W. Bulach", "CC BY-SA 4.0"],
    ["blausee", "Blausee, Alpine Lake, Kandersteg", "Banu Srini", "CC BY-SA 4.0"]
  ];
  /* ilk slayt: mavi gökyüzü + dağ (ilk saniyede "İsviçre Alpleri" okunsun); yalnız ilk görsel hemen yüklenir */
  var HERO = [
    { img: "titlis", cap: "Engelberg, Central Switzerland" },
    { img: "pilatus-luzern", cap: "Lake Lucerne from Mount Pilatus" },
    { img: "blausee", cap: "Blausee, Kandersteg" },
    { img: "rheinfall", cap: "Rhine Falls, Neuhausen" }
  ];
  var PLACES = ["Lucerne", "Jungfrau", "Titlis", "Pilatus", "Rhine Falls", "Blausee", "Interlaken", "Lauterbrunnen", "Iseltwald", "Rigi", "Lungern", "Zurich", "Bern", "Basel", "Geneva", "Montreux"];
  var DREAM_DAYS = [
    ["Day 1", "Zurich Airport · Rheinfall · Zurich city tour · overnight in Flüelen"],
    ["Day 2", "Staubbach Falls · Stanserhorn · Rodelbahn Fräkigaudi · Rigi Kulm · Lucerne boat cruise & city · overnight in Lungern"],
    ["Day 3", "Rosenlaui · Giessbach Falls · Iseltwald · Lauterbrunnen & Wengen · Grindelwald (mountain bike) · overnight in Spiez"],
    ["Day 4", "Blausee · Thun · Bern · Basel city tour · Basel Airport"]
  ];
  /* canlı sitedeki misafir yorumları (aynen) */
  var REVIEWS = [
    ["If you want to experience the authentic beauty of Switzerland with warm hospitality and unforgettable memories, Swissnova should definitely be your choice.", "John Rios"],
    ["We had an amazing family trip in Switzerland with Swissnova Travel. Everything was perfectly organized, smooth, and truly family-friendly.", "Marianna Loreto"]
  ];
  /* canlı transfer sayfasındaki popüler güzergâhlar; s = formda seçilecek hizmet sırası */
  var ROUTES = [
    { k: "rt_air", s: 0, r: [["Zurich Airport", "Lucerne"], ["Zurich Airport", "Interlaken"], ["Zurich Airport", "Bern"], ["Zurich Airport", "Geneva"], ["Basel Airport", "Lucerne"], ["Geneva Airport", "Montreux"], ["Geneva Airport", "Lausanne"]] },
    { k: "rt_alp", s: 3, r: [["Zurich", "Zermatt region (Täsch)"], ["Zurich", "St. Moritz"], ["Zurich", "Grindelwald"], ["Zurich", "Lugano"], ["Lucerne", "Engelberg"], ["Lucerne", "Andermatt"], ["Geneva", "Verbier"]] },
    { k: "rt_int", s: 1, r: [["Zurich", "Milan"], ["Zurich", "Lake Como"], ["Zurich", "Munich"], ["Zurich", "Paris"], ["Geneva", "Chamonix"], ["Geneva", "Annecy"], ["Lucerne", "Milan"]] }
  ];

  var I = {
    en: {
      n_tours: "Tours", n_transfers: "Transfers", n_why: "Why us", n_plan: "Plan your day", n_faq: "FAQ", n_contact: "Contact", wa: "WhatsApp", menu: "Menu", call: "Call", scroll: "Scroll", view: "View",
      h1_sr: "Private day tours in the Swiss Alps from Lucerne, Zurich and Interlaken",
      h1: ["PRIVATE DAYS", "IN THE ALPS"], h2: ["YOUR PACE", "YOUR ROUTE"], h3: ["ONE VAN", "ONE DAY"], h4: ["LAKES PEAKS", "AND PICNICS"],
      pause: "Pause slideshow", play: "Play slideshow",
      hero_sub: "Private day tours from Lucerne, Zurich and Interlaken in a Mercedes V-Class. Up to six guests, one group price.",
      cta_tours: "See the tours", cta_plan: "Plan your day",
      t_reg: "Kapti Swissnova Travel", t_form: "Sole proprietorship, Lucerne", t_hr: "Commercial register Canton Lucerne · CHE-204.582.938", t_car: "Mercedes-Benz V-Class · up to 6 guests",
      mani: "Every tour is private. One <u>Mercedes V-Class</u>, up to <u>six guests</u>, pickup and drop-off at your <u>hotel</u>, and a <u>picnic</u> where the lake or the peak is.",
      mani_note: "Flexible schedule, several stops, your pace. Tell us what you want to see and we shape the day around it.",
      st1: "Private day tours", st3: "Guests per vehicle", st_cancel: "Days of free cancellation",
      sel: "Selected tours", all_tours: "All tours", per_group: "per group", per_person: "per person", up6: "up to 6 guests",
      k_lake: "Lakes", k_mountain: "Mountains", k_city: "Cities", k_package: "4-day package", k_all: "All",
      tours_h1: "Private tours", tours_word: "tours",
      why_t: "Why Swissnova", w1: "Private, always", w1t: "Your group only. The price is for the whole vehicle, up to six guests.", w2: "Hotel to hotel", w2t: "Pickup and drop-off at your accommodation in Lucerne, Zurich, Interlaken or nearby.", w3: "A picnic on the way", w3t: "On most tours we prepare a private picnic. Vegetarian options on request.", w4: "Your day, your stops", w4t: "Add or remove stops and change the schedule. The price may change with the changes.",
      how_label: "How booking works", how_t: "Four steps to your day",
      how1: "Send a request", how1t: "Pick a tour, a date and the number of guests. On WhatsApp or by e-mail, whatever is easier for you.",
      how2: "Get it in writing", how2t: "We check availability and confirm the final price and pickup time in writing.",
      how3: "Secure it with 20%", how3t: "A 20% deposit confirms the booking. The balance follows the schedule in your confirmation.",
      how4: "Enjoy the day", how4t: "We pick you up at your hotel, drive you through the day and bring you back.",
      cancel_t: "Free cancellation up to 15 days before", cancel_p: "Closer to the date the fee is only a share of the 20% deposit, never the full price.", cancel_link: "Full cancellation policy",
      c_head: ["Cancellation before the tour", "Fee"], c_rows: [["15 days or more", "Free"], ["7–14 days", "25% of deposit"], ["3–6 days", "35% of deposit"], ["2 days", "50% of deposit"], ["0–1 day or no-show", "100% of deposit"]],
      calc_t: "What does a tour cost per person?", calc_s: "The price is per group. Move the slider to see the share per guest.", guests: "Guests", each: "each", approx: "about", calc_note: "Tickets for cable cars, trains and entrances are listed separately on each tour.",
      pack_price: "per person, based on a group of 6 (minimum 4 travelers)",
      pic_label: "On most tours", pic_t: "The picnic", pic_p: "Most tours include a private picnic prepared to your preferences: Swiss cheese and local specialties, fresh bread, seasonal fruit, light snacks. Vegetarian options on request.", pic_n: "City tours do not include a picnic.",
      story_label: "Our story", story_t: "A family business from Lucerne",
      story_p: "Swissnova Travel was born from our family's love for Switzerland: its mountains and lakes, and also its precision, its respect for nature and its honesty. We welcome every guest the way we would welcome friends at home.",
      story_p2: "Many of our guests came as customers and left as friends.", rev_label: "What guests say",
      wx_t: "If the weather turns", wx_p: "Mountain weather changes fast. On high-altitude tours we can suggest a nearby alternative for the same day.", wx_label: "Weather plan B", wx_instead: "Plan B for this tour", wx_if: "If the mountain is clouded in:",
      trt_t: "Straight from the airport to your hotel", trt_p: "Airport transfers, city-to-city rides and a chauffeur for the whole day, in the same Mercedes V-Class.", trt_btn: "See transfers",
      plan_t: "Plan your day", plan_p: "Choose a tour, change the stops, tell us the date. We receive it on WhatsApp and reply with availability.", f_tour: "Tour", f_custom: "Not sure yet, show me ideas", f_date: "Date", f_date_ph: "Select a date", f_guests: "Guests", f_pick: "Pickup hotel or area", f_stops: "Stops you want", f_notes: "Anything else", send: "Send on WhatsApp", or_mail: "or send by e-mail", not_booking: "This is a request, not a confirmed booking.", msg_prev: "Message preview",
      g7: "7 or more", g7_note: "More than six guests? Tell us, we arrange a suitable vehicle on request.",
      faq_t: "Questions before you book",
      faq: [
        ["Is the price per person or per group?", "Per group. The price covers the whole private vehicle for up to six guests, so the more you are, the less each person pays. The 4-day Swiss Dream Tour is priced per person."],
        ["What is included?", "Private hotel pickup and drop-off, the Mercedes V-Class with a professional driver and tour assistance, fuel, parking and road costs, and on most tours a private picnic."],
        ["What is not included?", "Cable cars, mountain trains, boats and entrance tickets (listed on each tour), plus tips and personal expenses."],
        ["Where do you pick us up?", "At your hotel or accommodation in Lucerne, Zurich, Interlaken or nearby. The Lake Geneva tour starts from Geneva or Lausanne."],
        ["Can we change the stops?", "Yes. Add or remove stops and change the schedule. The price may change with bigger changes."],
        ["What happens if the weather is bad?", "Mountain weather changes fast. We can suggest a nearby alternative, adjust the times or move the tour to another date. If severe weather or an official closure makes the tour unsafe, we look for an alternative or a refund under our cancellation policy."],
        ["How do we book and pay?", "Send a request on WhatsApp or by e-mail. We confirm in writing, and a 20% deposit secures the booking. Prices are in Swiss francs (CHF)."],
        ["Can we cancel?", "Yes, free of charge up to 15 days before the tour. After that the fee is only a share of the 20% deposit."],
        ["We are more than six people.", "Write to us. For larger groups we arrange a suitable vehicle on request."]
      ],
      c_t: "Talk to us", c_p: "WhatsApp is the fastest way. We answer by e-mail and phone as well.",
      back: "← All tours", next: "Next tour", facts_p: "Price", facts_t: "Schedule", facts_pick: "Pickup areas", day_val: "Day tour · start time agreed with you", pkg_days: "3 nights · 4 days",
      vehicle_l: "Vehicle", vehicle: "Mercedes-Benz V-Class · up to 6 guests · private",
      inc: "Included", exc: "Not included", tips: "Tips and personal expenses", hl: "Highlights", book_wa: "Ask about this tour", custom: "Customize this tour", good_t: "Good to know",
      s_year: "Year-round, winter alternatives", s_swim: "Swimming, weather permitting", s_alt: "High altitude, weather dependent", s_snow: "Snow and ice all year", s_boat: "Boat on the lake",
      itin: "Itinerary",
      tr_label: "Private transfers", tr_h: "Private transfers across Switzerland",
      tr_sub: "Airport pickups, city-to-city rides and full-day chauffeur service in a Mercedes V-Class. Every route is quoted individually.",
      tr_cta: "Request a quote", tr_sv: "Transfer services",
      tr_svcs: [
        ["Airport transfers", "Zurich, Geneva, Basel and Bern. Send your flight number, the number of guests and your luggage, we plan the pickup."],
        ["City to city", "Between Swiss cities, lake towns and Alpine regions, without changing trains or carrying luggage."],
        ["Full-day chauffeur", "A private vehicle for a few hours, a full day or several days: sightseeing, shopping or meetings."],
        ["Ski and Alpine resorts", "Grindelwald, Engelberg, Andermatt, Davos, St. Moritz, Verbier and the Zermatt region (road transfers end in Täsch)."],
        ["Weddings and events", "Rides between hotels, venues and restaurants for weddings, birthdays and private celebrations."],
        ["Business and groups", "Executives, delegations, school and university trips. Larger vehicles on request."]
      ],
      routes_t: "Popular routes", routes_p: "Tap a route and it goes straight into the request form.", rt_air: "Airports", rt_alp: "Alps and resorts", rt_int: "Across the border",
      route_note: "Every route is quoted individually. Zermatt is car-free: road transfers end in Täsch and onward travel is arranged separately.",
      tr_facts: [["Vehicle", "Mercedes-Benz V-Class · up to 6 guests"], ["Price", "Individual quote for every route"], ["Hours", "Early morning and late night on request"]],
      tr_form_t: "Request a transfer", tr_form_p: "Fill in what you know. We reply on WhatsApp with a quote.",
      f_service: "Service", f_from: "From", f_to: "To", f_time: "Pickup time", f_bags: "Suitcases", f_flight: "Flight number (optional)",
      tr_opts: ["Airport transfer", "City to city", "Full-day chauffeur", "Ski or Alpine resort", "Wedding or event", "Business or group"],
      tr_faq: [
        ["Which airports do you serve?", "Zurich, Geneva and Basel, and other selected airports on request."],
        ["Can I book a driver for a full day?", "Yes. Full-day and multi-day arrangements are possible for sightseeing, business and private travel."],
        ["Do you drive to Zermatt?", "Zermatt is car-free, so road transfers end in Täsch. Onward travel to Zermatt is arranged separately."],
        ["Do you drive abroad?", "Selected trips to Italy, France, Germany and Austria can be requested, subject to confirmation."],
        ["Do you have child seats?", "Tell us the ages of the children when you ask for a quote and we plan the seats."],
        ["How is the price calculated?", "By route, vehicle, date, number of guests, duration and extra requests. You receive an individual quote before you book."],
        ["Early morning or late at night?", "Yes, on request. Availability and any extra charge are confirmed with the quote."]
      ],
      nf_t: "Page not found", nf_p: "This page does not exist. Our tours are one click away.",
      f_legal: "Legal", f_cancel: "Cancellation policy", f_imp: "Impressum", f_priv: "Privacy policy", f_loc: "Lucerne, Switzerland",
      foot_p: "Private day tours and transfers in Switzerland.", foot_demo: "Demo design. Content taken from swissnovatravel.com on 19 Nov 2026, not yet approved.", photos: "Photos: Wikimedia Commons, representative only, to be replaced with Swissnova's own pictures."
    },
    de: {
      n_tours: "Touren", n_transfers: "Transfers", n_why: "Warum wir", n_plan: "Tag planen", n_faq: "FAQ", n_contact: "Kontakt", wa: "WhatsApp", menu: "Menü", call: "Anrufen", scroll: "Scrollen", view: "Ansehen",
      h1_sr: "Private Tagestouren in den Schweizer Alpen ab Luzern, Zürich und Interlaken",
      h1: ["PRIVATE TAGE", "IN DEN ALPEN"], h2: ["IHR TEMPO", "IHRE ROUTE"], h3: ["EIN VAN", "EIN TAG"], h4: ["SEEN GIPFEL", "UND PICKNICK"],
      pause: "Diashow anhalten", play: "Diashow abspielen",
      hero_sub: "Private Tagestouren ab Luzern, Zürich und Interlaken im Mercedes V-Klasse. Bis zu sechs Gäste, ein Gruppenpreis.",
      cta_tours: "Touren ansehen", cta_plan: "Tag planen",
      t_reg: "Kapti Swissnova Travel", t_form: "Einzelunternehmen, Luzern", t_hr: "Handelsregister Kanton Luzern · CHE-204.582.938", t_car: "Mercedes-Benz V-Klasse · bis 6 Gäste",
      mani: "Jede Tour ist privat. Eine <u>V-Klasse</u>, bis zu <u>sechs Gäste</u>, Abholung und Rückfahrt am <u>Hotel</u> und ein <u>Picknick</u> am See oder auf dem Berg.",
      mani_note: "Flexibler Ablauf, mehrere Stopps, Ihr Tempo. Sagen Sie uns, was Sie sehen möchten, wir gestalten den Tag danach.",
      st1: "Private Tagestouren", st3: "Gäste pro Fahrzeug", st_cancel: "Tage kostenlose Stornierung",
      sel: "Ausgewählte Touren", all_tours: "Alle Touren", per_group: "pro Gruppe", per_person: "pro Person", up6: "bis zu 6 Gäste",
      k_lake: "Seen", k_mountain: "Berge", k_city: "Städte", k_package: "4-Tage-Paket", k_all: "Alle",
      tours_h1: "Private Touren", tours_word: "Touren",
      why_t: "Warum Swissnova", w1: "Immer privat", w1t: "Nur Ihre Gruppe. Der Preis gilt für das ganze Fahrzeug, bis zu sechs Gäste.", w2: "Von Hotel zu Hotel", w2t: "Abholung und Rückfahrt an Ihrer Unterkunft in Luzern, Zürich, Interlaken oder Umgebung.", w3: "Picknick unterwegs", w3t: "Auf den meisten Touren bereiten wir ein privates Picknick vor. Vegetarisch auf Anfrage.", w4: "Ihr Tag, Ihre Stopps", w4t: "Stopps hinzufügen oder streichen und den Ablauf ändern. Der Preis kann sich ändern.",
      how_label: "So funktioniert die Buchung", how_t: "In vier Schritten zu Ihrem Tag",
      how1: "Anfrage senden", how1t: "Tour, Datum und Anzahl Gäste wählen. Per WhatsApp oder E-Mail, wie es Ihnen lieber ist.",
      how2: "Schriftlich bestätigt", how2t: "Wir prüfen die Verfügbarkeit und bestätigen Endpreis und Abholzeit schriftlich.",
      how3: "Mit 20 % sichern", how3t: "Eine Anzahlung von 20 % bestätigt die Buchung. Der Rest folgt gemäss Ihrer Bestätigung.",
      how4: "Den Tag geniessen", how4t: "Wir holen Sie im Hotel ab, fahren Sie durch den Tag und bringen Sie zurück.",
      cancel_t: "Kostenlos stornieren bis 15 Tage vorher", cancel_p: "Danach berechnen wir nur einen Teil der Anzahlung von 20 %, nie den vollen Preis.", cancel_link: "Vollständige Stornobedingungen",
      c_head: ["Stornierung vor der Tour", "Gebühr"], c_rows: [["15 Tage oder mehr", "Kostenlos"], ["7–14 Tage", "25 % der Anzahlung"], ["3–6 Tage", "35 % der Anzahlung"], ["2 Tage", "50 % der Anzahlung"], ["0–1 Tag oder Nichterscheinen", "100 % der Anzahlung"]],
      calc_t: "Was kostet eine Tour pro Person?", calc_s: "Der Preis gilt pro Gruppe. Mit dem Regler sehen Sie den Anteil pro Gast.", guests: "Gäste", each: "pro Person", approx: "etwa", calc_note: "Tickets für Bergbahnen, Züge und Eintritte sind bei jeder Tour separat aufgeführt.",
      pack_price: "pro Person, basierend auf 6 Personen (mind. 4 Reisende)",
      pic_label: "Bei den meisten Touren", pic_t: "Das Picknick", pic_p: "Die meisten Touren enthalten ein privates Picknick nach Ihren Wünschen: Schweizer Käse und lokale Spezialitäten, frisches Brot, Saisonfrüchte, kleine Snacks. Vegetarisch auf Anfrage.", pic_n: "Städtetouren enthalten kein Picknick.",
      story_label: "Über uns", story_t: "Ein Familienbetrieb aus Luzern",
      story_p: "Swissnova Travel ist aus der Liebe unserer Familie zur Schweiz entstanden: zu ihren Bergen und Seen, aber auch zu Präzision, Respekt vor der Natur und Ehrlichkeit. Wir empfangen jeden Gast so, wie wir Freunde bei uns zu Hause empfangen würden.",
      story_p2: "Viele kamen als Gäste und gingen als Freunde.", rev_label: "Das sagen Gäste",
      wx_t: "Wenn das Wetter kippt", wx_p: "Das Bergwetter ändert sich schnell. Bei Touren in grosser Höhe schlagen wir eine nahe Alternative für denselben Tag vor.", wx_label: "Wetter-Plan B", wx_instead: "Plan B für diese Tour", wx_if: "Wenn der Berg in Wolken steckt:",
      trt_t: "Vom Flughafen direkt ins Hotel", trt_p: "Flughafentransfers, Fahrten von Stadt zu Stadt und ein Chauffeur für den ganzen Tag, im selben Mercedes V-Klasse.", trt_btn: "Transfers ansehen",
      plan_t: "Tag planen", plan_p: "Tour wählen, Stopps anpassen, Datum angeben. Die Anfrage kommt per WhatsApp, wir melden uns mit der Verfügbarkeit.", f_tour: "Tour", f_custom: "Noch unsicher, zeigt mir Ideen", f_date: "Datum", f_date_ph: "Datum wählen", f_guests: "Gäste", f_pick: "Abholhotel oder Gebiet", f_stops: "Gewünschte Stopps", f_notes: "Sonstiges", send: "Per WhatsApp senden", or_mail: "oder per E-Mail senden", not_booking: "Dies ist eine Anfrage, keine bestätigte Buchung.", msg_prev: "Nachrichtenvorschau",
      g7: "7 oder mehr", g7_note: "Mehr als sechs Gäste? Schreiben Sie uns, wir organisieren auf Anfrage ein passendes Fahrzeug.",
      faq_t: "Fragen vor der Buchung",
      faq: [
        ["Gilt der Preis pro Person oder pro Gruppe?", "Pro Gruppe. Der Preis gilt für das ganze private Fahrzeug mit bis zu sechs Gästen, je mehr Sie sind, desto weniger zahlt jede Person. Die 4-tägige Swiss Dream Tour wird pro Person berechnet."],
        ["Was ist inbegriffen?", "Abholung und Rückfahrt am Hotel, der Mercedes V-Klasse mit Fahrer und Tourbegleitung, Treibstoff, Parkgebühren und Strassenkosten sowie bei den meisten Touren ein privates Picknick."],
        ["Was ist nicht inbegriffen?", "Bergbahnen, Züge, Schiffe und Eintritte (bei jeder Tour aufgeführt) sowie Trinkgeld und persönliche Ausgaben."],
        ["Wo holen Sie uns ab?", "An Ihrem Hotel oder Ihrer Unterkunft in Luzern, Zürich, Interlaken oder Umgebung. Die Genfersee-Tour startet in Genf oder Lausanne."],
        ["Können wir die Stopps ändern?", "Ja. Stopps hinzufügen oder streichen und den Ablauf ändern. Bei grösseren Änderungen kann sich der Preis ändern."],
        ["Was passiert bei schlechtem Wetter?", "Das Bergwetter ändert sich schnell. Wir schlagen eine nahe Alternative vor, passen die Zeiten an oder verschieben die Tour. Macht schweres Wetter oder eine behördliche Sperrung die Tour unsicher, suchen wir gemäss Stornobedingungen eine Alternative oder eine Rückerstattung."],
        ["Wie buchen und bezahlen wir?", "Anfrage per WhatsApp oder E-Mail senden. Wir bestätigen schriftlich, eine Anzahlung von 20 % sichert die Buchung. Die Preise sind in Schweizer Franken (CHF)."],
        ["Können wir stornieren?", "Ja, bis 15 Tage vor der Tour kostenlos. Danach wird nur ein Teil der Anzahlung von 20 % berechnet."],
        ["Wir sind mehr als sechs Personen.", "Schreiben Sie uns. Für grössere Gruppen organisieren wir auf Anfrage ein passendes Fahrzeug."]
      ],
      c_t: "Schreiben Sie uns", c_p: "Am schnellsten per WhatsApp. Wir antworten auch per E-Mail und Telefon.",
      back: "← Alle Touren", next: "Nächste Tour", facts_p: "Preis", facts_t: "Ablauf", facts_pick: "Abholgebiete", day_val: "Tagestour · Startzeit nach Absprache", pkg_days: "3 Nächte · 4 Tage",
      vehicle_l: "Fahrzeug", vehicle: "Mercedes-Benz V-Klasse · bis 6 Gäste · privat",
      inc: "Inbegriffen", exc: "Nicht inbegriffen", tips: "Trinkgeld und persönliche Ausgaben", hl: "Highlights", book_wa: "Zu dieser Tour fragen", custom: "Tour anpassen", good_t: "Gut zu wissen",
      s_year: "Ganzjährig, Winteralternativen", s_swim: "Baden, wetterabhängig", s_alt: "Grosse Höhe, wetterabhängig", s_snow: "Ganzjährig Schnee und Eis", s_boat: "Boot auf dem See",
      itin: "Programm",
      tr_label: "Private Transfers", tr_h: "Private Transfers in der ganzen Schweiz",
      tr_sub: "Flughafenabholung, Fahrten von Stadt zu Stadt und Chauffeur für den ganzen Tag im Mercedes V-Klasse. Jede Strecke wird individuell offeriert.",
      tr_cta: "Offerte anfragen", tr_sv: "Unsere Transfers",
      tr_svcs: [
        ["Flughafentransfers", "Zürich, Genf, Basel und Bern. Senden Sie Flugnummer, Anzahl Gäste und Gepäck, wir planen die Abholung."],
        ["Von Stadt zu Stadt", "Zwischen Schweizer Städten, Seeorten und Alpenregionen, ohne Umsteigen und ohne Koffer schleppen."],
        ["Chauffeur für den Tag", "Ein privates Fahrzeug für einige Stunden, einen ganzen oder mehrere Tage: Sightseeing, Shopping oder Termine."],
        ["Ski- und Alpenorte", "Grindelwald, Engelberg, Andermatt, Davos, St. Moritz, Verbier und die Region Zermatt (Strassentransfers enden in Täsch)."],
        ["Hochzeiten und Anlässe", "Fahrten zwischen Hotel, Location und Restaurant für Hochzeiten, Geburtstage und private Feiern."],
        ["Business und Gruppen", "Geschäftsreisende, Delegationen, Schul- und Uni-Ausflüge. Grössere Fahrzeuge auf Anfrage."]
      ],
      routes_t: "Beliebte Strecken", routes_p: "Strecke antippen, sie landet direkt im Anfrageformular.", rt_air: "Flughäfen", rt_alp: "Alpen und Resorts", rt_int: "Über die Grenze",
      route_note: "Jede Strecke wird individuell offeriert. Zermatt ist autofrei: Strassentransfers enden in Täsch, die Weiterreise wird separat organisiert.",
      tr_facts: [["Fahrzeug", "Mercedes-Benz V-Klasse · bis 6 Gäste"], ["Preis", "Individuelle Offerte für jede Strecke"], ["Zeiten", "Früh morgens und spät abends auf Anfrage"]],
      tr_form_t: "Transfer anfragen", tr_form_p: "Füllen Sie aus, was Sie wissen. Wir antworten per WhatsApp mit einer Offerte.",
      f_service: "Leistung", f_from: "Von", f_to: "Nach", f_time: "Abholzeit", f_bags: "Koffer", f_flight: "Flugnummer (optional)",
      tr_opts: ["Flughafentransfer", "Von Stadt zu Stadt", "Chauffeur für den Tag", "Ski- oder Alpenort", "Hochzeit oder Anlass", "Business oder Gruppe"],
      tr_faq: [
        ["Welche Flughäfen bedienen Sie?", "Zürich, Genf und Basel sowie weitere Flughäfen auf Anfrage."],
        ["Kann ich einen Fahrer für den ganzen Tag buchen?", "Ja. Ganztägige und mehrtägige Einsätze sind für Sightseeing, Geschäftsreisen und private Reisen möglich."],
        ["Fahren Sie nach Zermatt?", "Zermatt ist autofrei, Strassentransfers enden deshalb in Täsch. Die Weiterreise nach Zermatt wird separat organisiert."],
        ["Fahren Sie auch ins Ausland?", "Ausgewählte Fahrten nach Italien, Frankreich, Deutschland und Österreich sind auf Anfrage und nach Bestätigung möglich."],
        ["Haben Sie Kindersitze?", "Nennen Sie uns bei der Anfrage das Alter der Kinder, wir planen die Sitze."],
        ["Wie wird der Preis berechnet?", "Nach Strecke, Fahrzeug, Datum, Anzahl Gäste, Dauer und Zusatzwünschen. Sie erhalten vor der Buchung eine individuelle Offerte."],
        ["Früh morgens oder spät abends?", "Ja, auf Anfrage. Verfügbarkeit und allfällige Zuschläge bestätigen wir mit der Offerte."]
      ],
      nf_t: "Seite nicht gefunden", nf_p: "Diese Seite gibt es nicht. Unsere Touren sind nur einen Klick entfernt.",
      f_legal: "Rechtliches", f_cancel: "Stornobedingungen", f_imp: "Impressum", f_priv: "Datenschutz", f_loc: "Luzern, Schweiz",
      foot_p: "Private Tagestouren und Transfers in der Schweiz.", foot_demo: "Demo-Design. Inhalte von swissnovatravel.com (19.11.2026), noch nicht freigegeben.", photos: "Fotos: Wikimedia Commons, nur stellvertretend, werden durch eigene Bilder von Swissnova ersetzt."
    }
  };

  var lang = "en";
  if (!BUILD) { try { var saved = localStorage.getItem("sn-lang"); lang = (saved === "en" || saved === "de") ? saved : (/^de/i.test(navigator.language) ? "de" : "en"); } catch (e) {} }
  function t(k) { var v = (I[lang] && I[lang][k]); return v == null ? I.en[k] : v; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function chf(n) { return "CHF " + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "’"); }
  function photo(x) { return x ? "images/" + x + ".jpg" : ""; }
  function thumb(x) { return x ? "images/sm/" + x + ".jpg" : ""; }
  function wa(msg) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg); }
  function kindLabel(k) { return t("k_" + k); }
  function tourUrl(s) { return "tours/" + s + "/"; }
  function anchor(id) { return (page === "home" ? "" : "./") + "#" + id; }
  function guestsTxt(v) { return v === "7" ? "7 or more (please suggest a vehicle)" : v; }
  function waIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/><path class="h" d="M8.4 7.6c-.5 1-.4 2.2.6 3.6 1.2 1.7 2.6 2.8 4.3 3.3 1 .3 2-.2 2.3-1l-1.7-1-.9.8c-.9-.3-2.2-1.5-2.8-2.5l.8-.8-.9-1.9z"/></svg>'; }
  function igIcon() { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>'; }
  /* hero başlığı: her satır harf harf (FX.chars ile aynı biçim) */
  function heroChars(s) {
    var n = 0;
    return String(s).split(" ").map(function (w) { return '<span class="w">' + w.split("").map(function (c) { return '<i style="--c:' + (n++) + '">' + esc(c) + "</i>"; }).join("") + "</span>"; }).join(" ");
  }
  var DAY_TOURS = TOURS.filter(function (x) { return x.kind !== "package"; });
  var MIN_PRICE = Math.min.apply(null, DAY_TOURS.map(function (x) { return x.price; }));
  var MAX_PRICE = Math.max.apply(null, DAY_TOURS.map(function (x) { return x.price; }));

  /* ---------- sayfa başlığı ve açıklaması (build.js de bunları kullanır) ---------- */
  function seo() {
    var S = " | Swissnova Travel";
    if (page === "tour" && cur) {
      var pkg = cur.kind === "package";
      var near = cur.pickup.replace(/,? or nearby areas$/, " and nearby").replace(/,? or /, " or ");
      return {
        title: cur.title + (pkg ? " – 4-Day Private Trip in Switzerland" : " – Private Tour") + S,
        desc: cur.sub + ". " + (pkg
          ? chf(cur.price) + " per person based on a group of six (minimum four travellers). Airport transfers, hotels with breakfast and the activities on the itinerary included."
          : "Private tour for up to 6 guests in a Mercedes V-Class, " + chf(cur.price) + " per group. Hotel pickup in " + near + (cur.picnic ? ", private picnic included." : "."))
      };
    }
    if (page === "tours") return { title: "Private Tours in Switzerland: Lakes, Mountains and Cities" + S, desc: TOURS.length + " private tours from Lucerne, Zurich, Interlaken and Geneva: lakes, mountains, cities and a 4-day trip. " + chf(MIN_PRICE) + "–" + chf(MAX_PRICE).replace("CHF ", "") + " per group for up to 6 guests." };
    if (page === "transfers") return { title: "Private Transfers in Switzerland: Airport, City and Chauffeur" + S, desc: "Private airport transfers from Zurich, Geneva and Basel, city-to-city rides, ski resort transfers and full-day chauffeur in a Mercedes V-Class. Individual quote for every route." };
    if (page === "home") return { title: "Private Day Tours from Lucerne, Zurich and Interlaken" + S, desc: "Private day tours in Switzerland in a Mercedes V-Class for up to 6 guests, from " + chf(MIN_PRICE) + " per group. Hotel pickup, picnic, flexible stops. Family-run in Lucerne." };
    return { title: "Page not found" + S, desc: "This page does not exist. See the private tours of Swissnova Travel." };
  }

  /* ---------- ortak: menü, altbilgi ---------- */
  function langSwitch() {
    return '<span class="lang" style="--i:' + (lang === "de" ? 1 : 0) + '"><i class="thumb"></i>' +
      ["en", "de"].map(function (l) { return '<button type="button" data-l="' + l + '" class="' + (l === lang ? "on" : "") + '" aria-pressed="' + (l === lang) + '">' + l.toUpperCase() + "</button>"; }).join("") + "</span>";
  }
  function nav() {
    var onT = (page === "tours" || page === "tour") ? " on" : "", onX = page === "transfers" ? " on" : "";
    return '<div class="nav" id="nav"><a class="logo" href="./" aria-label="Swissnova Travel"><span class="logo-a">Swissnova</span><i>Travel</i></a><div class="pills">' +
      '<a class="pill' + onT + '" href="tours/">' + t("n_tours") + '</a>' +
      '<a class="pill' + onX + '" href="transfers/">' + t("n_transfers") + '</a>' +
      '<a class="pill" href="' + anchor("why") + '">' + t("n_why") + '</a>' +
      '<a class="pill" href="' + anchor("plan") + '">' + t("n_plan") + '</a>' +
      langSwitch() +
      '<a class="pill wa" href="' + wa("Hello Swissnova Travel") + '" target="_blank" rel="noopener">' + t("wa") + '</a>' +
      '<button class="burger" id="burger" type="button" aria-label="' + t("menu") + '" aria-expanded="false" aria-controls="menu"><i></i><i></i></button></div></div>';
  }
  function menu() {
    var items = [["tours/", t("n_tours")], ["transfers/", t("n_transfers")], [anchor("why"), t("n_why")], [anchor("plan"), t("n_plan")], [anchor("faq"), t("n_faq")], [anchor("contact"), t("n_contact")]];
    return '<div class="menu" id="menu"><nav>' + items.map(function (it, i) {
      return '<a href="' + it[0] + '" style="--i:' + i + '"><span class="mk"><b>' + esc(it[1]) + '</b></span><em>0' + (i + 1) + "</em></a>";
    }).join("") + '</nav><div class="menu-foot">' + langSwitch() + '<a href="' + wa("Hello Swissnova Travel") + '" target="_blank" rel="noopener">' + t("wa") + ' +41 76 735 55 60</a><a href="mailto:' + MAIL + '">' + MAIL + '</a><a href="' + IG + '" target="_blank" rel="noopener">Instagram ' + IGH + "</a></div></div>";
  }
  function footer() {
    return '<footer class="foot dark"><div class="wrap"><div class="fw" data-rv="chars" aria-hidden="true">SWISSNOVA</div><div class="cols"><div><div class="logo flogo" style="font-size:26px">Swissnova<i>Travel</i></div><p style="margin-top:12px;opacity:.7;max-width:36ch">' + t("foot_p") + '</p><p style="margin-top:8px;opacity:.7">' + t("f_loc") + '</p></div>' +
      '<div><p class="label" style="margin-bottom:10px">' + t("n_contact") + '</p><a href="' + wa("Hello Swissnova Travel") + '" target="_blank" rel="noopener">' + t("wa") + ' +41 76 735 55 60</a><br><a href="tel:' + TEL + '">' + t("call") + ' +41 76 735 55 60</a><br><a href="mailto:' + MAIL + '">' + MAIL + '</a><br><a href="' + IG + '" target="_blank" rel="noopener">Instagram ' + IGH + '</a></div>' +
      '<div><p class="label" style="margin-bottom:10px">Swissnova</p><a href="tours/">' + t("n_tours") + '</a><br><a href="transfers/">' + t("n_transfers") + '</a><br><a href="' + anchor("plan") + '">' + t("n_plan") + '</a><br><a href="' + anchor("faq") + '">' + t("n_faq") + '</a></div>' +
      '<div><p class="label" style="margin-bottom:10px">' + t("f_legal") + '</p><a href="' + LEGAL.cancel + '" target="_blank" rel="noopener">' + t("f_cancel") + '</a><br><a href="' + LEGAL.imp + '" target="_blank" rel="noopener">' + t("f_imp") + '</a><br><a href="' + LEGAL.priv + '" target="_blank" rel="noopener">' + t("f_priv") + '</a></div></div>' +
      '<small>' + t("t_reg") + ' · ' + t("t_form") + ' · ' + t("t_hr") + '<br>' + t("foot_demo") + '<br>' + t("photos") + ' ' +
      CREDITS.map(function (c) { return esc(c[1]) + " — " + esc(c[2]) + ", " + c[3]; }).join(" · ") + '</small></div></footer>';
  }
  function pageHtml(body) {
    return nav() + menu() + '<main id="page">' + body + footer() + '</main>' +
      '<a class="wafab" href="' + wa("Hello Swissnova Travel") + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + waIcon() + '</a>' +
      '<div class="peek" id="peek" aria-hidden="true"><i class="pi"></i><i class="pi"></i></div>';
  }

  /* ---------- parçalar ---------- */
  function rowsHtml(list) {
    return '<div class="list">' + list.map(function (x, i) {
      var pr = x.kind === "package" ? chf(x.price) + "<small>" + t("per_person") + "</small>" : chf(x.price) + "<small>" + t("per_group") + " · " + t("up6") + "</small>";
      var im = '<span class="r-im' + (x.img ? "" : " none") + '"' + (x.img ? ' style="background-image:url(' + thumb(x.img) + ')"' : "") + ' aria-hidden="true"></span>';
      return '<a class="row" data-rv="row" data-cur="' + t("view") + '" href="' + tourUrl(x.slug) + '" data-img="' + thumb(x.img) + '">' + im + '<span class="r-n">' + String(i + 1).padStart(2, "0") + '</span><span class="r-t"><b>' + esc(x.title) + '</b><small>' + esc(x.sub) + '</small></span><span class="r-k">' + kindLabel(x.kind) + '</span><span class="r-p">' + pr + "</span></a>";
    }).join("") + "</div>";
  }
  function calcHtml(id, fixed, def) {
    var opts = DAY_TOURS.map(function (x) { return '<option value="' + x.slug + '"' + (x.slug === def ? " selected" : "") + ">" + esc(x.title) + " — " + chf(x.price) + "</option>"; }).join("");
    var seats = [0, 1, 2, 3, 4, 5].map(function (k) { return '<i style="--k:' + k + '"></i>'; }).join("");
    var d0 = BY[def] || DAY_TOURS[0];   /* fiyat HTML'de de yazsın (botlar JS çalıştırmadan görsün) */
    return '<div class="calc" id="' + id + '" data-rv="io">' + (fixed ? "" : '<select class="c-sel" aria-label="' + t("f_tour") + '">' + opts + "</select>") +
      '<div class="fl">' + t("guests") + ': <b class="c-n">4</b></div><input class="c-rng" type="range" min="1" max="6" value="4" aria-label="' + t("guests") + '"><div class="seats" aria-hidden="true">' + seats + "</div>" +
      '<div class="big" aria-live="polite"><span class="c-each">' + t("approx") + " " + chf(d0.price / 4) + '</span><small>' + t("each") + '</small></div><div class="hint c-grp">' + chf(d0.price) + " " + t("per_group") + " · " + t("up6") + '</div><div class="hint">' + t("calc_note") + "</div></div>";
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
  function guestOpts(sel) { return [1, 2, 3, 4, 5, 6].map(function (n) { return "<option" + (n === sel ? " selected" : "") + ' value="' + n + '">' + n + "</option>"; }).join("") + '<option value="7">' + t("g7") + "</option>"; }
  function dateInput(id) { return '<input id="' + id + '" type="date" class="empty" data-ph="' + t("f_date_ph") + '">'; }
  function sendRow(id, mailId) {
    return '<div class="sendrow"><a class="btn red" id="' + id + '" target="_blank" rel="noopener">' + waIcon().replace("<svg", '<svg style="width:20px;height:20px;fill:#fff"') + " " + t("send") + '</a><a class="lnk-s" id="' + mailId + '">' + t("or_mail") + "</a></div>";
  }
  function plannerHtml(pre) {
    var opts = '<option value="">' + t("f_custom") + "</option>" + TOURS.map(function (x) { return '<option value="' + x.slug + '"' + (x.slug === pre ? " selected" : "") + ">" + esc(x.title) + "</option>"; }).join("");
    return '<form class="calc" id="plan-f" onsubmit="return false"><div><label class="fl" for="p-tour">' + t("f_tour") + '</label><select id="p-tour">' + opts + '</select></div>' +
      '<div class="fgrid"><div><label class="fl" for="p-date">' + t("f_date") + '</label>' + dateInput("p-date") + '</div><div><label class="fl" for="p-n">' + t("f_guests") + '</label><select id="p-n">' + guestOpts(2) + "</select></div></div>" +
      '<p class="hint g7n" hidden>' + t("g7_note") + "</p>" +
      '<div><label class="fl" for="p-pick">' + t("f_pick") + '</label><input id="p-pick" type="text" autocomplete="off" placeholder="Lucerne, Zurich, Interlaken …"></div>' +
      '<div><span class="fl">' + t("f_stops") + '</span><div class="stops" id="p-stops"></div></div>' +
      '<div><label class="fl" for="p-notes">' + t("f_notes") + '</label><textarea id="p-notes" rows="3"></textarea></div>' +
      '<div class="preview" id="p-prev" aria-label="' + t("msg_prev") + '" aria-live="polite"></div>' +
      sendRow("p-send", "p-mail") + '<div class="hint">' + t("not_booking") + "</div></form>";
  }
  function todayIso() { var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); }
  function wireDate(dt) {
    if (!dt) return;
    dt.min = todayIso();
    function ph() { dt.classList.toggle("empty", !dt.value); } dt.addEventListener("input", ph); dt.addEventListener("change", ph);
  }
  function flashPrev(prev) { prev.classList.remove("flash"); void prev.offsetWidth; prev.classList.add("flash"); }
  function mailto(subject, body) { return "mailto:" + MAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body); }
  function wirePlanner() {
    var f = document.getElementById("plan-f"); if (!f) return;
    var tour = f.querySelector("#p-tour"), stops = f.querySelector("#p-stops"), prev = f.querySelector("#p-prev"), gn = f.querySelector(".g7n");
    function drawStops() {
      var x = BY[tour.value];
      stops.innerHTML = x ? x.hl.map(function (h, i) { return '<label class="on" style="--k:' + i + '"><input type="checkbox" checked data-s="' + i + '">' + esc(h) + "</label>"; }).join("") : "";
      stops.parentNode.style.display = x ? "" : "none";
    }
    function msg() {
      var x = BY[tour.value], L = ["Hello Swissnova Travel, I would like to request a private tour."];
      L.push("Tour: " + (x ? x.title : "not sure yet, please suggest"));
      var d = f.querySelector("#p-date").value; if (d) L.push("Date: " + d);
      L.push("Guests: " + guestsTxt(f.querySelector("#p-n").value));
      var p = f.querySelector("#p-pick").value.trim(); if (p) L.push("Pickup: " + p);
      if (x) { var s = [].slice.call(stops.querySelectorAll("input:checked")).map(function (c) { return x.hl[+c.getAttribute("data-s")]; }); if (s.length) L.push("Stops: " + s.join("; ")); }
      var n = f.querySelector("#p-notes").value.trim(); if (n) L.push("Notes: " + n);
      return L.join("\n");
    }
    function upd(flash) {
      var m = msg(); prev.textContent = m; f.querySelector("#p-send").href = wa(m); f.querySelector("#p-mail").href = mailto("Private tour request", m);
      gn.hidden = f.querySelector("#p-n").value !== "7";
      if (flash) flashPrev(prev);
    }
    tour.addEventListener("change", function () { drawStops(); upd(true); });
    f.addEventListener("input", function () { upd(false); });
    f.addEventListener("change", function (e) {
      if (e.target.type === "checkbox") e.target.parentNode.classList.toggle("on", e.target.checked);
      upd(true);
    });
    wireDate(f.querySelector("#p-date"));
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
  function faqHtml(list) {
    return '<div class="faq">' + list.map(function (q) { return '<details><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + "</p></details>"; }).join("") + "</div>";
  }
  function cancelTable() {
    var h = t("c_head");
    return '<table class="ctab"><thead><tr><th scope="col">' + h[0] + '</th><th scope="col">' + h[1] + "</th></tr></thead><tbody>" +
      t("c_rows").map(function (r) { return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td></tr>"; }).join("") + "</tbody></table>";
  }
  function freeBox() {
    return '<div class="free" data-rv="up"><div><p class="free-t">' + t("cancel_t") + '</p><p>' + t("cancel_p") + '</p></div><a class="btn fill" href="' + LEGAL.cancel + '" target="_blank" rel="noopener">' + t("cancel_link") + "</a></div>";
  }

  /* ---------- sayfalar ---------- */
  function homeBody() {
    var feat = ["grindelwald-jungfrau-tour", "engelberg-mount-titlis-tour", "lucerne-mount-pilatus-tour", "blausee-and-oeschinensee-tour", "zurich-rhein-fall-tour", "swiss-dream-tour"].map(function (s) { return BY[s]; }).filter(Boolean);
    var ex = BY["grindelwald-jungfrau-tour"], alt = ex && BY[ex.planb];
    var mt = '<div class="mt">' + PLACES.map(function (p) { return "<b>" + esc(p) + "</b><em></em>"; }).join("") + "</div>";
    var stats = [[DAY_TOURS.length, "st1"], [6, "st3"], [15, "st_cancel"]];
    return '<section class="hero dark" id="hero"><div class="slides" data-par=".2">' +
      HERO.map(function (h, i) { return '<div class="slide' + (i ? "" : " on first") + '"><div class="img"' + (i ? ' data-bg="' + photo(h.img) + '"' : ' style="background-image:url(' + photo(h.img) + ')"') + '></div></div>'; }).join("") + '</div><div class="hero-shade"></div>' +
      '<div class="cap"><span id="cap">' + HERO[0].cap + '</span></div>' +
      '<div class="hp" id="hp">' + HERO.map(function (h, i) { return '<button type="button" data-i="' + i + '" aria-label="' + (i + 1) + " / " + HERO.length + '"><i></i></button>'; }).join("") + '<span id="hpn">01</span><button type="button" class="hp-pp" id="hpp" aria-label="' + t("pause") + '">❚❚</button></div>' +
      '<div class="wrap hero-in"><h1 class="hl" id="hl"><span class="sr">' + t("h1_sr") + "</span>" +
      ["h1", "h2", "h3", "h4"].map(function (k, i) { var a = t(k); return '<span class="hl-set' + (i ? "" : " first") + '" aria-hidden="true"><span class="ln">' + heroChars(a[0]) + '</span><span class="ln">' + heroChars(a[1]) + "</span></span>"; }).join("") +
      '</h1><div class="hero-row"><p class="hero-sub" data-rv="up" data-d="900">' + t("hero_sub") + '</p><div class="hero-cta" data-rv="up" data-d="1050"><a class="btn fill" href="tours/">' + t("cta_tours") + '</a><a class="btn" href="#plan">' + t("cta_plan") + "</a></div></div></div>" +
      '<div class="cue" aria-hidden="true"><span>' + t("scroll") + "</span><i></i></div></section>" +
      '<section class="light sec"><div class="wrap"><p class="mani" data-rv="split">' + t("mani") + '</p><p class="mani-note" data-rv="up" data-d="350">' + t("mani_note") + '</p>' +
      '<div class="stats" data-rv="io">' + stats.map(function (s) { return '<div data-rv="up"><b data-count="' + s[0] + '" data-rv="io">' + s[0] + "</b><span>" + t(s[1]) + "</span></div>"; }).join("") + "</div>" +
      '<p class="meta" data-rv="up" data-d="200">' + [t("t_reg"), t("t_hr"), t("t_car")].map(function (s) { return "<span>" + s + "</span>"; }).join("") + "</p></div></section>" +
      '<div class="marq" data-marq aria-hidden="true"><div class="marq-in">' + mt + mt + "</div></div>" +
      '<section class="light" style="padding-block:clamp(70px,10vw,140px)"><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:34px;flex-wrap:wrap"><h2 class="h-lg" data-rv="split">' + t("sel") + '</h2><a class="btn" href="tours/" data-rv="up">' + t("all_tours") + " →</a></div>" + rowsHtml(feat) + "</div></section>" +
      '<section class="light" id="why" style="padding-bottom:clamp(70px,10vw,140px)"><div class="wrap"><p class="label" data-rv="up">' + t("why_t") + '</p><div class="feat">' +
      [1, 2, 3, 4].map(function (n) { return '<div data-rv="up"><b>0' + n + "</b><h3>" + t("w" + n) + "</h3><p>" + t("w" + n + "t") + "</p></div>"; }).join("") + "</div></div></section>" +
      '<section class="light" id="how" style="padding-bottom:clamp(70px,10vw,140px)"><div class="wrap"><p class="label" data-rv="up">' + t("how_label") + '</p><h2 class="h-lg" data-rv="split" style="margin-top:14px">' + t("how_t") + '</h2><ol class="steps">' +
      [1, 2, 3, 4].map(function (n) { return '<li data-rv="up"><b>0' + n + "</b><h3>" + t("how" + n) + "</h3><p>" + t("how" + n + "t") + "</p></li>"; }).join("") + "</ol>" + freeBox() + "</div></section>" +
      '<section class="dark sec"><div class="wrap two"><div><p class="label" data-rv="up">' + t("n_tours") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 18px">' + t("calc_t") + '</h2><p data-rv="up" data-d="300" style="opacity:.7;max-width:38ch">' + t("calc_s") + '</p></div><div class="card" data-rv="right">' + calcHtml("calc-home", false, "lucerne-mount-pilatus-tour") + "</div></div></section>" +
      '<section class="band dark" data-rv="io"><div class="band-img" data-par=".16"><div class="band-bg" style="background-image:url(images/blausee.jpg)"></div></div><div class="wrap"><p class="label" data-rv="up">' + t("pic_label") + '</p><h2 class="h-xl" data-rv="split" style="margin-top:12px;font-size:clamp(40px,7vw,110px)">' + t("pic_t") + '</h2><p data-rv="up" data-d="350">' + t("pic_p") + '</p><p data-rv="up" data-d="450" style="font-size:14px;opacity:.75">' + t("pic_n") + "</p></div></section>" +
      '<section class="light sec" id="story"><div class="wrap two"><div><p class="label" data-rv="up">' + t("story_label") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 22px">' + t("story_t") + '</h2><p class="serif story" data-rv="up" data-d="300">' + t("story_p") + '</p><p data-rv="up" data-d="400" style="margin-top:16px;opacity:.75">' + t("story_p2") + "</p></div>" +
      '<div><p class="label" data-rv="up" style="margin-bottom:8px">' + t("rev_label") + "</p>" + REVIEWS.map(function (r, i) { return '<figure class="quote" data-rv="right" data-d="' + (i * 120) + '"><blockquote>“' + esc(r[0]) + '”</blockquote><figcaption>' + esc(r[1]) + "</figcaption></figure>"; }).join("") + "</div></div></section>" +
      '<section class="light sec ruled"><div class="wrap two"><div><p class="label" data-rv="up">' + t("wx_label") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 18px">' + t("wx_t") + '</h2><p data-rv="up" data-d="300" style="opacity:.75;max-width:40ch">' + t("wx_p") + '</p></div>' +
      (ex && alt ? '<div class="card" data-rv="right"><p class="label">' + t("wx_if") + '</p><p style="font-size:24px;font-weight:700;margin:6px 0 16px">' + esc(ex.title) + '</p><p class="label">' + t("wx_instead") + '</p><a class="lnk" href="' + tourUrl(alt.slug) + '" style="display:block;color:var(--red)">' + esc(alt.title) + " →</a></div>" : "") + "</div></section>" +
      '<section class="dark sec" id="plan"><div class="wrap two"><div><p class="label" data-rv="up">' + t("n_plan") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 18px">' + t("plan_t") + '</h2><p data-rv="up" data-d="300" style="opacity:.7;max-width:38ch">' + t("plan_p") + '</p></div><div class="card" data-rv="right">' + plannerHtml("") + "</div></div></section>" +
      '<section class="light sec"><div class="wrap two"><div><p class="label" data-rv="up">' + t("n_transfers") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 18px">' + t("trt_t") + '</h2><p data-rv="up" data-d="300" style="opacity:.75;max-width:40ch">' + t("trt_p") + '</p><a class="btn" href="transfers/" data-rv="up" data-d="400" style="margin-top:26px">' + t("trt_btn") + ' →</a></div>' +
      '<ul class="ck" data-rv="right">' + ROUTES[0].r.slice(0, 3).concat(ROUTES[1].r.slice(0, 1)).map(function (r) { return '<li data-rv="io">' + esc(r[0]) + " → " + esc(r[1]) + "</li>"; }).join("") + "</ul></div></section>" +
      '<section class="dark sec" id="faq"><div class="wrap two"><div><p class="label" data-rv="up">' + t("n_faq") + '</p><h2 class="h-lg" data-rv="split" style="margin-top:14px">' + t("faq_t") + "</h2></div>" + faqHtml(t("faq")) + "</div></section>" +
      '<section class="light sec" id="contact"><div class="wrap"><h2 class="h-xl" data-rv="split">' + t("c_t") + '</h2><p data-rv="up" data-d="300" style="margin:24px 0 30px;max-width:40ch;opacity:.75;font-size:18px">' + t("c_p") + '</p><div class="hero-cta" data-rv="up" data-d="450"><a class="btn red" href="' + wa("Hello Swissnova Travel") + '" target="_blank" rel="noopener">' + t("wa") + '</a><a class="btn" href="tel:' + TEL + '">' + t("call") + ' +41 76 735 55 60</a><a class="btn" href="mailto:' + MAIL + '">' + MAIL + '</a><a class="btn" href="' + IG + '" target="_blank" rel="noopener">' + igIcon() + ' Instagram</a></div></div></section>';
  }
  function toursBody() {
    var kinds = ["all", "lake", "mountain", "city", "package"];
    return '<section class="light" style="padding-top:150px;padding-bottom:clamp(70px,10vw,140px);min-height:100svh"><div class="wrap"><h1 class="h-xl" data-rv="split" style="margin-bottom:40px">' + t("tours_h1") + '</h1><div class="tbar" data-rv="up" data-d="300"><div class="chips" id="chips">' +
      kinds.map(function (k) { return '<button type="button" class="chip' + (k === "all" ? " on" : "") + '" data-k="' + k + '" aria-pressed="' + (k === "all") + '">' + t("k_" + k) + "</button>"; }).join("") + '</div><p class="tcount" aria-live="polite"><b id="tcount">' + TOURS.length + "</b>" + t("tours_word") + '</p></div><div id="tlist">' + rowsHtml(TOURS) + "</div></div></section>";
  }
  function tourBody(x) {
    var alt = x.planb && BY[x.planb];
    var idx = TOURS.indexOf(x), nx = TOURS[(idx + 1) % TOURS.length];
    var pkg = x.kind === "package";
    return '<section class="thero dark' + (x.img ? "" : " nophoto") + '"><div class="thero-img" data-par=".2"><div class="thero-bg"' + (x.img ? ' style="background-image:url(' + photo(x.img) + ')"' : "") + '></div></div><div class="wrap"><a class="label back" href="tours/">' + t("back") + '</a><h1 class="h-xl" data-rv="split" data-d="150" style="font-size:clamp(34px,6.6vw,104px)">' + esc(x.title) + '</h1><p class="serif" data-rv="up" data-d="600" style="font-size:clamp(18px,2.2vw,30px);margin-top:14px;max-width:34em;opacity:.92">' + esc(x.sub) + '</p><div style="margin-top:18px">' + badges(x) + "</div></div></section>" +
      '<section class="light"><div class="wrap facts"><div data-rv="up"><p class="label">' + t("facts_p") + "</p>" +
      (pkg ? '<div class="big" style="margin-top:14px">' + chf(x.price) + '</div><p class="hint" style="margin-top:8px;opacity:.8">' + t("pack_price") + "</p>" : '<div style="margin-top:14px">' + calcHtml("calc-tour", true, x.slug) + "</div>") + '</div>' +
      '<div data-rv="up" data-d="120"><p class="label">' + t("facts_t") + '</p><p style="font-size:22px;font-weight:700;margin:14px 0 6px">' + (pkg ? t("pkg_days") : t("day_val")) + '</p><p class="label" style="margin-top:22px">' + t("facts_pick") + '</p><p style="margin-top:6px">' + esc(x.pickup) + '</p></div>' +
      '<div data-rv="up" data-d="240"><p class="label">' + t("vehicle_l") + '</p><p style="font-size:22px;font-weight:700;margin:14px 0 6px">' + t("vehicle") + '</p><a class="btn red" style="margin-top:20px" target="_blank" rel="noopener" href="' + wa("Hello Swissnova Travel, I have a question about: " + x.title) + '">' + t("book_wa") + "</a></div></div></section>" +
      '<section class="light" style="padding-bottom:clamp(50px,8vw,100px)"><div class="wrap"><div class="inex"><div><h2 class="h-lg" data-rv="split" style="font-size:clamp(26px,3.4vw,44px);margin-bottom:18px">' + t("inc") + '</h2><ul class="ck">' + x.incl.map(function (s) { return '<li data-rv="io">' + esc(s) + "</li>"; }).join("") + '</ul></div><div><h2 class="h-lg" data-rv="split" style="font-size:clamp(26px,3.4vw,44px);margin-bottom:18px">' + t("exc") + '</h2><ul class="ck no">' + x.excl.map(function (s) { return '<li data-rv="io">' + esc(s) + "</li>"; }).join("") + '<li data-rv="io">' + t("tips") + "</li></ul></div></div></div></section>" +
      '<section class="dark sec"><div class="wrap two"><div><h2 class="label" data-rv="up">' + (pkg ? t("itin") : t("hl")) + '</h2>' + (pkg ? '<div class="days" style="margin-top:20px">' + DREAM_DAYS.map(function (d) { return '<div class="day" data-rv="io"><b>' + d[0] + "</b><p>" + esc(d[1]) + "</p></div>"; }).join("") + "</div>" : '<ul class="ck" style="margin-top:20px">' + x.hl.map(function (s) { return '<li data-rv="io">' + esc(s) + "</li>"; }).join("") + "</ul>") + "</div>" +
      '<div>' + (alt ? '<div class="card" data-rv="right" style="margin-bottom:24px"><p class="label">' + t("wx_label") + '</p><p style="margin:8px 0 12px;opacity:.8">' + t("wx_p") + '</p><a class="lnk" href="' + tourUrl(alt.slug) + '" style="font-size:22px;color:#ff7a72">' + esc(alt.title) + " →</a></div>" : "") +
      (x.picnic ? '<div class="card" data-rv="right" data-d="120" style="margin-bottom:24px"><p class="label">' + t("pic_t") + '</p><p style="margin-top:8px;opacity:.85">' + t("pic_p") + "</p></div>" : "") + "</div></div></section>" +
      '<section class="light sec"><div class="wrap two"><div><p class="label" data-rv="up">' + t("good_t") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 18px;font-size:clamp(28px,4vw,56px)">' + t("cancel_t") + '</h2><p data-rv="up" data-d="300" style="opacity:.75;max-width:40ch">' + t("cancel_p") + '</p><a class="lnk-s" data-rv="up" data-d="400" href="' + LEGAL.cancel + '" target="_blank" rel="noopener" style="margin-top:14px">' + t("cancel_link") + ' →</a></div><div class="card" data-rv="right">' + cancelTable() + "</div></div></section>" +
      '<section class="dark sec" id="plan"><div class="wrap two"><div><p class="label" data-rv="up">' + t("n_plan") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 18px">' + t("custom") + '</h2><p data-rv="up" data-d="300" style="opacity:.75;max-width:38ch">' + t("plan_p") + '</p></div><div class="card" data-rv="right">' + plannerHtml(x.slug) + "</div></div></section>" +
      '<a class="next dark" href="' + tourUrl(nx.slug) + '" data-cur="' + t("view") + '"><div class="next-bg"' + (nx.img ? ' style="background-image:url(' + thumb(nx.img) + ')"' : "") + '></div><div class="wrap"><p class="label">' + t("next") + '</p><span class="h-xl nx" data-rv="split" style="font-size:clamp(32px,6vw,96px)">' + esc(nx.title) + '<span class="arr">→</span></span></div></a>';
  }
  function transfersBody() {
    var svcs = t("tr_svcs"), facts = t("tr_facts"), opts = t("tr_opts");
    return '<section class="thero dark"><div class="thero-img" data-par=".2"><div class="thero-bg" style="background-image:url(' + photo("jungfrau") + ')"></div></div><div class="wrap"><p class="label" data-rv="up" style="margin-bottom:16px">' + t("tr_label") + '</p><h1 class="h-xl" data-rv="split" data-d="150" style="font-size:clamp(34px,6.6vw,104px)">' + t("tr_h") + '</h1><p class="serif" data-rv="up" data-d="600" style="font-size:clamp(18px,2.2vw,28px);margin-top:14px;max-width:34em;opacity:.92">' + t("tr_sub") + '</p><div class="hero-cta" data-rv="up" data-d="750" style="margin-top:24px"><a class="btn fill" href="#tplan">' + t("tr_cta") + '</a><a class="btn" href="' + wa("Hello Swissnova Travel, I would like a quote for a private transfer.") + '" target="_blank" rel="noopener">' + t("wa") + "</a></div></div></section>" +
      '<section class="light"><div class="wrap facts">' + facts.map(function (f, i) { return '<div data-rv="up" data-d="' + (i * 120) + '"><p class="label">' + f[0] + '</p><p style="font-size:22px;font-weight:700;margin-top:14px">' + f[1] + "</p></div>"; }).join("") + "</div></section>" +
      '<section class="light" style="padding-bottom:clamp(70px,10vw,140px)"><div class="wrap"><h2 class="h-lg" data-rv="split">' + t("tr_sv") + '</h2><div class="feat f3">' +
      svcs.map(function (s, i) { return '<div data-rv="up"><b>0' + (i + 1) + "</b><h3>" + s[0] + "</h3><p>" + s[1] + "</p></div>"; }).join("") + "</div></div></section>" +
      '<section class="dark sec"><div class="wrap two"><div><p class="label" data-rv="up">' + t("n_transfers") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 18px">' + t("routes_t") + '</h2><p data-rv="up" data-d="300" style="opacity:.7;max-width:38ch">' + t("routes_p") + '</p><p data-rv="up" data-d="400" class="hint" style="opacity:.6;max-width:42ch;margin-top:18px;font-size:14px">' + t("route_note") + "</p></div>" +
      '<div class="routes">' + ROUTES.map(function (g) { return '<div data-rv="right"><h3>' + t(g.k) + '</h3><div class="rts">' + g.r.map(function (r) { return '<button type="button" class="rt" data-s="' + g.s + '" data-from="' + esc(r[0]) + '" data-to="' + esc(r[1]) + '">' + esc(r[0]) + " → " + esc(r[1]) + "</button>"; }).join("") + "</div></div>"; }).join("") + "</div></div></section>" +
      '<section class="light sec" id="tplan"><div class="wrap two"><div><p class="label" data-rv="up">' + t("tr_cta") + '</p><h2 class="h-lg" data-rv="split" style="margin:14px 0 18px">' + t("tr_form_t") + '</h2><p data-rv="up" data-d="300" style="opacity:.75;max-width:38ch">' + t("tr_form_p") + '</p></div><div class="card" data-rv="right">' +
      '<form class="calc" id="tform" onsubmit="return false"><div><label class="fl" for="t-svc">' + t("f_service") + '</label><select id="t-svc">' + opts.map(function (o, i) { return '<option value="' + i + '">' + o + "</option>"; }).join("") + "</select></div>" +
      '<div class="fgrid"><div><label class="fl" for="t-from">' + t("f_from") + '</label><input id="t-from" type="text" autocomplete="off" placeholder="Zurich Airport"></div><div><label class="fl" for="t-to">' + t("f_to") + '</label><input id="t-to" type="text" autocomplete="off" placeholder="Lucerne"></div></div>' +
      '<div class="fgrid"><div><label class="fl" for="t-date">' + t("f_date") + '</label>' + dateInput("t-date") + '</div><div><label class="fl" for="t-time">' + t("f_time") + '</label><input id="t-time" type="time"></div></div>' +
      '<div class="fgrid"><div><label class="fl" for="t-n">' + t("f_guests") + '</label><select id="t-n">' + guestOpts(2) + '</select></div><div><label class="fl" for="t-bags">' + t("f_bags") + '</label><input id="t-bags" type="number" min="0" max="30" inputmode="numeric"></div></div>' +
      '<p class="hint g7n" hidden>' + t("g7_note") + "</p>" +
      '<div><label class="fl" for="t-flight">' + t("f_flight") + '</label><input id="t-flight" type="text" autocomplete="off" placeholder="LX 123"></div>' +
      '<div><label class="fl" for="t-notes">' + t("f_notes") + '</label><textarea id="t-notes" rows="3"></textarea></div>' +
      '<div class="preview" id="t-prev" aria-label="' + t("msg_prev") + '" aria-live="polite"></div>' + sendRow("t-send", "t-mail") + '<div class="hint">' + t("not_booking") + "</div></form></div></div></section>" +
      '<section class="dark sec" id="faq"><div class="wrap two"><div><p class="label" data-rv="up">' + t("n_faq") + '</p><h2 class="h-lg" data-rv="split" style="margin-top:14px">' + t("n_transfers") + "</h2></div>" + faqHtml(t("tr_faq")) + "</div></section>";
  }
  function notFoundBody() {
    return '<section class="light" style="padding-top:170px;padding-bottom:clamp(70px,10vw,140px);min-height:80svh"><div class="wrap"><p class="label">404</p><h1 class="h-xl" style="margin:16px 0 24px">' + t("nf_t") + '</h1><p style="font-size:18px;opacity:.75;max-width:40ch">' + t("nf_p") + '</p><div class="hero-cta" style="margin-top:30px"><a class="btn red" href="tours/">' + t("cta_tours") + '</a><a class="btn" href="./">Swissnova Travel</a></div></div></section>';
  }
  function wireTransfer() {
    var f = document.getElementById("tform"); if (!f) return;
    var q = function (s) { return f.querySelector(s); };
    var prev = q("#t-prev"), gn = q(".g7n");
    function msg() {
      var L = ["Hello Swissnova Travel, I would like a quote for a private transfer."];
      L.push("Service: " + I.en.tr_opts[+q("#t-svc").value]);
      var fr = q("#t-from").value.trim(), to = q("#t-to").value.trim();
      if (fr) L.push("From: " + fr); if (to) L.push("To: " + to);
      var d = q("#t-date").value; if (d) L.push("Date: " + d);
      var tm = q("#t-time").value; if (tm) L.push("Pickup time: " + tm);
      L.push("Guests: " + guestsTxt(q("#t-n").value));
      var b = q("#t-bags").value; if (b) L.push("Suitcases: " + b);
      var fl = q("#t-flight").value.trim(); if (fl) L.push("Flight: " + fl);
      var n = q("#t-notes").value.trim(); if (n) L.push("Notes: " + n);
      return L.join("\n");
    }
    function upd(flash) {
      var m = msg(); prev.textContent = m; q("#t-send").href = wa(m); q("#t-mail").href = mailto("Transfer request", m);
      gn.hidden = q("#t-n").value !== "7";
      if (flash) flashPrev(prev);
    }
    f.addEventListener("input", function () { upd(false); });
    f.addEventListener("change", function () { upd(true); });
    wireDate(q("#t-date"));
    [].forEach.call(document.querySelectorAll(".rt"), function (b) {
      b.addEventListener("click", function () {
        q("#t-from").value = b.getAttribute("data-from"); q("#t-to").value = b.getAttribute("data-to"); q("#t-svc").value = b.getAttribute("data-s");
        upd(true);
        FX.scrollTo(f.getBoundingClientRect().top + window.pageYOffset - 90);
        setTimeout(function () { try { q("#t-date").focus({ preventScroll: true }); } catch (e) {} }, 700);
      });
    });
    upd(false);
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
    wirePlanner();
    wireTransfer();
    if (page === "home") wireCalc("calc-home");
    if (page === "tour" && cur) wireCalc("calc-tour", cur.slug);
    if (page === "tours") {
      var cs = document.getElementById("chips"), tl = document.getElementById("tlist"), cnt = document.getElementById("tcount"), busy = false;
      cs.addEventListener("click", function (e) {
        var b = e.target.closest(".chip"); if (!b || busy || b.classList.contains("on")) return; busy = true;
        [].forEach.call(cs.children, function (c) { c.classList.toggle("on", c === b); c.setAttribute("aria-pressed", c === b); });
        var k = b.getAttribute("data-k"), list = TOURS.filter(function (x) { return k === "all" || x.kind === k; });
        tl.classList.add("out");
        FX.tween(cnt, +cnt.textContent, list.length, 650, function (v) { return String(Math.round(v)); });
        setTimeout(function () { tl.innerHTML = rowsHtml(list); FX.enhance(tl, true); tl.classList.remove("out"); busy = false; }, 290);
      });
    }
  }

  function bodyFor() {
    if (page === "home") return homeBody();
    if (page === "tours") return toursBody();
    if (page === "transfers") return transfersBody();
    if (page === "tour") {
      var id = slugAttr || (typeof location !== "undefined" ? new URLSearchParams(location.search).get("id") : null);
      cur = BY[id] || null;
      if (cur) return tourBody(cur);
      page = "404";
    }
    return notFoundBody();
  }

  /* build.js için: içeriği üret, DOM'a dokunmadan dön */
  if (BUILD) {
    var bb = bodyFor();
    BUILD.out = { html: pageHtml(bb), seo: seo(), tour: cur, tours: TOURS, faq: I.en.faq, trfaq: I.en.tr_faq, lcp: page === "home" ? photo(HERO[0].img) : page === "transfers" ? photo("jungfrau") : (cur && cur.img ? photo(cur.img) : "") };
    return;
  }

  /* ---------- hero: slayt + başlık + sayaç çubukları tek takvimle ---------- */
  var heroT = null, heroResume = null;
  function hero() {
    clearTimeout(heroT);
    var slides = [].slice.call(document.querySelectorAll(".slide")), sets = [].slice.call(document.querySelectorAll(".hl-set")),
        bars = [].slice.call(document.querySelectorAll(".hp button[data-i]")), cap = document.getElementById("cap"), num = document.getElementById("hpn"),
        hp = document.getElementById("hp"), pp = document.getElementById("hpp");
    if (!slides.length) return;
    /* diğer slayt görselleri açılıştan sonra yüklenir (ilk ekran hızlı gelsin) */
    [].forEach.call(document.querySelectorAll(".slide .img[data-bg]"), function (el) { el.style.backgroundImage = "url(" + el.getAttribute("data-bg") + ")"; el.removeAttribute("data-bg"); });
    var cur = 0, busy = false, DUR = 6500, paused = false;
    try { paused = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    function mark(i) {
      bars.forEach(function (b, k) { b.classList.remove("on"); if (k === i) { void b.offsetWidth; b.classList.add("on"); } });
      num.textContent = "0" + (i + 1);
    }
    function sched() { clearTimeout(heroT); if (paused) return; heroT = setTimeout(function () { go((cur + 1) % slides.length); }, DUR); }
    function setPause(p) {
      paused = p; hp.classList.toggle("paused", p);
      pp.setAttribute("aria-label", t(p ? "play" : "pause")); pp.textContent = p ? "▶" : "❚❚";
      if (p) clearTimeout(heroT); else { mark(cur); sched(); }
    }
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
    if (pp) pp.addEventListener("click", function () { setPause(!paused); });
    sets[0].classList.add("on"); mark(0); setPause(paused);
    heroResume = function (vis) { if (vis && !paused) { mark(cur); sched(); } else clearTimeout(heroT); };
  }
  document.addEventListener("visibilitychange", function () { if (heroResume) heroResume(!document.hidden); });

  var booted = false;
  function preloadList() {
    if (page === "home") return [photo(HERO[0].img)];
    if (page === "tour" && cur) return [photo(cur.img)];
    if (page === "transfers") return [photo("jungfrau")];
    return [];
  }
  function render() {
    document.documentElement.lang = lang;
    var body = bodyFor();
    document.title = seo().title;
    document.getElementById("app").innerHTML = pageHtml(body);
    behaviours();
    FX.enhance(document.getElementById("app"));
    if (!booted) { booted = true; FX.boot({ preload: preloadList(), onReady: function () { if (page === "home") hero(); } }); }
    else if (page === "home") hero();
  }
  render();
})();
