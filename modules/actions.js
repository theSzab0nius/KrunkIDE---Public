define([], function () {
  function setupSaveButton(project) {
    const btnSaveFile = document.getElementById('btn-save-file');
    if (!btnSaveFile) return;
    btnSaveFile.onclick = function () {
      const fileName = project.activeFile || 'untitled.txt';
      const file = project.files[fileName];
      if (!file) return;
      const content = file.content || '';
      const blob = new Blob([content], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName.replace(/\.[^.]+$/, '') + '.txt';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }, 100);
      if (typeof console !== 'undefined' && console.log) {
        console.log(`Saved file: ${fileName}`);
      }
    };
  }

  function setupBuildButton(project, builderModule) {
    const btnBuildProject = document.getElementById('btn-build-project');
    if (!btnBuildProject) return;
    function updateConsoleMessagesCount() {
      const consoleContent = document.getElementById('console-content');
      const countSpan = document.getElementById('console-messages-count');
      if (consoleContent && countSpan) {
        const count = consoleContent.querySelectorAll('.console-line').length;
        countSpan.textContent = `(messages: ${count})`;
      }
    }
    btnBuildProject.onclick = function () {
      if (builderModule && builderModule.buildProject) {
        builderModule.buildProject(project);
      }
    };
  }

  function setupBuildAndPlayButton(project, builderModule) {
    const btnBuildPlay = document.getElementById('btn-build-play');
    if (!btnBuildPlay) return;
    btnBuildPlay.onclick = function () {
      if (builderModule && typeof builderModule.buildProject === 'function') {
        const ok = builderModule.buildProject(project);
        if (ok) {
          try {
            if (!window.frost?.krunkerWin || !window.frost?.linked) {
              console.warn("[FROST] Not linked to Krunker editor; cannot PLAY");
              return;
            }
            const krunkerWin = window.frost.krunkerWin;
            krunkerWin.postMessage(
              { type: "BUILD_PLAY" },
              "https://krunker.io",
            );
          } catch (err) {
            console.error("[FROST] Failed to send BUILD_PLAY", err);
          }
        }
      }
    };
  }

  function setupValidateButton(project) {
    const btnValidate = document.getElementById('btn-validate');
    if (!btnValidate) return;
    btnValidate.onclick = function () {
      const fileName = project.activeFile;
      if (!fileName || !project.files[fileName]) return;
      project.files[fileName].valid = true;
      if (typeof window.updateCurrentFileIndicator === 'function') {
        window.updateCurrentFileIndicator(project);
      }
      if (typeof window.renderInspector === 'function') {
        window.renderInspector();
      }
      if (window.projectConfig && typeof window.projectConfig.saveProject === 'function') {
        window.projectConfig.saveProject(project);
      }
      if (typeof console !== 'undefined' && console.info) {
        console.info(`validated: ${fileName}`);
      }
    };
  }

  function setupBeforeUnload() {
    window.addEventListener("beforeunload", function (e) {
      e.preventDefault();
      e.returnValue = "";
      return "";
    });
  }

  return { setupSaveButton, setupBuildButton, setupBuildAndPlayButton, setupValidateButton, setupBeforeUnload };
});
