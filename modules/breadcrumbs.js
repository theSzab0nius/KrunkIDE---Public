define([], function() {
  return {
    setupBreadcrumbs: function(config) {
      const { editor, project, bannerContainer } = config;

      const breadcrumbs = document.createElement("div");
      breadcrumbs.style.display = "flex";
      breadcrumbs.style.alignItems = "left";
      breadcrumbs.style.gap = "8px";
      breadcrumbs.style.fontSize = "12px";
      breadcrumbs.style.color = "#a0a0c0";

      const fileSpan = document.createElement("span");
      fileSpan.id = "breadcrumb-file";
      fileSpan.style.fontWeight = "bold";
      fileSpan.style.color = "#a78bfa";

      const separator = document.createElement("span");
      separator.textContent = "›";
      separator.style.color = "#6a6a8a";

      const functionSpan = document.createElement("span");
      functionSpan.id = "breadcrumb-function";
      functionSpan.style.color = "#7a9fcf";

      breadcrumbs.appendChild(fileSpan);
      breadcrumbs.appendChild(separator);
      breadcrumbs.appendChild(functionSpan);

      bannerContainer.appendChild(breadcrumbs);

      function updateBreadcrumbs() {
        const fileName = project.activeFile;
        fileSpan.textContent = fileName;

        const currentFunction = findCurrentFunction(editor);
        functionSpan.textContent = currentFunction || "global";
      }

      function findCurrentFunction(editor) {
        const position = editor.getPosition();
        const model = editor.getModel();
        if (!model || !position) return null;

        const text = model.getValue();
        const lines = text.split("\n");
        let currentFunction = null;

        for (let i = position.lineNumber - 1; i >= 1; i--) {
          const line = lines[i - 1];

          const match = line.match(/(?:public\s+)?action\s+(\w+)\s*\(/);
          if (match) {
            currentFunction = match[1];
            break;
          }
        }

        return currentFunction;
      }

      editor.onDidChangeCursorPosition(() => {
        updateBreadcrumbs();
      });

      editor.onDidChangeModel(() => {
        updateBreadcrumbs();
      });

      updateBreadcrumbs();

      return {
        updateBreadcrumbs: updateBreadcrumbs
      };
    }
  };
});
