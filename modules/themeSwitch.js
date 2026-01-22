define(["./krunkerScriptingAction.js"], function (krunkerScriptingAction) {
  function initThemeSwitch(themeModule, projectActions) {
    const banner = document.getElementById("banner-container");
    if (!banner) return;

    const wrapper = document.createElement("div");
    wrapper.id = "theme-switch";
    wrapper.style.position = "absolute";
    wrapper.style.right = "10px";
    wrapper.style.top = "50%";
    wrapper.style.transform = "translateY(-50%)";
    wrapper.style.zIndex = "1000";

    banner.appendChild(wrapper);


    const bgButton = document.createElement("button");
    bgButton.id = "background-button";
    bgButton.title = "Background";
    bgButton.style.display = "inline-flex";
    bgButton.style.alignItems = "center";
    bgButton.style.justifyContent = "center";
    bgButton.style.width = "28px";
    bgButton.style.height = "28px";
    bgButton.style.borderRadius = "6px";
    bgButton.style.border = "1px solid var(--glass-border-color)";
    bgButton.style.background = "var(--glass-bg)";
    bgButton.style.backdropFilter = `blur(var(--glass-blur))`;
    bgButton.style.cursor = "pointer";
    bgButton.style.padding = "0";
    bgButton.style.marginLeft = "8px";

    const bgIcon = document.createElement("img");
    bgIcon.src = "./assets/icons/image.svg";
    bgIcon.alt = "background";
    bgIcon.style.width = "16px";
    bgIcon.style.height = "16px";
    bgIcon.style.filter = "invert(1) brightness(0.9)";

    bgButton.appendChild(bgIcon);
    wrapper.appendChild(bgButton);





    const BG_DEFAULTS = ["../assets/theme1.jpg", "../assets/theme2.jpg"];
    const sourceOptions = Array.isArray(window.KRUNK_BG_OPTIONS) && window.KRUNK_BG_OPTIONS.length
      ? window.KRUNK_BG_OPTIONS
      : BG_DEFAULTS;
    const BG_SOLID_SENTINEL = "__solid_dark__";
    const BG_OPTIONS = sourceOptions.concat([BG_SOLID_SENTINEL]);

    function setBackground(url) {
      try {
        localStorage.setItem("krunk-bg", url);
      } catch (_) {}
      if (url === BG_SOLID_SENTINEL) {
        document.documentElement.style.setProperty("--app-bg-url", "none");
      } else {
        document.documentElement.style.setProperty("--app-bg-url", `url(${url})`);
      }
    }
    function getSavedBackground() {
      try {
        const v = localStorage.getItem("krunk-bg");
        if (v && (BG_OPTIONS.includes(v) || v === BG_SOLID_SENTINEL)) return v;
      } catch (_) {}
      return null;
    }

    const savedBg = getSavedBackground();
    const initialBg = savedBg || BG_SOLID_SENTINEL;
    setBackground(initialBg);

    if (!savedBg) {
      themeModule.applyTheme('krunk-dark-solid');
      themeModule.applyUIPalette('krunk-dark-solid');
    }

    const bgDropdown = document.createElement("div");
    bgDropdown.id = "background-dropdown";
    bgDropdown.style.position = "fixed";
    bgDropdown.style.minWidth = "220px";
    bgDropdown.style.background = "#0f0f1a";
    bgDropdown.style.border = "1px solid #3a3a5a";
    bgDropdown.style.borderRadius = "8px";
    bgDropdown.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
    bgDropdown.style.padding = "8px";
    bgDropdown.style.display = "none";
    bgDropdown.style.zIndex = "10000";
    bgDropdown.style.color = "#e0e0ff";

    const bgTitle = document.createElement("div");
    bgTitle.textContent = "Background";
    bgTitle.style.fontSize = "12px";
    bgTitle.style.opacity = "0.85";
    bgTitle.style.padding = "4px 6px 8px";
    bgTitle.style.color = "#a0a0c0";
    bgDropdown.appendChild(bgTitle);

    const currentBg = getSavedBackground();
    function mapBgToTheme(path) {
      const name = (path || "").toLowerCase();
      if (path === BG_SOLID_SENTINEL) return "krunk-dark-solid";
      if (name.includes("theme1")) return "krunk-space";
      if (name.includes("theme2")) return "krunk-forest";
      if (name.includes("theme3")) return "krunk-sunset";
      if (name.includes("theme4")) return "krunk-underwater";
      if (name.includes("theme5")) return "krunk-birch";
      if (name.includes("theme6")) return "krunk-snow";
      if (name.includes("theme7")) return "krunk-pirate";
      return themeModule.getSavedTheme() || "krunk-dark-glass";
    }

    function mapBgDisplayName(path) {
      const name = (path || "").toLowerCase();
      if (path === BG_SOLID_SENTINEL) return "Filled Dark";
      if (name.includes("theme1")) return "Space";
      if (name.includes("theme2")) return "Forest";
      if (name.includes("theme3")) return "Sunset";
      if (name.includes("theme4")) return "Underwater";
      if (name.includes("theme5")) return "Birch";
      if (name.includes("theme6")) return "Snow";
      if (name.includes("theme7")) return "Pirate";
      const filename = path.split("/").pop();
      return filename || "Background";
    }

    BG_OPTIONS.forEach((path) => {
      const item = document.createElement("div");
      item.textContent = mapBgDisplayName(path);
      item.style.padding = "8px 10px";
      item.style.borderRadius = "6px";
      item.style.cursor = "pointer";
      item.style.fontSize = "13px";

      item.style.color = "#e0e0ff";
      item.onmouseover = () => (item.style.background = "#2a2a4a");
      item.onmouseout = () => (item.style.background = "transparent");
      item.onclick = () => {
        setBackground(path);
  
        const themeName = mapBgToTheme(path);
        themeModule.applyTheme(themeName);
        themeModule.applyUIPalette(themeName);
        bgDropdown.style.display = "none";
      };
      bgDropdown.appendChild(item);
    });

    document.body.appendChild(bgDropdown);

    bgButton.onclick = (e) => {
      e.stopPropagation();

      try { dropdown.style.display = "none"; } catch (_) {}
      try { docsDropdown.style.display = "none"; } catch (_) {}
      try { fileDropdown.style.display = "none"; } catch (_) {}
      const showing = bgDropdown.style.display !== "none";
      if (showing) {
        bgDropdown.style.display = "none";
        return;
      }
      const rect = bgButton.getBoundingClientRect();
      bgDropdown.style.top = `${Math.round(rect.bottom + 6)}px`;
      bgDropdown.style.right = `${Math.round(window.innerWidth - rect.right)}px`;
      bgDropdown.style.display = "block";
    };



    const closeBg = (ev) => {
      if (!bgDropdown.contains(ev.target) && !wrapper.contains(ev.target)) {
        bgDropdown.style.display = "none";
      }
    };
    document.addEventListener("mousedown", closeBg);


    const docsButton = document.createElement("button");
    docsButton.id = "documents-button";
    docsButton.title = "Documents";
    docsButton.style.display = "inline-flex";
    docsButton.style.alignItems = "center";
    docsButton.style.justifyContent = "center";
    docsButton.style.width = "28px";
    docsButton.style.height = "28px";
    docsButton.style.borderRadius = "6px";
    docsButton.style.border = "1px solid var(--glass-border-color)";
    docsButton.style.background = "var(--glass-bg)";
    docsButton.style.backdropFilter = `blur(var(--glass-blur))`;
    docsButton.style.cursor = "pointer";
    docsButton.style.padding = "0";
    docsButton.style.marginLeft = "8px";

    const docsIcon = document.createElement("img");
    docsIcon.src = "./assets/icons/file-text.svg";
    docsIcon.alt = "documents";
    docsIcon.style.width = "16px";
    docsIcon.style.height = "16px";
    docsIcon.style.filter = "invert(1) brightness(0.9)";

    docsButton.appendChild(docsIcon);
    wrapper.appendChild(docsButton);

    const docsDropdown = document.createElement("div");
    docsDropdown.id = "documents-dropdown";
    docsDropdown.style.position = "fixed";
    docsDropdown.style.minWidth = "240px";
    docsDropdown.style.background = "#0f0f1a";
    docsDropdown.style.border = "1px solid #3a3a5a";
    docsDropdown.style.borderRadius = "8px";
    docsDropdown.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
    docsDropdown.style.padding = "8px";
    docsDropdown.style.display = "none";
    docsDropdown.style.zIndex = "10000";
    docsDropdown.style.color = "#e0e0ff";

    const docsTitle = document.createElement("div");
    docsTitle.textContent = "Documents";
    docsTitle.style.fontSize = "12px";
    docsTitle.style.opacity = "0.85";
    docsTitle.style.padding = "4px 6px 8px";
    docsTitle.style.color = "#a0a0c0";
    docsDropdown.appendChild(docsTitle);

    function makeLink(label, href) {
      const link = document.createElement("a");
      link.textContent = label;
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.display = "block";
      link.style.textDecoration = "none";
      link.style.padding = "8px 10px";
      link.style.borderRadius = "6px";
      link.style.fontSize = "13px";
      link.style.color = "#e0e0ff";
      link.onmouseover = () => (link.style.background = "#2a2a4a");
      link.onmouseout = () => (link.style.background = "transparent");
      return link;
    }

    const linkKrunker = makeLink("Krunker Docs", "https://docs.krunker.io/#/");
    const linkSwatdoge = makeLink("SOTT Quick Krunker Docs", "https://swatdoge.eu/home.html");
    linkKrunker.onclick = () => { docsDropdown.style.display = "none"; };
    linkSwatdoge.onclick = () => { docsDropdown.style.display = "none"; };

    const linkComing = document.createElement("div");
    linkComing.textContent = "More docs (coming soon)";
    linkComing.style.padding = "8px 10px";
    linkComing.style.borderRadius = "6px";
    linkComing.style.fontSize = "13px";
    linkComing.style.color = "#9aa0c8";
    linkComing.style.opacity = "0.7";

    docsDropdown.appendChild(linkKrunker);
    docsDropdown.appendChild(linkSwatdoge);
    docsDropdown.appendChild(linkComing);

    document.body.appendChild(docsDropdown);

    docsButton.onclick = (e) => {
      e.stopPropagation();

      try { dropdown.style.display = "none"; } catch (_) {}
      try { bgDropdown.style.display = "none"; } catch (_) {}
      const showing = docsDropdown.style.display !== "none";
      if (showing) {
        docsDropdown.style.display = "none";
        return;
      }
      const rect = docsButton.getBoundingClientRect();
      docsDropdown.style.top = `${Math.round(rect.bottom + 6)}px`;
      docsDropdown.style.right = `${Math.round(window.innerWidth - rect.right)}px`;
      docsDropdown.style.display = "block";
    };

    const closeDocs = (ev) => {
      if (!docsDropdown.contains(ev.target) && !wrapper.contains(ev.target)) {
        docsDropdown.style.display = "none";
      }
    };
    document.addEventListener("mousedown", closeDocs);


    const searchButton = document.createElement("button");
    searchButton.id = "search-button";
    searchButton.title = "Search";
    searchButton.style.display = "inline-flex";
    searchButton.style.alignItems = "center";
    searchButton.style.justifyContent = "center";
    searchButton.style.width = "28px";
    searchButton.style.height = "28px";
    searchButton.style.borderRadius = "6px";
    searchButton.style.border = "1px solid var(--glass-border-color)";
    searchButton.style.background = "var(--glass-bg)";
    searchButton.style.backdropFilter = `blur(var(--glass-blur))`;
    searchButton.style.cursor = "pointer";
    searchButton.style.padding = "0";
    searchButton.style.marginLeft = "8px";

    const searchIcon = document.createElement("img");
    searchIcon.src = "./assets/icons/search.svg";
    searchIcon.alt = "search";
    searchIcon.style.width = "16px";
    searchIcon.style.height = "16px";
    searchIcon.style.filter = "invert(1) brightness(0.9)";

    searchButton.appendChild(searchIcon);
    wrapper.appendChild(searchButton);

    const searchDropdown = document.createElement("div");
    searchDropdown.id = "search-dropdown";
    searchDropdown.style.position = "fixed";
    searchDropdown.style.minWidth = "260px";
    searchDropdown.style.background = "#0f0f1a";
    searchDropdown.style.border = "1px solid #3a3a5a";
    searchDropdown.style.borderRadius = "8px";
    searchDropdown.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
    searchDropdown.style.padding = "10px";
    searchDropdown.style.display = "none";
    searchDropdown.style.zIndex = "10000";
    searchDropdown.style.color = "#e0e0ff";

    const searchTitle = document.createElement("div");
    searchTitle.textContent = "Search";
    searchTitle.style.fontSize = "12px";
    searchTitle.style.opacity = "0.85";
    searchTitle.style.padding = "4px 6px 8px";
    searchTitle.style.color = "#a0a0c0";
    searchDropdown.appendChild(searchTitle);

    const searchRow = document.createElement("div");
    searchRow.style.display = "flex";
    searchRow.style.gap = "8px";
    searchRow.style.alignItems = "center";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Type and press Enter...";
    searchInput.style.flex = "1";
    searchInput.style.background = "var(--ui-input-bg)";
    searchInput.style.color = "var(--ui-text)";
    searchInput.style.border = "1px solid var(--ui-border)";
    searchInput.style.borderRadius = "6px";
    searchInput.style.padding = "6px 8px";
    searchInput.style.outline = "none";

    const searchGo = document.createElement("button");
    searchGo.textContent = "Find";
    searchGo.style.padding = "6px 10px";
    searchGo.style.borderRadius = "6px";
    searchGo.style.border = "1px solid var(--ui-border)";
    searchGo.style.background = "var(--glass-bg)";
    searchGo.style.color = "var(--ui-text)";
    searchGo.style.cursor = "pointer";

    searchRow.appendChild(searchInput);
    searchRow.appendChild(searchGo);
    searchDropdown.appendChild(searchRow);

    document.body.appendChild(searchDropdown);

    function performSearch(query) {
      try {
        const editor = window.editor;
        if (!editor) return;
        const model = editor.getModel();
        if (!model) return;
        const text = String(query || "").trim();
        if (!text) {

          window.__searchDecorations = editor.deltaDecorations(window.__searchDecorations || [], []);
          return;
        }
 
        const matches = model.findMatches(text, false, false, false, null, false);
        const decos = matches.map(m => ({
          range: m.range,
          options: {
            inlineClassName: "search-hit",
          }
        }));
        window.__searchDecorations = editor.deltaDecorations(window.__searchDecorations || [], decos);
      } catch (err) {
        console.error('Search failed', err);
      }
    }

    searchGo.onclick = () => {
      performSearch(searchInput.value);
    };
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performSearch(searchInput.value);
      }
    });

    searchButton.onclick = (e) => {
      e.stopPropagation();

      try { bgDropdown.style.display = "none"; } catch (_) {}
      try { docsDropdown.style.display = "none"; } catch (_) {}
      try { fileDropdown.style.display = "none"; } catch (_) {}
      const showing = searchDropdown.style.display !== "none";
      if (showing) {
        searchDropdown.style.display = "none";
        return;
      }
      const rect = searchButton.getBoundingClientRect();
      searchDropdown.style.top = `${Math.round(rect.bottom + 6)}px`;
      searchDropdown.style.right = `${Math.round(window.innerWidth - rect.right)}px`;
      searchDropdown.style.display = "block";
      setTimeout(() => searchInput.focus(), 0);
    };

    const closeSearch = (ev) => {
      if (!searchDropdown.contains(ev.target) && !wrapper.contains(ev.target)) {
        searchDropdown.style.display = "none";
      }
    };
    document.addEventListener("mousedown", closeSearch);

    const fileMenuBtn = document.createElement("button");
    fileMenuBtn.id = "file-menu-button";
    fileMenuBtn.title = "File Menu";
    fileMenuBtn.style.display = "inline-flex";
    fileMenuBtn.style.alignItems = "center";
    fileMenuBtn.style.justifyContent = "center";
    fileMenuBtn.style.height = "28px";
    fileMenuBtn.style.borderRadius = "6px";
    fileMenuBtn.style.border = "1px solid var(--glass-border-color)";
    fileMenuBtn.style.background = "var(--glass-bg)";
    fileMenuBtn.style.backdropFilter = `blur(var(--glass-blur))`;
    fileMenuBtn.style.cursor = "pointer";
    fileMenuBtn.style.padding = "0 8px";
    fileMenuBtn.style.marginLeft = "8px";
    fileMenuBtn.style.color = "var(--ui-text)";
    fileMenuBtn.style.fontSize = "12px";
    fileMenuBtn.style.gap = "6px";

    const fileLabel = document.createElement("span");
    fileLabel.textContent = "FILE";
    const caret = document.createElement("span");
    caret.textContent = "▾";
    caret.style.opacity = "0.8";
    fileMenuBtn.appendChild(fileLabel);
    fileMenuBtn.appendChild(caret);
    wrapper.appendChild(fileMenuBtn);

    const fileDropdown = document.createElement("div");
    fileDropdown.id = "file-menu-dropdown";
    fileDropdown.style.position = "fixed";
    fileDropdown.style.minWidth = "220px";
    fileDropdown.style.background = "#0f0f1a";
    fileDropdown.style.border = "1px solid #3a3a5a";
    fileDropdown.style.borderRadius = "8px";
    fileDropdown.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
    fileDropdown.style.padding = "8px";
    fileDropdown.style.display = "none";
    fileDropdown.style.zIndex = "10000";
    fileDropdown.style.color = "#e0e0ff";

    function makeItem(label, handler, isDanger = false) {
      const item = document.createElement("div");
      item.textContent = label;
      item.style.padding = "8px 10px";
      item.style.borderRadius = "6px";
      item.style.cursor = "pointer";
      item.style.fontSize = "13px";
      item.style.color = isDanger ? "#ff9a9a" : "#e0e0ff";
      item.onmouseover = () => (item.style.background = "#2a2a4a");
      item.onmouseout = () => (item.style.background = "transparent");
      item.onclick = async () => {
        fileDropdown.style.display = "none";
        try { await handler(); } catch (err) { console.error(err); }
      };
      return item;
    }


    async function clearLocalData() {
      try {
        if (window.storage && typeof window.storage.clearProject === 'function') {
          await window.storage.clearProject();
        }
      } catch (_) {}

      location.reload();
    }



    const itemNew = makeItem('New Project', () => projectActions.newProject());
    const itemImport = makeItem('Import Project…', () => projectActions.importProject());
    const itemExport = makeItem('Export Project…', () => projectActions.exportProject(window.project));
    const itemOpenLinked = makeItem('Open Linked Editor', () => krunkerScriptingAction.openKrunkerEditor());

    const titleFile = document.createElement('div');
    titleFile.textContent = 'File';
    titleFile.style.fontSize = '12px';
    titleFile.style.opacity = '0.85';
    titleFile.style.padding = '4px 6px 8px';
    titleFile.style.color = '#a0a0c0';
    fileDropdown.appendChild(titleFile);

    fileDropdown.appendChild(itemNew);
    fileDropdown.appendChild(itemImport);
    fileDropdown.appendChild(itemExport);
    fileDropdown.appendChild(itemOpenLinked);

    document.body.appendChild(fileDropdown);

    fileMenuBtn.onclick = (e) => {
      e.stopPropagation();

      try { dropdown.style.display = 'none'; } catch(_) {}
      try { bgDropdown.style.display = 'none'; } catch(_) {}
      try { docsDropdown.style.display = 'none'; } catch(_) {}
      const showing = fileDropdown.style.display !== 'none';
      if (showing) { fileDropdown.style.display = 'none'; return; }
      const rect = fileMenuBtn.getBoundingClientRect();
      fileDropdown.style.top = `${Math.round(rect.bottom + 6)}px`;
      fileDropdown.style.right = `${Math.round(window.innerWidth - rect.right)}px`;
      fileDropdown.style.display = 'block';
    };

    const closeFile = (ev) => {
      if (!fileDropdown.contains(ev.target) && !wrapper.contains(ev.target)) {
        fileDropdown.style.display = 'none';
      }
    };
    document.addEventListener('mousedown', closeFile);
  }

  return { initThemeSwitch };
});
