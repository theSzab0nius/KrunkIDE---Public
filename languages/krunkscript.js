define("languages/krunkscript", [], function () {
  function registerKrunkScript(monaco) {
    


    monaco.languages.registerHoverProvider("krunkscript", {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        const hovers = {
          GAME: { value: "**GAME**  \nBuilt-in global for game API access" },
          SCENE: {
            value: "**GAME.SCENE**  \nClient-only: Scene, lighting, objects",
          },
          log: {
            value: "**GAME.log(message)**  \nPrints to console for debugging",
          },

        };

        if (hovers[word.word]) {
          return {
            range: word.range,
            contents: [{ value: hovers[word.word].value }],
          };
        }
        return null;
      },
    });

    const KEYWORDS = [
      "break",
      "action",
      "public",
      "return",
      "if",
      "else",
      "for",
      "addTo",
      "remove",
      "lengthOf",
      "import", 
    ];

    const TYPES = ["bool", "num", "str", "obj"];

    monaco.languages.register({
      id: "krunkscript",
      extensions: [".krnk"],
      aliases: ["KrunkScript"],
    });

    monaco.languages.setMonarchTokensProvider("krunkscript", {
      keywords: KEYWORDS,
      types: TYPES,

      tokenizer: {
        root: [

          [/^\s*#region\b.*$/, "comment.region"],
          [/^\s*#endregion\b.*$/, "comment.region"],


          [/#.*$/, "comment"],


          [/\bimport\b\s+[a-zA-Z_][\w.]*\s*;/, "keyword.import"],


          [new RegExp(`\\b(${KEYWORDS.join("|")})\\b`), "keyword"],


          [new RegExp(`\\b(${TYPES.join("|")})\\b`), "type"],


          [/\b[_a-zA-Z][_a-zA-Z0-9]*(?=\s*\()/, "function"],


          [/\b(true|false)\b/, "constant"],


          [/[A-Z]+(?=\.)/, "constant"],


          [/\b(0[xX][0-9a-fA-F]+|\d+(\.\d+)?([eE][+-]?\d+)?)\b/, "number"],


          [/".*?"/, "string"],
          [/'.*?'/, "string"],


          [/[a-zA-Z_][\w.]*/, "identifier"],


          [/[{}()[\]]/, "@brackets"],


          [/[=+\-*\/%<>!]+/, "operator"],
        ],
      },
    });

    monaco.languages.setLanguageConfiguration("krunkscript", {
      comments: { lineComment: "#" },
      brackets: [
        ["{", "}"],
        ["(", ")"],
        ["[", "]"],
      ],
      autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "(", close: ")" },
        { open: "[", close: "]" },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      folding: {
        markers: {
          start: /^\s*#region\b/,
          end: /^\s*#endregion\b/,
        },
      },
    });
  }

  return { registerKrunkScript };
});
