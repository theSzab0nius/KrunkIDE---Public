require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs",
  },
});

function startApp() {
  require([
    "languages/krunkscript",
    "templates/client",
    "templates/server",
    "./modules/fileManager.js",
    "./modules/editorLoader.js",
    "languages/autocomplete",
    "./modules/theme.js",
    "./modules/breadcrumbs.js",
    "./modules/console.js",
    "./modules/consoleUI.js",
    "./modules/inspectorUI.js",
    "./modules/builder.js",
    "./modules/appInit.js",
    "./modules/actions.js",
    "./modules/currentFileIndicator.js",
    "./modules/inspectorActions.js",
    "./modules/resize.js",
    "./modules/projectConfig.js",
    "./modules/editorValidation.js",
    "./modules/themeSwitch.js",
    "./modules/projectActions.js",
    "./modules/storage.js",
  ], async function (
    krunkLang,
    clientTemplate,
    serverTemplate,
    fileManager,
    editorLoader,
    autocompleteModule,
    themeModule,
    breadcrumbsModule,
    consoleModule,
    consoleUIModule,
    inspectorUIModule,
    builderModule,
    appInit,
    actions,
    currentFileIndicator,
    inspectorActions,
    resizeModule,
    projectConfig,
    editorValidation,
    themeSwitch,
    projectActions,
    storage
  ) {
  const project = await projectConfig.loadProject(
    clientTemplate,
    serverTemplate,
  );

  function initAutocomplete() {
    autocompleteModule.registerAutocomplete();
    console.log("Autocomplete registered.");
  }

  function initTheme() {
    themeModule.registerTheme();
    console.log("Theme registered.");
  }

  function initLanguage() {
    krunkLang.registerKrunkScript(monaco);
    console.log("KrunkScript language registered.");
  }

  function initEditorAndModels(project) {
    const models = editorLoader.initializeModels(project);
    const editor = editorLoader.createEditor(
      "editor-container",
      models,
      project,
    );
    window.editor = editor;
    editorLoader.setupModelListeners(project, models);
    return { editor, models };
  }

  function initConsoleUI() {
    consoleModule.setupConsole();
    consoleUIModule.initConsoleUI();
  }

  function initBreadcrumbs(editor, project) {
    const bannerContainer = document.getElementById("banner-container");
    breadcrumbsModule.setupBreadcrumbs({ editor, project, bannerContainer });
  }

  appInit.initAutocomplete(autocompleteModule);

  appInit.initTheme(themeModule);

  appInit.initLanguage(krunkLang);

  const { editor, models } = appInit.initEditorAndModels(editorLoader, project);
  const model = editor.getModel();

  appInit.initConsoleUI(consoleModule, consoleUIModule);

  appInit.initBreadcrumbs(breadcrumbsModule, editor, project);

  themeSwitch.initThemeSwitch(themeModule, projectActions);

  resizeModule.initResize();

  const { validateModel } = editorValidation.setupValidation(
    editor,
    model,
    null,
    project,
  );

  window.openFile = function (fileName, focusEditor = true) {
    if (!models[fileName]) return;

    project.activeFile = fileName;
    editor.setModel(models[fileName]);
    if (focusEditor) editor.focus();
    validateModel();
    renderInspector();
  };

  const inspectorPanel = document.getElementById("inspector-panel");
  const inspectorFiles = document.getElementById("inspector-files");
  const btnNewFile = document.getElementById("btn-new-file");
  const btnDeleteFile = document.getElementById("btn-delete-file");
  const btnSaveFile = document.getElementById("btn-save-file");

  inspectorActions.setupInspector(
    project,
    models,
    fileManager,
    inspectorUIModule,
    window.openFile,
  );

  actions.setupSaveButton(project);

  actions.setupBuildButton(project, builderModule);
  actions.setupBuildAndPlayButton(project, builderModule);

  actions.setupValidateButton(project);

  currentFileIndicator.enhanceOpenFile(project);

  window.updateCurrentFileIndicator = function (prj = project) {
    currentFileIndicator.updateCurrentFileIndicator(prj);
  };

  const nameEl = document.getElementById("project-name-display");
  if (nameEl) {
    nameEl.textContent = project.name || "Untitled Project";
    nameEl.title = "Click to edit name";

    let originalName = nameEl.textContent;

    const startEdit = () => {
      if (nameEl.getAttribute("data-editing") === "true") return;
      nameEl.setAttribute("data-editing", "true");
      nameEl.setAttribute("contenteditable", "true");
      nameEl.focus();
      try {
        const range = document.createRange();
        range.selectNodeContents(nameEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (_) {}
      originalName = project.name || "Untitled Project";
    };

    const commitEdit = async () => {
      if (nameEl.getAttribute("data-editing") !== "true") return;
      const next = (nameEl.textContent || "").trim();
      const finalName = next || originalName || "Untitled Project";
      project.name = finalName;
      nameEl.textContent = finalName;
      nameEl.removeAttribute("contenteditable");
      nameEl.removeAttribute("data-editing");
      try {
        await projectConfig.saveProject(project);
      } catch (_) {}
    };

    const cancelEdit = () => {
      if (nameEl.getAttribute("data-editing") !== "true") return;
      nameEl.textContent = originalName || "Untitled Project";
      nameEl.removeAttribute("contenteditable");
      nameEl.removeAttribute("data-editing");
    };

    nameEl.addEventListener("click", startEdit);

    nameEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitEdit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      }
    });

    nameEl.addEventListener("blur", commitEdit);
  }

  window.project = project;
  window.fileManager = fileManager;
  window.projectConfig = projectConfig;
  window.storage = storage;
  renderInspector();
  window.frost = window.frost || {
    linked: false,
    krunkerWin: null,
  };

    actions.setupBeforeUnload();
  });
}

if (window.monaco && window.monaco.editor) {
  startApp();
} else if (typeof require !== "undefined") {
  require(["vs/editor/editor.main"], startApp);
}
