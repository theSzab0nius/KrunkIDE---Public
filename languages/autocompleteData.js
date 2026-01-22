define("languages/autocompleteData", [], function () {
  const cache = { globals: null };
  const GLOBALS_URL = './data/autocomplete/globals.json';

  async function loadGlobals() {
    if (cache.globals) return cache.globals;
    try {
      const res = await fetch(GLOBALS_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      cache.globals = Array.isArray(data) ? data : ["GAME"];
      return cache.globals;
    } catch (err) {
      console.warn('[autocomplete] Failed to load globals from', GLOBALS_URL, err && err.message);
      cache.globals = ["GAME","UTILS"];
      return cache.globals;
    }
  }

  async function loadMembersFor(objName) {
    const key = String(objName || '').toLowerCase();
    const url = `./data/autocomplete/${key}Members.json`;

    cache[key] = cache[key] || null;
    if (cache[key]) return cache[key];
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      cache[key] = Array.isArray(data) ? data : [];
      return cache[key];
    } catch (err) {

      if (key === 'game') {
        cache[key] = [
          { label: 'log', kind: 'Method', detail: 'log(message: str)', insertText: 'log(${1:message})', snippet: true },
          { label: 'SCENE', kind: 'Class', detail: 'Scene / objects' }
        ];
      } else if (key === 'scene') {
        cache[key] = [
          { label: 'setSkyColor', kind: 'Method', detail: 'setSkyColor(color: str)', insertText: 'setSkyColor(${1:color})', snippet: true },
          { label: 'clear', kind: 'Method', detail: 'clear()', insertText: 'clear()' }
        ];
      } else {
        cache[key] = [];
      }
      console.warn('[autocomplete] Using fallback members for', objName, 'due to load failure from', url);
      return cache[key];
    }
  }

  return { loadGlobals, loadMembersFor };
});