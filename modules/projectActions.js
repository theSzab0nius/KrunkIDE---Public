define(["./storage.js", "./projectConfig.js", "./theme.js", "templates/client", "templates/server"], function (storage, projectConfig, themeModule, clientTemplate, serverTemplate) {
  function clearUIConsole() {
    const consoleContent = document.getElementById('console-content');
    if (consoleContent) consoleContent.innerHTML = '';
    const consoleInput = document.getElementById('console-input');
    if (consoleInput) consoleInput.value = '';
  }

  function getContent(entry) {
    if (entry == null) return null;
    if (typeof entry === 'string') return entry;
    if (typeof entry === 'object' && typeof entry.content === 'string') return entry.content;
    return null;
  }

  function validateImportedProject(imported) {
    const errors = [];
    if (!imported || typeof imported !== 'object') {
      errors.push('Root must be an object');
    }
    const files = imported && imported.files;
    if (!files || typeof files !== 'object') {
      errors.push('Missing or invalid "files" map');
    }
    if (!errors.length) {

      const client = files['client.krnk'];
      const server = files['server.krnk'];
      const clientContent = getContent(client);
      const serverContent = getContent(server);
      if (clientContent == null) errors.push('Missing or invalid content for client.krnk');
      if (serverContent == null) errors.push('Missing or invalid content for server.krnk');

      Object.entries(files).forEach(([name, info]) => {
        if (name === 'client.krnk' || name === 'server.krnk') return;
        const content = getContent(info);
        if (content == null) errors.push(`Invalid content for file: ${name}`);
      });
    }
    return { ok: errors.length === 0, errors };
  }
  async function newProject() {
    clearUIConsole();
    const prj = window.project;
    const openFile = window.openFile;
    const editor = window.editor;

    if (prj && typeof openFile === 'function' && editor && typeof editor.getModel === 'function') {
      try {

        Object.keys(prj.files).forEach((name) => {
          const t = prj.files[name]?.type;
          if (t === 'clientLibrary' || t === 'serverLibrary' || t === 'sharedLibrary') {
            delete prj.files[name];
          }
        });

        if (prj.files['client.krnk']) prj.files['client.krnk'].content = clientTemplate;
        if (prj.files['server.krnk']) prj.files['server.krnk'].content = serverTemplate;

        openFile('client.krnk', true);
        editor.getModel() && editor.getModel().setValue(clientTemplate);
        openFile('server.krnk', false);
        editor.getModel() && editor.getModel().setValue(serverTemplate);
        openFile('client.krnk', true);

        prj.openTabs = ['client.krnk', 'server.krnk'];
        prj.activeFile = 'client.krnk';

        await projectConfig.saveProject(prj);
        clearUIConsole();
        if (typeof window.renderInspector === 'function') {
          window.renderInspector();
        }
        if (typeof window.updateCurrentFileIndicator === 'function') {
          window.updateCurrentFileIndicator(prj);
        }
        return;
      } catch (err) {
        console.warn('Soft reset failed, falling back to reload', err);
      }
    }

    try {
      const fresh = projectConfig.createProject(clientTemplate, serverTemplate);
      await projectConfig.saveProject(fresh);
    } catch (_) {}
    clearUIConsole();
    location.reload();
  }

  async function exportProject(project) {
    const prj = project || window.project;
    if (!prj) return;
    const hasZip = !!window.JSZip;
    if (!hasZip) {
      const blob = new Blob([JSON.stringify(prj, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(prj.name && prj.name.trim()) ? prj.name.trim() : 'Krunk Project'}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 100);
      return;
    }
    const zip = new window.JSZip();
    const filesFolder = zip.folder('files');
    Object.entries(prj.files || {}).forEach(([name, info]) => {
      const content = (info && info.content) || '';
      filesFolder.file(name, content);
      const txtName = name.replace(/\.[^.]+$/, '') + '.txt';
      filesFolder.file(txtName, content);
    });
    zip.file('project.json', JSON.stringify(prj, null, 2));
    const settings = {
      theme: (typeof themeModule.getSavedTheme === 'function') ? themeModule.getSavedTheme() : null,
      background: (function(){
        try { return localStorage.getItem('krunk-bg') || null; } catch(_) { return null; }
      })()
    };
    zip.file('settings.json', JSON.stringify(settings, null, 2));
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `${(prj.name && prj.name.trim()) ? prj.name.trim() : 'Krunk Project'}.zip`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 100);
  }

  async function importProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,.json,application/zip,application/x-zip-compressed,application/json';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.onchange = async () => {
      const file = input.files && input.files[0];
      document.body.removeChild(input);
      if (!file) return;
      try {
        let imported = null;
        if (file.name.toLowerCase().endsWith('.json')) {
          const text = await file.text();
          imported = JSON.parse(text);
        } else if (window.JSZip) {
          const zip = await window.JSZip.loadAsync(file);
          if (zip.file('project.json')) {
            const text = await zip.file('project.json').async('string');
            imported = JSON.parse(text);
          } else {
            imported = { files: {}, openTabs: [], activeFile: null };
            const entries = Object.keys(zip.files);
            for (const path of entries) {
              if (path.startsWith('files/') && !path.endsWith('/')) {
                const content = await zip.file(path).async('string');
                const name = path.replace(/^files\//, '');
                if (name.endsWith('.txt')) {
                  const base = name.replace(/\.txt$/, '');
                  if (zip.file('files/' + base)) continue;
                }
                imported.files[name] = { type: 'imported', content, open: false, valid: false, hasErrors: false };
                if (!imported.activeFile) imported.activeFile = name;
                imported.openTabs.push(name);
              }
            }
            if (!imported.activeFile) {
              imported.activeFile = Object.keys(imported.files)[0] || 'client.krnk';
            }
          }
          if (zip.file('settings.json')) {
            try {
              const s = JSON.parse(await zip.file('settings.json').async('string'));
              if (s && s.theme) {
                themeModule.applyTheme(s.theme);
                themeModule.applyUIPalette(s.theme);
                try { localStorage.setItem('krunk-theme', s.theme); } catch(_) {}
              }
              if (s && s.background) {
                try { localStorage.setItem('krunk-bg', s.background); } catch(_) {}
                document.documentElement.style.setProperty('--app-bg-url', `url(${s.background})`);
              }
            } catch (_) {}
          }
        } else {
          throw new Error('JSZip not available to read ZIP; please import a .json');
        }
        const validation = validateImportedProject(imported);
        if (!validation.ok) {
          console.error('Import denied: invalid project JSON', validation.errors);
          return;
        }
        if (imported && imported.files) {

          const prj = window.project || (imported); 
          if (prj && prj.files) {

            Object.keys(prj.files).forEach((name) => {
              const t = prj.files[name]?.type;
              if (t === 'clientLibrary' || t === 'serverLibrary' || t === 'sharedLibrary') {
                delete prj.files[name];
              }
            });

            const clientEntry = imported.files['client.krnk'];
            const serverEntry = imported.files['server.krnk'];
            prj.files['client.krnk'].content = getContent(clientEntry) || '';
            prj.files['server.krnk'].content = getContent(serverEntry) || '';

            Object.entries(imported.files).forEach(([name, info]) => {
              if (name === 'client.krnk' || name === 'server.krnk') return;
              const content = getContent(info) || '';
              prj.files[name] = { type: 'sharedLibrary', content, open: false, pinned: false, valid: false, hasErrors: false };
            });

            prj.openTabs = ['client.krnk', 'server.krnk'];
            prj.activeFile = 'client.krnk';

            if (imported.name && typeof imported.name === 'string') {
              prj.name = imported.name.trim() || prj.name;
              const nameEl = document.getElementById('project-name-display');
              if (nameEl) nameEl.textContent = prj.name;
            }

            await projectConfig.saveProject(prj);

            const openFile = window.openFile;
            const editor = window.editor;
            if (typeof openFile === 'function' && editor && typeof editor.getModel === 'function') {
              openFile('client.krnk', true);
              editor.getModel() && editor.getModel().setValue(prj.files['client.krnk'].content || '');
              openFile('server.krnk', false);
              editor.getModel() && editor.getModel().setValue(prj.files['server.krnk'].content || '');
              openFile('client.krnk', true);
            }
            clearUIConsole();
            if (typeof window.renderInspector === 'function') window.renderInspector();
            if (typeof window.updateCurrentFileIndicator === 'function') window.updateCurrentFileIndicator(prj);
          } else {

            await projectConfig.saveProject(imported);
            clearUIConsole();
            location.reload();
          }
        } else {
          throw new Error('Invalid project format');
        }
      } catch (err) {
        console.error('Import failed', err);
      }
    };
    input.click();
  }

  return { newProject, exportProject, importProject };
});