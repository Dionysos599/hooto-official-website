(() => {
  "use strict";

  const galleryData = window.HOOTO_GALLERY_IMAGES || {};
  const desktopGalleryQuery = window.matchMedia("(min-width: 601px)");
  const tabs = [...document.querySelectorAll("[data-gallery-tab]")];
  const panels = [...document.querySelectorAll("[data-gallery-panel]")];
  const galleryKeys = new Set(tabs.map((tab) => tab.dataset.galleryTab));
  const hashToGallery = {
    "#cultural-ip": "culturalIp",
    "#student-showcase": "studentShowcase"
  };

  function imageAlt(path) {
    const filename = path.split("/").pop() || "HOOTO 画廊作品";
    return filename.replace(/^\d+-/, "").replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  }

  function renderGallery(galleryKey, columnCount) {
    const grid = document.querySelector(`[data-gallery-grid="${galleryKey}"]`);
    if (!grid) return;

    const imageItems = Array.isArray(galleryData[galleryKey]) ? galleryData[galleryKey] : [];
    if (imageItems.length === 0) {
      const empty = document.createElement("p");
      empty.className = "gallery-empty";
      empty.textContent = "画廊图片正在整理中。";
      grid.replaceWith(empty);
      return;
    }

    const columns = Array.from({ length: columnCount }, () => document.createElement("div"));
    columns.forEach((column) => column.classList.add("gallery-column"));
    grid.style.setProperty("--gallery-column-count", String(columnCount));

    imageItems.forEach((item, index) => {
      const source = typeof item === "string" ? { src: item, variants: [] } : item;
      const variants = Array.isArray(source.variants) ? source.variants : [];
      const figure = document.createElement("figure");
      const image = document.createElement("img");

      figure.className = "gallery-item";
      const largestVariant = variants.at(-1);
      image.src = `../${largestVariant?.src || source.src}`;
      if (variants.length) {
        image.srcset = variants.map((variant) => `../${variant.src} ${variant.width}w`).join(", ");
        image.sizes = desktopGalleryQuery.matches ? "25vw" : "50vw";
      }
      image.alt = imageAlt(source.src);
      const displayWidth = largestVariant?.width || source.width;
      const displayHeight = largestVariant?.height || source.height;
      if (displayWidth && displayHeight) {
        image.width = displayWidth;
        image.height = displayHeight;
      }
      image.loading = index < 4 ? "eager" : "lazy";
      if (index < 4) image.fetchPriority = "high";
      image.decoding = "async";
      figure.append(image);
      columns[index % columns.length].append(figure);
    });

    grid.replaceChildren(...columns);
  }

  function renderAllGalleries() {
    const columnCount = desktopGalleryQuery.matches ? 4 : 2;
    Object.keys(galleryData).forEach((galleryKey) => renderGallery(galleryKey, columnCount));
  }

  function setActiveGallery(galleryKey, updateHash = true) {
    if (!galleryKeys.has(galleryKey)) galleryKey = "culturalIp";

    tabs.forEach((tab) => {
      const isActive = tab.dataset.galleryTab === galleryKey;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.galleryPanel !== galleryKey;
    });

    if (updateHash) {
      const activePanel = panels.find((panel) => panel.dataset.galleryPanel === galleryKey);
      if (activePanel) history.replaceState(null, "", `#${activePanel.id}`);
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setActiveGallery(tab.dataset.galleryTab));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextTab = tabs[(index + direction + tabs.length) % tabs.length];
      nextTab.focus();
      setActiveGallery(nextTab.dataset.galleryTab);
    });
  });

  renderAllGalleries();
  desktopGalleryQuery.addEventListener("change", renderAllGalleries);
  setActiveGallery(hashToGallery[location.hash] || "culturalIp", false);

  window.addEventListener("hashchange", () => {
    setActiveGallery(hashToGallery[location.hash] || "culturalIp", false);
  });
})();
