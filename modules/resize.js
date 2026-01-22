define([], function () {
  function initResize() {
    const resizeHandle = document.getElementById("resize-handle");
    const editorContainer = document.getElementById("editor-container");
    const inspectorPanel = document.getElementById("inspector-panel");
    const mainContent = document.getElementById("main-content");

    if (!resizeHandle || !editorContainer || !inspectorPanel || !mainContent) {
      return; 
    }

    let isResizing = false;

    resizeHandle.addEventListener("mousedown", () => {
      isResizing = true;
      resizeHandle.classList.add("dragging");
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      const mainRect = mainContent.getBoundingClientRect();
      const newEditorWidth = e.clientX - mainRect.left;
      const minWidth = 200;
      const maxWidth = mainRect.width - 200;
      if (newEditorWidth > minWidth && newEditorWidth < maxWidth) {
        const inspectorWidth = mainRect.width - newEditorWidth - 5;
        editorContainer.style.flex = "0 0 " + newEditorWidth + "px";
        inspectorPanel.style.flex = "0 0 " + inspectorWidth + "px";
        window.dispatchEvent(new Event("resize"));
      }
    });

    document.addEventListener("mouseup", () => {
      isResizing = false;
      resizeHandle.classList.remove("dragging");
      document.body.style.userSelect = "";
    });
  }

  return { initResize };
});
