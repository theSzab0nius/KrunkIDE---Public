define([], function () {
  function setupValidation(editor, model, validator, project) {
    function normalizeMarkers(markers, currentModel) {
      if (!Array.isArray(markers)) return [];
      const out = [];
      for (const m of markers) {

        if (
          m &&
          typeof m.startLineNumber === 'number' &&
          typeof m.startColumn === 'number' &&
          typeof m.endLineNumber === 'number' &&
          typeof m.endColumn === 'number'
        ) {

          const sev = (typeof m.severity === 'string') ? m.severity.toLowerCase() : m.severity;
          let severity = sev;
          if (typeof sev === 'string' && typeof monaco !== 'undefined' && monaco.MarkerSeverity) {
            severity = sev === 'warning' ? monaco.MarkerSeverity.Warning
              : sev === 'info' ? monaco.MarkerSeverity.Info
              : monaco.MarkerSeverity.Error;
          }
          out.push({ ...m, severity });
          continue;
        }


        if (m && typeof m.line === 'number') {
          const lineNumber = Math.max(1, m.line|0);

          let colFromValidator = (typeof m.column === 'number' && m.column > 0) ? m.column|0 : 1;

          let startColumn = colFromValidator;
          try {
            if (currentModel && typeof currentModel.getLineContent === 'function') {
              const full = currentModel.getLineContent(lineNumber) || '';
              const trimmedStart = full.replace(/^\s+/, '');
              const leading = full.length - trimmedStart.length;

              if (leading > 0) startColumn = leading + colFromValidator;

              if (startColumn < 1) startColumn = 1;
              if (startColumn > full.length + 1) startColumn = full.length + 1;
            }
          } catch (_) {}

          const length = (typeof m.length === 'number' && m.length > 0) ? m.length|0 : 1;
          const endLineNumber = lineNumber;
          const endColumn = startColumn + length;

          let severity = m.severity;
          if (typeof severity === 'string') {
            const sev = severity.toLowerCase();
            if (typeof monaco !== 'undefined' && monaco.MarkerSeverity) {
              severity = sev === 'warning' ? monaco.MarkerSeverity.Warning
                : sev === 'info' ? monaco.MarkerSeverity.Info
                : monaco.MarkerSeverity.Error;
            }
          }

          out.push({
            message: m.message || 'Validation issue',
            severity: (typeof severity === 'number') ? severity : (monaco && monaco.MarkerSeverity ? monaco.MarkerSeverity.Error : 'error'),
            startLineNumber: lineNumber,
            startColumn,
            endLineNumber,
            endColumn,
          });
          continue;
        }


        out.push({
          message: (m && m.message) || 'Validation issue',
          severity: (m && m.severity) || (monaco && monaco.MarkerSeverity ? monaco.MarkerSeverity.Error : 'error'),
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 2,
        });
      }
      return out;
    }
    function validateModel() {
      const currentModel = editor && typeof editor.getModel === 'function' ? editor.getModel() : model;
      if (!currentModel) return;
      const text = currentModel.getValue();
      const activeName = (project && project.activeFile) || "client.krnk";
      const activeFile = project && project.files && project.files[activeName];
      const fileType = (activeFile && activeFile.type) || "client";
      let rawMarkers = [];
      try {
        if (validator && typeof validator.validateKrunkScript === 'function') {
          rawMarkers = validator.validateKrunkScript(text, {
            fileType,
            fileName: activeName,
          }) || [];
        }
      } catch (_) {

        rawMarkers = [];
      }
      const markers = normalizeMarkers(rawMarkers, currentModel);
      monaco.editor.setModelMarkers(currentModel, "krunkscript", markers);

      try {
        const hasErrors = Array.isArray(markers) && markers.some(m => {
          const sev = m.severity;

          if (typeof sev === 'number') return sev === monaco.MarkerSeverity.Error;
          if (typeof sev === 'string') return sev.toLowerCase() === 'error';
          return true;
        });
        if (project && activeFile) {
          activeFile.hasErrors = !!hasErrors;
          if (hasErrors) {
            activeFile.valid = false; 
          }
          if (typeof window.updateCurrentFileIndicator === "function") {
            window.updateCurrentFileIndicator(project);
          }
          if (typeof window.renderInspector === "function") {
            window.renderInspector();
          }
          if (window.projectConfig && typeof window.projectConfig.saveProject === "function") {
            window.projectConfig.saveProject(project);
          }
        }
      } catch (_) {}
    }
    validateModel();
    editor.onDidChangeModelContent(validateModel);
    return { validateModel };
  }

  return { setupValidation };
});
