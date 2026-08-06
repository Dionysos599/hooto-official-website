(() => {
  "use strict";

  const root = document.documentElement;
  const projectStage = document.querySelector(".project-stage");
  const projectImage = document.querySelector("[data-project-image]");
  const projectBackdrop = document.querySelector("[data-project-backdrop]");
  const projectLink = document.querySelector("[data-project-link]");
  const projectName = document.querySelector("[data-project-name]");
  const projectTags = document.querySelector("[data-project-tags]");
  const projectYear = document.querySelector("[data-project-year]");
  const projectIndex = document.querySelector("[data-project-index]");
  const marqueeLabels = document.querySelectorAll("[data-project-marquee]");
  const projectSteps = [...document.querySelectorAll("[data-project-step]")];

  function updateProjectMeta(step) {
    if (!projectName || !projectTags || !projectYear || !projectLink) return;
    const displayName = step.dataset.nameZh;
    projectName.textContent = displayName;
    projectTags.textContent = step.dataset.tagsZh;
    projectYear.textContent = step.dataset.year;
    projectLink.href = step.dataset.link;
    projectLink.setAttribute("aria-label", `${displayName} project`);
    marqueeLabels.forEach((label) => {
      label.textContent = displayName;
    });
  }

  function activateProject(step, index) {
    if (step.classList.contains("is-active")) {
      updateProjectMeta(step);
      return;
    }

    projectSteps.forEach((item) => item.classList.remove("is-active"));
    step.classList.add("is-active");
    projectStage.classList.add("is-changing");

    window.setTimeout(() => {
      const image = step.dataset.image;
      projectImage.src = image;
      projectImage.alt = step.querySelector("h3").innerText.trim();
      projectBackdrop.style.setProperty("--project-image", `url("${image}")`);
      projectIndex.textContent = String(index + 1).padStart(2, "0");
      updateProjectMeta(step);
      projectStage.classList.remove("is-changing");
    }, 220);
  }

  function initializeProjectStory() {
    if (!projectStage || projectSteps.length === 0) return;

    projectSteps.forEach((step) => {
      const preload = new Image();
      preload.src = step.dataset.image;
    });

    projectBackdrop.style.setProperty(
      "--project-image",
      `url("${projectSteps[0].dataset.image}")`
    );
    updateProjectMeta(projectSteps[0]);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = projectSteps.indexOf(entry.target);
          activateProject(entry.target, index);
        });
      },
      {
        rootMargin: "-34% 0px -34% 0px",
        threshold: 0
      }
    );

    projectSteps.forEach((step) => observer.observe(step));
  }

  function initializeMobileNavigation() {
    const header = document.querySelector(".site-header");
    const nav = header?.querySelector(".site-nav");
    const detail = header?.querySelector(".detailed-header");
    const navLinks = [...(nav?.querySelectorAll("a") || [])];
    const mobileQuery = window.matchMedia("(max-width: 900px)");
    if (!header || !nav || !detail || navLinks.length === 0) return;

    const setOpen = (isOpen) => {
      header.classList.toggle("is-mobile-nav-open", isOpen);
      navLinks.forEach((link) => link.setAttribute("aria-expanded", String(isOpen)));
    };

    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!mobileQuery.matches || !link) return;

      if (!header.classList.contains("is-mobile-nav-open")) {
        event.preventDefault();
        setOpen(true);
      } else {
        setOpen(false);
      }
    });

    detail.addEventListener("click", (event) => {
      if (mobileQuery.matches && event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("pointerdown", (event) => {
      if (
        mobileQuery.matches &&
        header.classList.contains("is-mobile-nav-open") &&
        !header.contains(event.target)
      ) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    mobileQuery.addEventListener("change", () => setOpen(false));
  }

  function initializeReveal() {
    const targets = document.querySelectorAll(
      ".mission-title-block, .mission-copy, .about-page-copy, .about-page-contact, .about-contact-row, .gallery-card"
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
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.1
      }
    );

    targets.forEach((target) => observer.observe(target));
  }

  function initializeStoreModal() {
    const modal = document.querySelector("[data-store-modal]");
    const openers = document.querySelectorAll("[data-store-open]");
    const closeButton = document.querySelector("[data-store-close]");
    if (!modal) return;

    const openModal = () => {
      if (!modal.open) modal.showModal();
    };

    openers.forEach((opener) => opener.addEventListener("click", openModal));
    closeButton?.addEventListener("click", () => modal.close());
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });

    const url = new URL(window.location.href);
    if (url.searchParams.get("store") === "1") {
      openModal();
      url.searchParams.delete("store");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

  function initializeGalleryLightbox() {
    const modal = document.querySelector("[data-gallery-lightbox]");
    const modalImage = modal?.querySelector("img");
    const closeButton = document.querySelector("[data-gallery-close]");
    const triggers = document.querySelectorAll("[data-gallery-image]");
    if (!modal || !modalImage) return;

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        modalImage.src = trigger.dataset.galleryImage;
        modalImage.alt = trigger.querySelector("img")?.alt || "HOOTO 作品";
        modal.showModal();
      });
    });

    closeButton?.addEventListener("click", () => modal.close());
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });
  }

  root.classList.remove("lang-en");
  root.classList.add("lang-zh");
  root.lang = "zh-CN";
  initializeProjectStory();
  initializeMobileNavigation();
  initializeReveal();
  initializeStoreModal();
  initializeGalleryLightbox();
})();
