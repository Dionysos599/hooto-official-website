(() => {
  "use strict";

  const carousels = [...document.querySelectorAll("[data-ip-carousel]")];
  if (carousels.length === 0) return;

  function initializeCarousel(carousel) {
    const slides = [...carousel.querySelectorAll("[data-ip-slide]")];
    const previousButton = carousel.querySelector("[data-ip-carousel-prev]");
    const nextButton = carousel.querySelector("[data-ip-carousel-next]");
    const status = carousel.querySelector("[data-ip-carousel-status]");
    const stage = carousel.querySelector(".ip-character-stage");
  let activeIndex = 0;
  let gesture = null;
  let suppressClick = false;
  let wheelDistance = 0;
  let wheelLocked = false;
  let wheelResetTimer = 0;
  let wheelTriggeredAt = 0;
  let lastWheelAt = 0;
  let previousWheelMagnitude = 0;

  function updateCarousel() {
    slides.forEach((slide, index) => {
      const forwardDistance = (index - activeIndex + slides.length) % slides.length;
      const position = forwardDistance > Math.floor(slides.length / 2)
        ? forwardDistance - slides.length
        : forwardDistance;

      slide.dataset.position = String(position);
      slide.toggleAttribute("aria-current", position === 0);
      slide.classList.toggle("is-lightbox-active", position === 0);

      const lightboxImage = slide.querySelector("[data-lightbox-image]");
      if (lightboxImage) {
        lightboxImage.tabIndex = position === 0 ? 0 : -1;
        lightboxImage.setAttribute("aria-label", position === 0 ? `放大查看：${lightboxImage.alt}` : lightboxImage.alt);
      }
    });

    if (status) {
      status.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    }
  }

  function moveCarousel(direction) {
    activeIndex = (activeIndex + direction + slides.length) % slides.length;
    updateCarousel();
  }

  previousButton?.addEventListener("click", () => moveCarousel(-1));
  nextButton?.addEventListener("click", () => moveCarousel(1));

  carousel.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveCarousel(event.key === "ArrowRight" ? 1 : -1);
  });

  if (stage) {
    stage.querySelectorAll("img").forEach((image) => image.setAttribute("draggable", "false"));

    stage.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const image = event.target.closest("[data-lightbox-image]");
      if (!image || !image.closest("[data-ip-slide]")?.matches('[data-position="0"]')) return;
      event.preventDefault();
      image.click();
    });

    stage.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      gesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        hasCapture: false
      };
      stage.classList.add("is-dragging");
    });

    stage.addEventListener("pointermove", (event) => {
      if (!gesture || gesture.pointerId !== event.pointerId || gesture.hasCapture) return;

      const distanceX = event.clientX - gesture.startX;
      const distanceY = event.clientY - gesture.startY;
      if (Math.abs(distanceX) < 10 || Math.abs(distanceX) <= Math.abs(distanceY)) return;

      try {
        stage.setPointerCapture?.(event.pointerId);
        gesture.hasCapture = true;
      } catch {
        // Pointer capture is optional; the gesture can still complete inside the stage.
      }
    });

    stage.addEventListener("pointerup", (event) => {
      if (!gesture || gesture.pointerId !== event.pointerId) return;

      const distanceX = event.clientX - gesture.startX;
      const distanceY = event.clientY - gesture.startY;
      const isHorizontalSwipe = Math.abs(distanceX) >= 42 && Math.abs(distanceX) > Math.abs(distanceY) * 1.15;

      if (isHorizontalSwipe) {
        suppressClick = true;
        moveCarousel(distanceX < 0 ? 1 : -1);
        window.setTimeout(() => {
          suppressClick = false;
        }, 350);
      }

      const hadCapture = gesture.hasCapture;
      gesture = null;
      stage.classList.remove("is-dragging");
      if (hadCapture) {
        try {
          stage.releasePointerCapture?.(event.pointerId);
        } catch {
          // The pointer may already have been released by the browser.
        }
      }
    });

    stage.addEventListener("pointercancel", (event) => {
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      gesture = null;
      stage.classList.remove("is-dragging");
    });

    stage.addEventListener("dragstart", (event) => event.preventDefault());
    stage.addEventListener("click", (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    }, true);

    stage.addEventListener("wheel", (event) => {
      const isHorizontalGesture = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (!isHorizontalGesture) return;

      event.preventDefault();
      const now = performance.now();
      const wheelMagnitude = Math.abs(event.deltaX);
      const hadBriefPause = lastWheelAt > 0 && now - lastWheelAt > 70;
      const hasNewAcceleration = wheelLocked
        && now - wheelTriggeredAt > 80
        && wheelMagnitude > Math.max(10, previousWheelMagnitude * 1.45);

      if (wheelLocked && (hadBriefPause || hasNewAcceleration)) {
        wheelLocked = false;
        wheelDistance = 0;
      }

      window.clearTimeout(wheelResetTimer);

      if (!wheelLocked) {
        wheelDistance += event.deltaX;
        if (Math.abs(wheelDistance) >= 42) {
          moveCarousel(wheelDistance > 0 ? 1 : -1);
          wheelDistance = 0;
          wheelLocked = true;
          wheelTriggeredAt = now;
        }
      }

      lastWheelAt = now;
      previousWheelMagnitude = wheelMagnitude;

      wheelResetTimer = window.setTimeout(() => {
        wheelDistance = 0;
        wheelLocked = false;
        wheelTriggeredAt = 0;
        lastWheelAt = 0;
        previousWheelMagnitude = 0;
      }, 120);
    }, { passive: false });
  }

    updateCarousel();
  }

  carousels.forEach(initializeCarousel);
})();
