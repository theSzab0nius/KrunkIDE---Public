define([], function () {
  function renderInspector(project, openFile, renameFile, deleteFileByName) {
    const inspectorFiles = document.getElementById("inspector-files");
    inspectorFiles.innerHTML = "";
    Object.entries(project.files).forEach(([fileName, file]) => {
      const item = document.createElement("div");

      const displayName = fileName.replace(/\.[^/.]+$/, "");
      item.title = fileName;
      item.style.padding = "8px 12px";
      item.style.cursor = "pointer";
      item.style.borderBottom = "1px solid #2a2a4a";
      if (project.activeFile === fileName) {
        item.style.background = "#2a2a4a";
      }

      const dot = document.createElement("span");
      dot.style.display = "inline-block";
      dot.style.width = "8px";
      dot.style.height = "8px";
      dot.style.borderRadius = "50%";
      dot.style.marginRight = "8px";
      dot.style.verticalAlign = "middle";
      const hasErrors = !!file.hasErrors;
      const isValid = !!file.valid;
      dot.style.background = hasErrors
        ? "var(--ui-error)"
        : (isValid ? "var(--ui-success)" : "var(--ui-accent)");

      const nameEl = document.createElement("span");
      nameEl.textContent = displayName;
      nameEl.style.verticalAlign = "middle";

      item.appendChild(dot);
      item.appendChild(nameEl);
      const badge = document.createElement("span");
      badge.textContent = file.type;
      badge.style.float = "right";
      badge.style.fontSize = "11px";
      badge.style.opacity = "0.7";
      item.appendChild(badge);
      item.onclick = () => openFile(fileName);
      item.oncontextmenu = (e) => {
        e.preventDefault();
        const isLibrary =
          file.type === "clientLibrary" ||
          file.type === "serverLibrary" ||
          file.type === "sharedLibrary";
        if (!isLibrary) return;
        const menu = document.createElement("div");
        menu.style.position = "fixed";
        menu.style.top = e.clientY + "px";
        menu.style.left = e.clientX + "px";
        menu.style.background = "#1a1a2e";
        menu.style.border = "1px solid #3a3a5a";
        menu.style.borderRadius = "4px";
        menu.style.zIndex = "10000";
        menu.style.minWidth = "100px";
        menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        const renameBtn = document.createElement("div");
        renameBtn.textContent = "Rename";
        renameBtn.style.padding = "8px 12px";
        renameBtn.style.cursor = "pointer";
        renameBtn.style.borderBottom = "1px solid #2a2a4a";
        renameBtn.style.fontSize = "12px";
        renameBtn.onmouseover = () => (renameBtn.style.background = "#2a2a4a");
        renameBtn.onmouseout = () =>
          (renameBtn.style.background = "transparent");
        renameBtn.onclick = () => {
          document.body.removeChild(menu);
          renameFile(fileName);
        };
        const typeBtn = document.createElement("div");
        typeBtn.textContent = "Type ▶";
        typeBtn.style.padding = "8px 12px";
        typeBtn.style.cursor = "pointer";
        typeBtn.style.borderBottom = "1px solid #2a2a4a";
        typeBtn.style.fontSize = "12px";
        typeBtn.onmouseover = () => (typeBtn.style.background = "#2a2a4a");
        typeBtn.onmouseout = () => (typeBtn.style.background = "transparent");
        typeBtn.onclick = (e) => {
          e.stopPropagation();
          const submenu = document.createElement("div");
          submenu.style.position = "fixed";
          submenu.style.top = typeBtn.getBoundingClientRect().top + "px";
          submenu.style.left = typeBtn.getBoundingClientRect().right + 5 + "px";
          submenu.style.background = "#1a1a2e";
          submenu.style.border = "1px solid #3a3a5a";
          submenu.style.borderRadius = "4px";
          submenu.style.zIndex = "10001";
          submenu.style.minWidth = "120px";
          submenu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
          ["clientLibrary", "serverLibrary", "sharedLibrary"].forEach(
            (type) => {
              const typeOption = document.createElement("div");
              typeOption.textContent = type;
              typeOption.style.padding = "8px 12px";
              typeOption.style.cursor = "pointer";
              typeOption.style.fontSize = "12px";
              typeOption.onmouseover = () =>
                (typeOption.style.background = "#2a2a4a");
              typeOption.onmouseout = () =>
                (typeOption.style.background = "transparent");
              typeOption.onclick = () => {
                if (submenu.parentNode) {
                  submenu.parentNode.removeChild(submenu);
                }
                if (menu.parentNode) {
                  menu.parentNode.removeChild(menu);
                }
                if (window.fileManager && window.fileManager.changeFileType) {
                  window.fileManager.changeFileType(fileName, type, project, () => renderInspector(project, openFile, renameFile, deleteFileByName));
                } else {
                  file.type = type;
                  renderInspector(project, openFile, renameFile, deleteFileByName);
                }
              };
              submenu.appendChild(typeOption);
            }
          );
          document.body.appendChild(submenu);
          const closeSubmenu = (ev) => {
            if (!submenu.contains(ev.target)) {
              document.body.removeChild(submenu);
              document.removeEventListener("mousedown", closeSubmenu);
            }
          };
          document.addEventListener("mousedown", closeSubmenu);
        };
        const deleteBtn = document.createElement("div");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.padding = "8px 12px";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.fontSize = "12px";
        deleteBtn.style.color = "#ff4d4d";
        deleteBtn.style.fontWeight = "bold";
        deleteBtn.onmouseover = () => {
          deleteBtn.style.background = "#2a2a4a";
          deleteBtn.style.color = "#fff";
        };
        deleteBtn.onmouseout = () => {
          deleteBtn.style.background = "transparent";
          deleteBtn.style.color = "#ff4d4d";
        };
        deleteBtn.onclick = () => {
          document.body.removeChild(menu);
          deleteFileByName(fileName);
        };
        menu.appendChild(renameBtn);
        menu.appendChild(typeBtn);
        menu.appendChild(deleteBtn);
        document.body.appendChild(menu);
        const closeMenu = (ev) => {
          if (!menu.contains(ev.target)) {
            document.body.removeChild(menu);
            document.removeEventListener("mousedown", closeMenu);
          }
        };
        document.addEventListener("mousedown", closeMenu);
      };
      inspectorFiles.appendChild(item);
    });
    // Update delete button state
    const btnDeleteFile = document.getElementById("btn-delete-file");
    const currentFile = project.files[project.activeFile];
    const isLibrary =
      currentFile &&
      (currentFile.type === "clientLibrary" ||
        currentFile.type === "serverLibrary" ||
        currentFile.type === "sharedLibrary");
    if (btnDeleteFile) btnDeleteFile.disabled = !isLibrary;
  }
  return { renderInspector };
});
