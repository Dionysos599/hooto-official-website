(() => {
  "use strict";

  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  const variant = header.dataset.variant === "home" ? "home" : "sub";
  const rootPath = header.dataset.root || (variant === "home" ? "." : "..");
  const homeLink = (hash) => variant === "home" ? hash : `${rootPath}/index.html${hash}`;
  const siteLink = (path) => `${rootPath}/${path}`;

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

  const subActions = `
    <a class="pill-button pill-button--dark site-header-back" href="${homeLink("#projects")}">
      <span class="lang-zh">返回</span><span class="lang-en">Back</span>
      <span aria-hidden="true">←</span>
    </a>
  `;

  header.classList.add("site-header");
  if (variant === "sub") header.classList.add("site-header--sub");
  header.innerHTML = `
    <a class="brand-mark brand-mark--image" href="${variant === "home" ? "#top" : `${rootPath}/index.html`}" aria-label="HOOTO 首页">
      <img src="${siteLink("image/896b3e9d-da7a-4a27-b4e6-cb7eeed55f71.jpg")}" alt="HOOTO 花头精">
    </a>

    <div class="site-nav-shell">
      <nav class="site-nav" aria-label="主导航">
        <a href="${homeLink("#about")}" aria-controls="detailed-nav" aria-expanded="false"><span class="lang-zh">关于</span><span class="lang-en">About</span></a>
        <a href="${homeLink("#projects")}" aria-controls="detailed-nav" aria-expanded="false"><span class="lang-zh">项目</span><span class="lang-en">Projects</span></a>
        <a href="${homeLink("#mission")}" aria-controls="detailed-nav" aria-expanded="false"><span class="lang-zh">社会使命</span><span class="lang-en">Social Mission</span></a>
        <a href="${siteLink("sub/gallery.html")}" aria-controls="detailed-nav" aria-expanded="false"><span class="lang-zh">线上画廊</span><span class="lang-en">Online Gallery</span></a>
      </nav>

      <div class="detailed-header" id="detailed-nav" aria-label="详细导航">
        <div class="detailed-header-grid">
          <div class="detailed-header-column">
            <a href="${homeLink("#about")}"><span class="lang-zh">联系方式</span><span class="lang-en">Contact</span></a>
          </div>
          <div class="detailed-header-column">
            <a href="${siteLink("sub/summer.html")}"><span class="lang-zh">美育课程</span><span class="lang-en">Art Education</span></a>
            <a href="${siteLink("sub/ip.html")}"><span class="lang-zh">文创IP</span><span class="lang-en">Cultural IP</span></a>
            <a href="${siteLink("sub/technology.html")}"><span class="lang-zh">科技探索</span><span class="lang-en">Tech Exploration</span></a>
          </div>
          <div class="detailed-header-column">
            <a href="${siteLink("sub/collaboration.html")}"><span class="lang-zh">公益实践</span><span class="lang-en">Community Practice</span></a>
          </div>
          <div class="detailed-header-column">
            <a href="${siteLink("sub/gallery.html#cultural-ip")}"><span class="lang-zh">文创IP</span><span class="lang-en">Cultural IP</span></a>
            <a href="${siteLink("sub/gallery.html#student-showcase")}"><span class="lang-zh">学生成果展</span><span class="lang-en">Student Showcase</span></a>
          </div>
        </div>
      </div>
    </div>

    <div class="header-actions">${variant === "home" ? homeActions : subActions}</div>
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
    const link = event.target.closest("a");
    if (!mobileQuery.matches || !link) return;

    if (!header.classList.contains("is-mobile-nav-open")) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    setOpen(false);
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
