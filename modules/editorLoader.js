define([], function() {
  return {
    initializeModels: function(project) {
      const models = {};

      Object.entries(project.files).forEach(([fileName, file]) => {
        models[fileName] = monaco.editor.createModel(file.content, "krunkscript");
      });

      return models;
    },

    setupModelListeners: function(project, models) {
      Object.entries(models).forEach(([fileName, model]) => {
        model.onDidChangeContent(() => {
          project.files[fileName].content = model.getValue();

          if (project.files[fileName]) {
            project.files[fileName].valid = false;
            if (project.activeFile === fileName && typeof window.updateCurrentFileIndicator === 'function') {
              window.updateCurrentFileIndicator(project);
            }
            if (typeof window.renderInspector === 'function') {
              window.renderInspector();
            }
            if (window.projectConfig && typeof window.projectConfig.saveProject === 'function') {
              window.projectConfig.saveProject(project);
            }
          }
        });
      });
    },

    createEditor: function(containerId, models, project) {
      const editor = monaco.editor.create(
        document.getElementById(containerId),
        {
          model: models[project.activeFile],
          automaticLayout: true,
          fontSize: 15,
          minimap: { enabled: false },
        }
      );

      return editor;
    }
  };
});
