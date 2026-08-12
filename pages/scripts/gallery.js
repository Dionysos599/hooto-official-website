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

    const imagePaths = Array.isArray(galleryData[galleryKey]) ? galleryData[galleryKey] : [];
    if (imagePaths.length === 0) {
      const empty = document.createElement("p");
      empty.className = "gallery-empty";
      empty.textContent = "画廊图片正在整理中。";
      grid.replaceWith(empty);
      return;
    }

    const columns = Array.from({ length: columnCount }, () => document.createElement("div"));
    columns.forEach((column) => column.classList.add("gallery-column"));
    grid.style.setProperty("--gallery-column-count", String(columnCount));

    imagePaths.forEach((path, index) => {
      const figure = document.createElement("figure");
      const image = document.createElement("img");

      figure.className = "gallery-item";
      image.src = `../${path}`;
      image.alt = imageAlt(path);
      image.loading = index < 4 ? "eager" : "lazy";
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
