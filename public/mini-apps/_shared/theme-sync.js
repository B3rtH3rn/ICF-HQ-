/*
 * Keeps an embedded mini-app's light/dark mode in sync with the hub's.
 *
 * The hub toggles a `.dark` class on its own <html> and mirrors the choice
 * to localStorage under the "theme" key (see components/ThemeToggle.tsx and
 * the no-flash script in app/layout.tsx). Mini-apps load in a same-origin
 * iframe (sandbox keeps `allow-same-origin`), so this reads the parent's
 * live state directly and watches it for changes — no reload needed when
 * the user flips the toggle while this page is open.
 *
 * Falls back to this page's own localStorage read if there's no reachable
 * parent frame (e.g. opened directly, not inside the hub).
 */
(function () {
  function isDarkFrom(doc) {
    try {
      return doc.documentElement.classList.contains("dark");
    } catch (e) {
      return true;
    }
  }

  function readOwnPreference() {
    try {
      return localStorage.getItem("theme") !== "light";
    } catch (e) {
      return true;
    }
  }

  function apply(isDark) {
    document.documentElement.classList.toggle("dark", isDark);
  }

  var parentDoc = null;
  try {
    parentDoc =
      window.parent && window.parent !== window ? window.parent.document : null;
  } catch (e) {
    parentDoc = null;
  }

  if (parentDoc) {
    apply(isDarkFrom(parentDoc));
    try {
      new MutationObserver(function () {
        apply(isDarkFrom(parentDoc));
      }).observe(parentDoc.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    } catch (e) {
      // MutationObserver on the parent failed for some reason — the
      // storage-event fallback below still keeps things roughly in sync.
    }
  } else {
    apply(readOwnPreference());
  }

  // Belt-and-suspenders: a `storage` event fires in this frame whenever
  // another same-origin frame (the hub) updates the "theme" key.
  window.addEventListener("storage", function (e) {
    if (e.key === "theme") {
      apply(e.newValue !== "light");
    }
  });
})();
