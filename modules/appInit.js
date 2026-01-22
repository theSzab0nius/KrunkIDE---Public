define([], function () {
  function initAutocomplete(autocompleteModule) {
    autocompleteModule.registerAutocomplete();
    console.log("Autocomplete registered.");
  }

  function initTheme(themeModule) {
    themeModule.registerThemes();
    const saved = themeModule.getSavedTheme();
    const name = saved || "krunk-dark-solid";
    themeModule.applyTheme(name);
    themeModule.applyUIPalette(name);
    console.log("Themes registered.");
  }

  function initLanguage(krunkLang) {
    krunkLang.registerKrunkScript(monaco);
    console.log("KrunkScript language registered.");
  }

  function initEditorAndModels(editorLoader, project) {
    const models = editorLoader.initializeModels(project);
    const editor = editorLoader.createEditor("editor-container", models, project);
    window.editor = editor;
    editorLoader.setupModelListeners(project, models);
    return { editor, models };
  }

  function initConsoleUI(consoleModule, consoleUIModule) {
    consoleModule.setupConsole();
    consoleUIModule.initConsoleUI();
  }

  function initBreadcrumbs(breadcrumbsModule, editor, project) {
    const bannerContainer = document.getElementById("banner-container");
    breadcrumbsModule.setupBreadcrumbs({ editor, project, bannerContainer });
  }

  return {
    initAutocomplete,
    initTheme,
    initLanguage,
    initEditorAndModels,
    initConsoleUI,
    initBreadcrumbs,
  };
});
