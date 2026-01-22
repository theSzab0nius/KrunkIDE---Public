define([], function () {
  function setupInspector(project, models, fileManager, inspectorUIModule, openFile) {

    const openFileForward = (fileName, focusEditor = true) => {
      if (typeof window.openFile === 'function') {
        window.openFile(fileName, focusEditor);
      } else if (typeof openFile === 'function') {
        openFile(fileName, focusEditor);
      }
    };
    function renderInspector() {
      inspectorUIModule.renderInspector(project, openFileForward, renameFile, deleteFileByName);
    }
    const createNewFile = () => fileManager.createNewFile(project, models, openFileForward);
    const renameFile = (fileName) => fileManager.renameFile(fileName, project, models, openFileForward, renderInspector);
    const deleteFileByName = (fileName) => fileManager.deleteFileByName(fileName, project, models, openFileForward, renderInspector);
    const deleteCurrentFile = () => deleteFileByName(project.activeFile);

    const btnNewFile = document.getElementById("btn-new-file");
    const btnDeleteFile = document.getElementById("btn-delete-file");
    const btnImportFile = document.getElementById("btn-import-file");
    if (btnNewFile) btnNewFile.onclick = createNewFile;
    if (btnDeleteFile) btnDeleteFile.onclick = deleteCurrentFile;

    function importFile() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.json,.krnk';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.onchange = () => {
        const file = input.files && input.files[0];
        if (!file) {
          document.body.removeChild(input);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const content = typeof reader.result === 'string' ? reader.result : '';
          const name = file.name || 'import.krnk';
          fileManager.createFileWithContent(name, content, project, models, openFile);
          renderInspector();
          document.body.removeChild(input);
        };
        reader.onerror = () => {
          console.error('Failed to read file');
          document.body.removeChild(input);
        };
        reader.readAsText(file);
      };
      input.click();
    }
    if (btnImportFile) btnImportFile.onclick = importFile;

    function setupDragImport() {
      const inspectorPanel = document.getElementById("inspector-panel");
      const inspectorFiles = document.getElementById("inspector-files");
      const target = inspectorFiles || inspectorPanel;
      if (!target) return;

      const allowed = /\.(txt|json|krnk)$/i;
      const addDragClass = () => inspectorPanel && inspectorPanel.classList.add("drag-over");
      const removeDragClass = () => inspectorPanel && inspectorPanel.classList.remove("drag-over");

      target.addEventListener("dragenter", (e) => {
        e.preventDefault();
        addDragClass();
      });
      target.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        addDragClass();
      });
      target.addEventListener("dragleave", (e) => {
        removeDragClass();
      });
      target.addEventListener("drop", (e) => {
        e.preventDefault();
        removeDragClass();

        const files = e.dataTransfer?.files;
        if (!files || files.length === 0) return;

        let openedFirst = false;
        Array.from(files).forEach((file) => {
          const name = file.name || "import.krnk";
          if (!allowed.test(name)) return;
          const reader = new FileReader();
          reader.onload = () => {
            const content = typeof reader.result === "string" ? reader.result : "";
            const finalName = fileManager.createFileWithContent(name, content, project, models, openedFirst ? (/* noop */ () => {}) : openFile);
            if (!openedFirst) {
              openedFirst = true;
            }
            renderInspector();
          };
          reader.onerror = () => console.error("Failed to read dropped file:", name);
          reader.readAsText(file);
        });
      });
    }

    setupDragImport();

  
    window.renderInspector = renderInspector;
    window.createNewFile = createNewFile;
    window.deleteCurrentFile = deleteCurrentFile;
    window.renameFile = renameFile;
    window.importFile = importFile;

    return { renderInspector, createNewFile, deleteCurrentFile, renameFile, deleteFileByName };
  }

  return { setupInspector };
});
