define([], function () {


  function tokensFromInput(input) {

    const braceTokens = [];
    const re = /\{([^}]+)\}/g;
    let m;
    while ((m = re.exec(input))) braceTokens.push(String(m[1]).trim().toLowerCase());
    if (braceTokens.length) return braceTokens;
    return String(input).trim().split(/\s+/).filter(Boolean).map(t => t.toLowerCase());
  }

  function forceMissingModuleError() {

    if (typeof require === 'function') {
      try {
        const id = `__krunk_missing_test__/mod_${Date.now()}`;
        require([id]);
        return { handled: true, output: 'Triggered missing-module load via AMD' };
      } catch (e) {
        console.error('Force error threw synchronously:', e);
        return { handled: true, output: 'Synchronous error while forcing missing module', error: true };
      }
    }
    try {
      const s = document.createElement('script');
      s.src = `missing-${Date.now()}.js`;
      document.head.appendChild(s);
      return { handled: true, output: 'Injected missing script tag' };
    } catch (e) {
      console.error('Script injection failed:', e);
      return { handled: true, output: 'Script injection failed', error: true };
    }
  }

  function forceDuplicateDefine() {

    const src = "define([], function(){return {x:1};});\ndefine([], function(){return {y:2};});";
    const blob = new Blob([src], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const s = document.createElement('script');
    s.src = url;
    document.head.appendChild(s);
    return { handled: true, output: 'Injected duplicate anonymous define script' };
  }

  function forceRefreshDB() {
    try {
      const s = window.storage;
      if (s && typeof s.clearAll === 'function') {
        Promise.resolve(s.clearAll())
          .then(() => {
            console.warn('Storage cleared. Reloading IDE...');
            setTimeout(() => { try { location.reload(); } catch (_) {} }, 50);
          })
          .catch((err) => {
            console.error('Failed to clear storage:', err);
          });
        return { handled: true, output: 'Clearing DB and refreshing...' };
      }

      if (typeof indexedDB !== 'undefined' && indexedDB.deleteDatabase) {
        try {
          const req = indexedDB.deleteDatabase('KrunkIDE');
          req.onsuccess = () => {
            console.warn('IndexedDB deleted. Reloading IDE...');
            setTimeout(() => { try { location.reload(); } catch (_) {} }, 50);
          };
          req.onerror = () => {
            console.error('IndexedDB deletion failed:', req.error);
          };
          return { handled: true, output: 'Attempting DB delete and refresh...' };
        } catch (e) {
          console.error('DeleteDatabase threw:', e);
        }
      }
      return { handled: true, output: 'No storage API available', error: true };
    } catch (e) {
      console.error('forceRefresh failed:', e);
      return { handled: true, output: 'forceRefresh failed', error: true };
    }
  }

  function handleCommand(input, context) {

    const openMatch = input.match(/^open\s+([^\"]+)$/i);
    if (openMatch) {
      const fileName = openMatch[1];
      if (
        context.openFile &&
        context.project &&
        context.project.files &&
        context.project.files[fileName]
      ) {
        context.openFile(fileName, false);
        return { handled: true, output: 'Opened ' + fileName };
      } else {
        return { handled: true, output: 'File not found: ' + fileName, error: true };
      }
    }

    const toks = tokensFromInput(input);
    if (toks.length >= 3 && toks[0] === 'dev' && toks[1] === 'forceerror') {
      if (toks[2] === 'missingmodule') {
        return forceMissingModuleError();
      }
      if (toks[2] === 'duplicatedefine') {
        return forceDuplicateDefine();
      }
    }


    if (toks.length >= 2 && toks[0] === 'dev' && toks[1] === 'forcerefresh') {
      return forceRefreshDB();
    }

    if (toks.length >= 4 && toks[0] === 'file' && toks[1] === 'set' && toks[2] === 'valid') {
      const valTok = toks[3];
      const asBool = (valTok === 'true' || valTok === '1' || valTok === 'yes');
      const project = context && context.project;
      if (!project || !project.activeFile || !project.files[project.activeFile]) {
        return { handled: true, output: 'No active file', error: true };
      }
      project.files[project.activeFile].valid = asBool;
      if (typeof window.updateCurrentFileIndicator === 'function') window.updateCurrentFileIndicator(project);
      if (typeof window.renderInspector === 'function') window.renderInspector();
      if (window.projectConfig && typeof window.projectConfig.saveProject === 'function') window.projectConfig.saveProject(project);
      return { handled: true, output: `Set valid=${asBool} for ${project.activeFile}` };
    }

    if (toks.length >= 4 && toks[0] === 'file' && toks[1] === 'set' && toks[2] === 'type') {
      const typeTok = toks[3];
      const map = {
        'client': 'client',
        'server': 'server',
        'clientlibrary': 'clientLibrary',
        'serverlibrary': 'serverLibrary',
        'sharedlibrary': 'sharedLibrary',
      };
      const nextType = map[typeTok];
      if (!nextType) {
        return { handled: true, output: 'Unknown type. Use sharedLibrary, clientLibrary, serverLibrary, client, server', error: true };
      }
      const project = context && context.project;
      if (!project || !project.activeFile || !project.files[project.activeFile]) {
        return { handled: true, output: 'No active file', error: true };
      }
      project.files[project.activeFile].type = nextType;
      if (typeof window.updateCurrentFileIndicator === 'function') window.updateCurrentFileIndicator(project);
      if (typeof window.renderInspector === 'function') window.renderInspector();
      if (window.projectConfig && typeof window.projectConfig.saveProject === 'function') window.projectConfig.saveProject(project);
      return { handled: true, output: `Set type=${nextType} for ${project.activeFile}` };
    }

    return { handled: false };
  }

  return { handleCommand };
});
