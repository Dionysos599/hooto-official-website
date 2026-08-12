(() => {
  "use strict";

  if (typeof window.Lenis !== "function") return;

  const lenis = new window.Lenis({
    autoRaf: true,
    anchors: {
      offset: -72,
    },
    stopInertiaOnNavigate: true,
    prevent: (node) => node instanceof Element && Boolean(node.closest(
      "dialog[open], [data-lenis-prevent], .photo-rail"
    )),
  });

  // Expose the shared instance for future scroll-linked effects and debugging.
  window.hootoLenis = lenis;

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) lenis.resize();
  });
})();
