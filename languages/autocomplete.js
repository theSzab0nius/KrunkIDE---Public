define("languages/autocomplete", ["languages/autocompleteData"], function (data) {
  const keywords = ["public","action","return","if","else","for","while","break","continue","import"];
  const types = ["num","str","bool","obj","void"];
  const hooks = ["start()","update(num)","render(num)","onPlayerSpawn(str)","onPlayerUpdate(str,num,obj)"];



  function getLibraryFiles() {
    if (window.project && window.project.files) {
      return Object.entries(window.project.files)
        .filter(([_, file]) => ["clientLibrary", "serverLibrary", "sharedLibrary"].includes(file.type))
        .map(([name]) => name.replace(/\.[^.]+$/, ""));
    }
    return [];
  }

  monaco.languages.registerCompletionItemProvider("krunkscript", {
    triggerCharacters: [".", "(", " ", "\n"].concat("abcdefghijklmnopqrstuvwxyz".split("")).concat("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")),
    async provideCompletionItems(model, position) {
      const globals = await data.loadGlobals();
      const suggestions = [];

      const lineUntil = model.getLineContent(position.lineNumber).substring(0, Math.max(0, position.column - 1));


      const importMatch = lineUntil.match(/\bimport\s+([\w]*)$/);
      if (importMatch) {
        getLibraryFiles().forEach((lib) => {
          suggestions.push({
            label: lib,
            kind: monaco.languages.CompletionItemKind.Module,
            insertText: lib + ";",
            detail: "Library file",
          });
        });
        return { suggestions };
      }


      const dotMatch = lineUntil.match(/([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\.(\w*)$/);
      if (dotMatch) {
        const fullChain = dotMatch[1];
        const prefix = dotMatch[2] || ""; 

 
        const QUALIFIED_MAP = {
          "UTILS": "utils",
          "UTILS.math": "math",
          "GAME": "game",
        };

  
        const gameMembers = await data.loadMembersFor("game");
        (gameMembers || []).forEach(m => {
          if (m && m.kind === "Class" && m.label) {
            const cls = String(m.label);
            const lower = cls.toLowerCase();

            QUALIFIED_MAP["GAME." + cls] = lower;
            QUALIFIED_MAP["GAME." + lower] = lower;

          }
        });

        const dataKey = QUALIFIED_MAP[fullChain];
        if (dataKey) {
          const membersRaw = await data.loadMembersFor(dataKey);
          const members = (membersRaw || []).map(m => ({
            label: m.label,
            kind: monaco.languages.CompletionItemKind[m.kind] || monaco.languages.CompletionItemKind.Property,
            insertText: m.insertText || m.label,
            insertTextRules: m.snippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
            detail: m.detail || ''
          }));
          members

            .filter(m => prefix === "" || m.label.startsWith(prefix))
            .forEach(m => {
              suggestions.push({
                label: m.label,
                kind: m.kind,
                insertText: m.insertText,
                insertTextRules: m.snippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
                detail: m.detail,
                sortText: "0" + m.label,
              });
            });
          if (suggestions.length) return { suggestions };
        }
      }


      (globals || []).forEach((g) => {
        suggestions.push({
          label: g,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: g,
        });
      });


      keywords.forEach((kw) => {
        suggestions.push({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
        });
      });


      types.forEach((t) => {
        suggestions.push({
          label: t,
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: t,
        });
      });


      hooks.forEach((hook) => {
        suggestions.push({
          label: hook,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `public action ${hook} {\n\t$0\n}`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "Common game hook",
        });
      });

      return { suggestions };
    },
  });

  return { registerAutocomplete: function(){} };
});
