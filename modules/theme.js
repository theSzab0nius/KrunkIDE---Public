define([], function() {
  const baseRules = [
    { token: "comment", foreground: "6A9955" },
    { token: "comment.region", foreground: "808080" },
    { token: "keyword", foreground: "569CD6" },
    { token: "type", foreground: "4EC9B0" },
    { token: "function", foreground: "DCDCAA" },
    { token: "string", foreground: "CE9178" },
    { token: "number", foreground: "B5CEA8" },
    { token: "constant", foreground: "569CD6" },
    { token: "identifier", foreground: "9CDCFE" },
  ];

  const themes = {
    "krunk-dark-solid": {
      base: "vs-dark",
      inherit: true,
      rules: baseRules,
      colors: {
        "editor.background": "#1E1E1E",
        "editor.selectionBackground": "#264f78",
        "editor.lineHighlightBackground": "#2a2a2a",
        "editor.foreground": "#e0e0ff",
        "editorCursor.foreground": "#ffffff",
      },
    },
    "krunk-dark-glass": {
      base: "vs-dark",
      inherit: true,
      rules: baseRules,
      colors: {

        "editor.background": "#1E1E1E40",
        "editor.selectionBackground": "#264f78aa",
        "editor.lineHighlightBackground": "#2a2a2a66",
        "editor.foreground": "#e6e6ff",
        "editorCursor.foreground": "#ffffff",
      },
    },

    "krunk-space": {
      base: "vs-dark",
      inherit: true,
      rules: baseRules,
      colors: {
        "editor.background": "#1A1B2E40",
        "editor.selectionBackground": "#564d8aaa",
        "editor.lineHighlightBackground": "#2a2a6644",
        "editor.foreground": "#dcdcff",
        "editorCursor.foreground": "#a78bfa",
      },
    },

    "krunk-forest": {
      base: "vs-dark",
      inherit: true,
      rules: baseRules,
      colors: {
        "editor.background": "#16201640",
        "editor.selectionBackground": "#3a6b3aaa",
        "editor.lineHighlightBackground": "#243b2444",
        "editor.foreground": "#cfe8cf",
        "editorCursor.foreground": "#a5ffb3",
      },
    },

    "krunk-sunset": {
      base: "vs-dark",
      inherit: true,
      rules: baseRules,
      colors: {
        "editor.background": "#2b1a1040",
        "editor.selectionBackground": "#c76938aa",
        "editor.lineHighlightBackground": "#43211f44",
        "editor.foreground": "#ffd9c2",
        "editorCursor.foreground": "#ffe0aa",
      },
    },

    "krunk-underwater": {
      base: "vs-dark",
      inherit: true,
      rules: baseRules,
      colors: {
        "editor.background": "#0f1e2a40",
        "editor.selectionBackground": "#2f7fa8aa",
        "editor.lineHighlightBackground": "#123b5a44",
        "editor.foreground": "#cde9f4",
        "editorCursor.foreground": "#93e2ff",
      },
    },

    "krunk-birch": {
      base: "vs-dark",
      inherit: true,
      rules: baseRules,
      colors: {
        "editor.background": "#2a1b0c40",
        "editor.selectionBackground": "#d47f28aa",
        "editor.lineHighlightBackground": "#4a2a1444",
        "editor.foreground": "#ffd8b0",
        "editorCursor.foreground": "#ffc57a",
      },
    },

    "krunk-snow": {
      base: "vs-dark",
      inherit: true,
      rules: baseRules,
      colors: {
        "editor.background": "#22354540",          
        "editor.selectionBackground": "#dae4ecc2",  
        "editor.lineHighlightBackground": "#22344766",
        "editor.foreground": "#476379",            
        "editorCursor.foreground": "#3d5062",
      },
    },

    "krunk-pirate": {
      base: "vs-dark",
      inherit: true,
      rules: baseRules,
      colors: {
        "editor.background": "#1b1e2340",         
        "editor.selectionBackground": "#56606baa",  
        "editor.lineHighlightBackground": "#24282e44",
        "editor.foreground": "#d5d8dc",            
        "editorCursor.foreground": "#9bb2c6",      
      },
    },
  };


  const uiPalettes = {
    "krunk-dark-solid": {
      text: "#e0e0ff",
      solid: "#0f0f1a",
      border: "#3a3a5a",
      content: "#1a1a2e",
      input: "#18182e",
      hover: "#2a2a4a",
      accent: "#ffe066",
      glassBg: "#0f0f1a" 
    },
    "krunk-dark-glass": {
      text: "#e6e6ff",
      solid: "#0f0f1a",
      border: "#3a3a5a",
      content: "#1a1a2e",
      input: "#18182e",
      hover: "#2a2a4a",
      accent: "#ffe066",
      glassBg: "rgba(24, 24, 46, 0.30)" 
    },
    "krunk-space": {
      text: "#dcdcff",
      solid: "#121226",
      border: "#3a3a6a",
      content: "#1a1a2e",
      input: "#18182e",
      hover: "#2a2a4a",
      accent: "#a78bfa",
      glassBg: "rgba(26, 27, 46, 0.30)" 
    },
    "krunk-forest": {
      text: "#cfe8cf",
      solid: "#0f1a10",
      border: "#365a39",
      content: "#152116",
      input: "#122013",
      hover: "#244226",
      accent: "#a5ffb3",
      glassBg: "rgba(22, 32, 22, 0.30)" 
    },
    "krunk-sunset": {
      text: "#ffd9c2",
      solid: "#1f1410",
      border: "#6a3b2a",
      content: "#2b1a10",
      input: "#24150d",
      hover: "#3a2319",
      accent: "#ffb36b",
      glassBg: "rgba(43, 26, 16, 0.30)" 
    },
    "krunk-underwater": {
      text: "#cde9f4",
      solid: "#0d1820",
      border: "#2a5870",
      content: "#102432",
      input: "#0e2130",
      hover: "#1b3b52",
      accent: "#93e2ff",
      glassBg: "rgba(15, 30, 42, 0.30)" 
    },
    "krunk-birch": {
      text: "#ffd8b0",
      solid: "#1c130b",
      border: "#6a472a",
      content: "#2a1b0c",
      input: "#24170a",
      hover: "#3a2816",
      accent: "#ffc57a",
      glassBg: "rgba(42, 27, 12, 0.30)" 
    },
    "krunk-snow": {
      text: "#d7e4ee",
      solid: "#14202a",
      border: "#385066",
      content: "#1b2a36",
      input: "#182532",
      hover: "#24384a",
      accent: "#7faad6",
      glassBg: "rgba(34, 53, 69, 0.30)" 
    },
    "krunk-pirate": {
      text: "#d5d8dc",
      solid: "#0f1216",
      border: "#3a4450",
      content: "#14181e",
      input: "#12161c",
      hover: "#232a32",
      accent: "#9bb2c6",
      glassBg: "rgba(27, 30, 35, 0.30)" 
    },
  };

  function registerThemes() {
    Object.entries(themes).forEach(([name, config]) => {
      monaco.editor.defineTheme(name, config);
    });
  }

  function getAvailableThemes() {
    return Object.keys(themes);
  }

  function applyTheme(name) {
    const themeName = themes[name] ? name : "krunk-dark-solid";
    monaco.editor.setTheme(themeName);
    try {
      localStorage.setItem("krunk-theme", themeName);
    } catch (_) {}
  }

  function applyUIPalette(name) {
    const palette = uiPalettes[name] || uiPalettes["krunk-dark-solid"];
    const root = document.documentElement;
    root.style.setProperty("--ui-text", palette.text);
    root.style.setProperty("--ui-solid", palette.solid);
    root.style.setProperty("--ui-border", palette.border);
    root.style.setProperty("--ui-content-bg", palette.content);
    root.style.setProperty("--ui-input-bg", palette.input);
    root.style.setProperty("--ui-hover", palette.hover);
    root.style.setProperty("--ui-accent", palette.accent);
  
    if (palette.glassBg) {
      root.style.setProperty("--glass-bg", palette.glassBg);
    }
  }

  function getSavedTheme() {
    try {
      const t = localStorage.getItem("krunk-theme");
      if (t && themes[t]) return t;
    } catch (_) {}
    return null;
  }

  return {
    registerThemes,
    getAvailableThemes,
    applyTheme,
    getSavedTheme,
    applyUIPalette,
  };
});
