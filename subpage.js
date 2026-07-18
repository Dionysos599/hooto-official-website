(() => {
  "use strict";

  const root = document.documentElement;
  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = lightbox?.querySelector("img");
  const lightboxClose = lightbox?.querySelector("[data-lightbox-close]");

  function initializeReveal() {
    const targets = document.querySelectorAll(
      ".case-intro-main, .feature-strip article, .media-card, .photo-rail"
    );

    targets.forEach((target) => target.setAttribute("data-reveal", ""));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.08 }
    );

    targets.forEach((target) => observer.observe(target));
  }

  function initializeLightbox() {
    if (!lightbox || !lightboxImage) return;

    document.querySelectorAll("[data-lightbox-image]").forEach((image) => {
      image.addEventListener("click", () => {
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt;
        lightbox.showModal();
      });
    });

    lightboxClose?.addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });
  }

  function initializeImageFallbacks() {
    const fallback = document.body.dataset.fallbackImage;
    if (!fallback) return;

    document.querySelectorAll("img").forEach((image) => {
      const applyFallback = () => {
        if (image.dataset.fallbackApplied) return;
        image.dataset.fallbackApplied = "true";
        image.src = fallback;
      };

      image.addEventListener("error", applyFallback);
      if (image.complete && image.naturalWidth === 0) applyFallback();
    });
  }

  root.classList.remove("lang-en");
  root.classList.add("lang-zh");
  root.lang = "zh-CN";
  initializeImageFallbacks();
  initializeReveal();
  initializeLightbox();
})();
