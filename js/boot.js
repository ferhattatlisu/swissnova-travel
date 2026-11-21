/* Sayfa çizilmeden önce çalışır (Mono Mimarlık düzeni): açılış ekranı mı, sayfa geçişi mi gösterileceğine karar verir. */
(function () {
  var html = document.documentElement;
  var GRADS = [
    "linear-gradient(90deg,#b8ced8,#e4edf1)",   /* göl: mavi-gri */
    "linear-gradient(90deg,#cdd9cb,#eef2e8)",   /* çam: adaçayı yeşili */
    "linear-gradient(90deg,#ddd6c8,#f4efe6)"    /* granit: sıcak krem */
  ];
  window.__GRADS = GRADS;
  html.classList.add("js");

  var flag = null;
  try { flag = sessionStorage.getItem("sn-gecis"); sessionStorage.removeItem("sn-gecis"); } catch (e) {}
  var parts = flag ? flag.split("|") : [];
  var index = parseInt(parts[0], 10);
  var fresh = Date.now() - parseInt(parts[1], 10) < 10000;

  if (flag && !isNaN(index) && fresh) {
    /* Önceki sayfadan geçişle gelindi: panel ekranı kaplamış halde başla */
    html.style.setProperty("--panel", GRADS[index % GRADS.length]);
    html.classList.add("mid-transition");
  } else {
    /* Doğrudan açılış: siyah ekran + küçülen marka yazısı */
    html.classList.add("is-loading");
  }
  /* Betikler yüklenemezse sayfa sonsuza dek kapalı kalmasın */
  setTimeout(function () { html.classList.remove("is-loading", "mid-transition", "is-opening"); }, 12000);
})();
