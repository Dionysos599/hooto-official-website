(() => {
  "use strict";

  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  const variant = header.dataset.variant || "sub";
  const isHome = variant === "home";
  const rootPath = header.dataset.root || (variant === "home" ? "." : "..");
  const homeLink = (hash) => isHome ? hash : `${rootPath}/index.html${hash}`;
  const siteLink = (path) => `${rootPath}/${path}`;
  const pageName = window.location.pathname.split("/").pop() || "index.html";
  const projectPages = new Set(["art-education.html", "cultural-ip.html", "technology.html"]);
  const mainLinks = {
    about: homeLink("#about"),
    projects: !isHome && projectPages.has(pageName) ? "#top" : homeLink("#projects"),
    mission: !isHome && pageName === "community-practice.html" ? "#top" : (isHome ? "#mission" : siteLink("pages/community-practice.html")),
    gallery: !isHome && pageName === "gallery.html" ? "#top" : siteLink("pages/gallery.html"),
  };

  const homeActions = `
    <button class="pill-button pill-button--store" type="button" data-store-open>
      <span class="lang-zh">Hooto商店</span><span class="lang-en">Hooto Store</span>
      <span aria-hidden="true">↗</span>
    </button>
    <a class="pill-button pill-button--dark" href="${homeLink("#about")}">
      <span class="lang-zh">开始合作</span><span class="lang-en">Start a project</span>
      <span aria-hidden="true">↗</span>
    </a>
  `;

  header.classList.add("site-header");
  if (!isHome) header.classList.add("site-header--sub");
  header.innerHTML = `
    <a class="brand-mark brand-mark--image" href="${isHome ? "#top" : `${rootPath}/index.html`}" aria-label="HOOTO 首页">
      <img src="${siteLink("assets/images/brand/896b3e9d-da7a-4a27-b4e6-cb7eeed55f71.jpg")}" alt="HOOTO 花头精">
    </a>

    <div class="site-nav-shell">
      <nav class="site-nav" aria-label="主导航">
        <a href="${mainLinks.about}" aria-controls="detailed-nav" aria-expanded="false"><span class="lang-zh">关于</span><span class="lang-en">About</span></a>
        <a href="${mainLinks.projects}" aria-controls="detailed-nav" aria-expanded="false"><span class="lang-zh">项目</span><span class="lang-en">Projects</span></a>
        <a href="${mainLinks.mission}" aria-controls="detailed-nav" aria-expanded="false"><span class="lang-zh">社会使命</span><span class="lang-en">Social Mission</span></a>
        <a href="${mainLinks.gallery}" aria-controls="detailed-nav" aria-expanded="false"><span class="lang-zh">线上画廊</span><span class="lang-en">Online Gallery</span></a>
      </nav>

      <div class="detailed-header" id="detailed-nav" aria-label="详细导航">
        <div class="detailed-header-grid">
          <div class="detailed-header-column">
            <a href="${homeLink("#about")}"><span class="lang-zh">联系方式</span><span class="lang-en">Contact</span></a>
          </div>
          <div class="detailed-header-column">
            <a href="${siteLink("pages/art-education.html")}"><span class="lang-zh">美育课程</span><span class="lang-en">Art Education</span></a>
            <a href="${siteLink("pages/cultural-ip.html")}"><span class="lang-zh">文创IP</span><span class="lang-en">Cultural IP</span></a>
            <a href="${siteLink("pages/technology.html")}"><span class="lang-zh">科技探索</span><span class="lang-en">Tech Exploration</span></a>
          </div>
          <div class="detailed-header-column">
            <a href="${siteLink("pages/community-practice.html")}"><span class="lang-zh">公益实践</span><span class="lang-en">Community Practice</span></a>
          </div>
          <div class="detailed-header-column">
            <a href="${siteLink("pages/gallery.html#cultural-ip")}"><span class="lang-zh">文创IP</span><span class="lang-en">Cultural IP</span></a>
            <a href="${siteLink("pages/gallery.html#student-showcase")}"><span class="lang-zh">学生成果展</span><span class="lang-en">Student Showcase</span></a>
          </div>
        </div>
      </div>
    </div>

    <div class="header-actions">${isHome ? homeActions : ""}</div>
  `;

  const nav = header.querySelector(".site-nav");
  const detail = header.querySelector(".detailed-header");
  const navLinks = [...nav.querySelectorAll("a")];
  const mobileQuery = window.matchMedia("(max-width: 900px)");

  const setOpen = (isOpen) => {
    header.classList.toggle("is-mobile-nav-open", isOpen);
    navLinks.forEach((link) => link.setAttribute("aria-expanded", String(isOpen)));
  };

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  header.addEventListener("click", (event) => {
    if (!mobileQuery.matches) return;
    if (event.target.closest("a, button, .detailed-header")) return;
    setOpen(!header.classList.contains("is-mobile-nav-open"));
  });

  detail.addEventListener("click", (event) => {
    if (mobileQuery.matches && event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("pointerdown", (event) => {
    if (mobileQuery.matches && header.classList.contains("is-mobile-nav-open") && !header.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  mobileQuery.addEventListener("change", () => setOpen(false));
})();
