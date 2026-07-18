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

  function initializeReveal() {
    const targets = document.querySelectorAll(
      ".statement-copy, .metrics > div, .service-list article, .contact-details > div"
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

  root.classList.remove("lang-en");
  root.classList.add("lang-zh");
  root.lang = "zh-CN";
  initializeProjectStory();
  initializeReveal();
})();
