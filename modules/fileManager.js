define([], function () {
  return {
    createNewFile: function (project, models, openFile) {
      let fileName = "newFile.krnk";
      let counter = 1;
      while (project.files[fileName]) {
        fileName = `newFile${counter}.krnk`;
        counter++;
      }

      project.files[fileName] = {
        type: "clientLibrary",
        content: "",
        open: true,
        pinned: false,
        valid: false,
      };

      models[fileName] = monaco.editor.createModel("", "krunkscript");
      models[fileName].onDidChangeContent(() => {
        project.files[fileName].content = models[fileName].getValue();
      });

      if (typeof console !== 'undefined' && console.log) {
        console.log(`Created new file: ${fileName}`);
      }
      if (window.projectConfig && typeof window.projectConfig.saveProject === 'function') {
        window.projectConfig.saveProject(project);
      }
      openFile(fileName);
    },

    createFileWithContent: function (
      fileName,
      content,
      project,
      models,
      openFile
    ) {

      let baseName = fileName && fileName.trim() ? fileName.trim() : "import.krnk";
      let finalName = baseName;
      let counter = 1;
      while (project.files[finalName]) {
        const parts = baseName.split(".");
        if (parts.length > 1) {
          const ext = parts.pop();
          finalName = `${parts.join(".")}_${counter}.${ext}`;
        } else {
          finalName = `${baseName}_${counter}`;
        }
        counter++;
      }

      project.files[finalName] = {
        type: "clientLibrary",
        content: content || "",
        open: true,
        pinned: false,
        valid: false,
      };

      models[finalName] = monaco.editor.createModel(project.files[finalName].content, "krunkscript");
      models[finalName].onDidChangeContent(() => {
        project.files[finalName].content = models[finalName].getValue();
      });

      if (typeof console !== 'undefined' && console.log) {
        console.log(`Imported new file: ${finalName}`);
      }
      openFile(finalName);
      return finalName;
    },

    renameFile: function (
      oldFileName,
      project,
      models,
      openFile,
      renderInspector
    ) {
      const newFileName = prompt("Enter new file name:", oldFileName);
      if (!newFileName || newFileName === oldFileName) return;


      let finalFileName = newFileName;
      if (!finalFileName.endsWith(".krnk")) {
        finalFileName += ".krnk";
      }

      if (project.files[finalFileName]) {
        alert("File already exists");
        return;
      }


      project.files[finalFileName] = project.files[oldFileName];
      delete project.files[oldFileName];


      models[finalFileName] = models[oldFileName];
      delete models[oldFileName];


      if (project.activeFile === oldFileName) {
        project.activeFile = finalFileName;
      }

      if (typeof console !== 'undefined' && console.log) {
        console.log(`Renamed file: ${oldFileName} → ${finalFileName}`);
      }
      if (window.projectConfig && typeof window.projectConfig.saveProject === 'function') {
        window.projectConfig.saveProject(project);
      }

      renderInspector();
      openFile(finalFileName);
    },

    deleteFileByName: function (
      fileName,
      project,
      models,
      openFile,
      renderInspector
    ) {
      const fileType = project.files[fileName].type;

      const isLibrary =
        fileType === "clientLibrary" ||
        fileType === "serverLibrary" ||
        fileType === "sharedLibrary";
      if (!isLibrary) return;

      delete project.files[fileName];
      delete models[fileName];

      if (typeof console !== 'undefined' && console.log) {
        console.warn(`Deleted file: ${fileName}`);
      }


      if (project.activeFile === fileName) {
        const remainingFiles = Object.keys(project.files);
        if (remainingFiles.length > 0) {
          openFile(remainingFiles[0]);
        }
      }

      renderInspector();
      if (window.projectConfig && typeof window.projectConfig.saveProject === 'function') {
        window.projectConfig.saveProject(project);
      }
    },

    changeFileType: function (fileName, newType, project, renderInspector) {
      const file = project.files[fileName];
      if (!file) return;

      const libraryTypes = ["clientLibrary", "serverLibrary", "sharedLibrary"];

      if (!libraryTypes.includes(file.type)) return;
      console.warn("Changed file type of", fileName, "to", newType);
      file.type = newType;
      renderInspector();
      if (window.projectConfig && typeof window.projectConfig.saveProject === 'function') {
        window.projectConfig.saveProject(project);
      }
    },

    deleteCurrentFile: function (
      project,
      models,
      openFile,
      renderInspector,
      activeFile
    ) {
      this.deleteFileByName(
        activeFile,
        project,
        models,
        openFile,
        renderInspector
      );
    },
  };
});
