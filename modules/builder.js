define(["./linkingAction.js"], function (linkingAction) {
  const RESERVED = new Set([
    "if",
    "while",
    "for",
    "switch",
    "return",
    "break",
    "continue",
  ]);
  function replaceOutsideStrings(code, replacer) {
    let out = "";
    let i = 0;
    let inStr = false;
    let buf = "";

    while (i < code.length) {
      const ch = code[i];

      if (ch === "'") {
        if (!inStr) {

          out += replacer(buf);
          buf = "'";
          inStr = true;
        } else {
 
          buf += "'";
          out += buf;
          buf = "";
          inStr = false;
        }
        i++;
        continue;
      }

      buf += ch;
      i++;
    }

    if (!inStr) out += replacer(buf);
    else out += buf;

    return out;
  }
  function insertNewlines(code, maxLen = 8000) {
    let out = "";
    let lineLen = 0;
    let inString = false;
    let stringChar = null;

    for (let i = 0; i < code.length; i++) {
      const c = code[i];

      if (inString) {
        out += c;
        lineLen++;
        if (c === stringChar && code[i - 1] !== "\\") {
          inString = false;
        }
        continue;
      }

      if (c === '"' || c === "'") {
        inString = true;
        stringChar = c;
        out += c;
        lineLen++;
        continue;
      }

      if (lineLen >= maxLen) {
        out += "\n";
        lineLen = 0;
      }

      out += c;
      lineLen++;
    }

    return out;
  }

  const GLOBAL_USED_NAMES = new Set();
  const rawVarGen = nameGenerator();

  function safeGen() {
    let n;
    do {
      n = rawVarGen();
    } while (GLOBAL_USED_NAMES.has(n));
    GLOBAL_USED_NAMES.add(n);
    return n;
  }
  function funcOb(code) {
    const ACTION_DEF =
      /(^|\n)\s*(?!public\s+)((?:num|str|obj)\s+)?action\s+([a-zA-Z_][\w]*)\s*\(/g;

    const gen = nameGenerator();
    const map = new Map();


    let match;
    while ((match = ACTION_DEF.exec(code))) {
      const name = match[3];
      if (!map.has(name)) {
        const obf = gen();
        map.set(name, obf);
        GLOBAL_USED_NAMES.add(obf);
      }
    }


    for (const [orig, obf] of map) {
      const defRegex = new RegExp(
        "(^|\\n)(\\s*)((?:num|str|obj)\\s+)?action\\s+" + orig + "\\s*\\(",
        "g",
      );

      code = code.replace(
        defRegex,
        (_, nl, indent, type) => `${nl}${indent}${type || ""}action ${obf}(`,
      );
    }

    for (const [orig, obf] of map) {
      const callRegex = new RegExp("\\b" + orig + "\\s*\\(", "g");
      code = code.replace(callRegex, obf + "(");
    }

    return code;
  }
  function varOb(code) {
    let out = "";
    let i = 0;

    while (i < code.length) {
      const m = /action\s+([a-zA-Z_][\w]*)\s*\(([^)]*)\)\s*\{/.exec(
        code.slice(i),
      );
      if (!m) {
        out += code.slice(i);
        break;
      }

      const start = i + m.index;
      const bodyStart = start + m[0].length;
      let depth = 1;
      let j = bodyStart;

      while (j < code.length && depth > 0) {
        if (code[j] === "{") depth++;
        else if (code[j] === "}") depth--;
        j++;
      }

      const full = code.slice(start, j);
      const actionName = m[1];
      const paramList = m[2];
      let body = code.slice(bodyStart, j - 1);

      const map = new Map();

      const params = paramList
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      const newParams = params.map((p) => {
        const parts = p.split(/\s+/);
        const name = parts.at(-1);
        const obf = safeGen();
        map.set(name, obf);
        parts[parts.length - 1] = obf;
        return parts.join(" ");
      });

      body = body.replace(/\b(num|str|obj)\s+([a-zA-Z_][\w]*)/g, (_, t, n) => {
        if (!map.has(n)) map.set(n, safeGen());
        return t + " " + map.get(n);
      });

      for (const [orig, obf] of map) {
        const re = new RegExp("\\b" + orig + "\\b(?!\\s*\\()", "g");
        body = replaceOutsideStrings(body, (chunk) => chunk.replace(re, obf));
      }

      out += code.slice(i, start);
      out += `action ${actionName}(${newParams.join(",")}){${body}}`;
      i = j;
    }

    return out;
  }

  function minifyWhitespace(code) {
    let out = "";
    let inString = false;
    let stringChar = null;

    for (let i = 0; i < code.length; i++) {
      const c = code[i];

      if (inString) {
        out += c;
        if (c === stringChar && code[i - 1] !== "\\") {
          inString = false;
        }
        continue;
      }

      if (c === '"' || c === "'") {
        inString = true;
        stringChar = c;
        out += c;
        continue;
      }

      if (/\s/.test(c)) {
        if (out[out.length - 1] !== " ") {
          out += " ";
        }
        continue;
      }

      out += c;
    }

    return out.trim();
  }

  function minify(code) {
    return tightenSyntax(minifyWhitespace(stripComments(code)));
  }

  function tightenSyntax(code) {
    return code.replace(/\s*([{}();,+\-*/=<>])\s*/g, "$1");
  }
  function nameGenerator() {
    let i = 0;
    return function () {
      let name = "";
      let n = i++;
      do {
        name = String.fromCharCode(97 + (n % 26)) + name;
        n = Math.floor(n / 26) - 1;
      } while (n >= 0);
      return name;
    };
  }

  function stripComments(code) {
    let out = "";
    let inString = false;
    let stringChar = null;

    for (let i = 0; i < code.length; i++) {
      const c = code[i];
      const next = code[i + 1];

      if (inString) {
        out += c;
        if (c === stringChar && code[i - 1] !== "\\") {
          inString = false;
        }
        continue;
      }

      if (c === '"' || c === "'") {
        inString = true;
        stringChar = c;
        out += c;
        continue;
      }

      if (c === "#") {
        while (i < code.length && code[i] !== "\n") i++;
        out += "\n";
        continue;
      }

      out += c;
    }

    return out;
  }

  function findUsedSymbols(source) {
    const used = new Set();
    const regex = /\b([a-zA-Z_][\w]*)\s*\(/g;
    let match;
    while ((match = regex.exec(source))) {
      if (!RESERVED.has(match[1])) {
        used.add(match[1]);
      }
    }
    return used;
  }



  function collectUsedSymbols(entryCode, exportMap) {
    const used = new Set(findUsedSymbols(entryCode));
    let changed = true;

    while (changed) {
      changed = false;
      for (const sym of [...used]) {
        const def = exportMap[sym];
        if (!def) continue;

        const deps = findUsedSymbols(def);
        for (const d of deps) {
          if (!used.has(d)) {
            used.add(d);
            changed = true;
          }
        }
      }
    }
    return used;
  }


  function extractExports(libContent) {
    const exports = {};
    const regex = /export\s+(?:num|str|obj)?\s*action\s+([a-zA-Z_][\w]*)\s*\(/g;
    let match;

    while ((match = regex.exec(libContent))) {
      const name = match[1];
      let start = libContent.indexOf("{", match.index);
      let depth = 0;

      for (let i = start; i < libContent.length; i++) {
        if (libContent[i] === "{") depth++;
        else if (libContent[i] === "}") depth--;

        if (depth === 0) {
          exports[name] = libContent.slice(match.index, i + 1);
          break;
        }
      }
    }
    return exports;
  }

  function stripExportKeyword(code) {
    return code.replace(/\bexport\s+(?=(?:num|str|obj)?\s*action\b)/g, "");
  }

  function findImportedLibraries(source) {
    const libs = new Set();
    const regex = /import\s+([a-zA-Z_][\w]*)\s*;/gi;
    let match;
    while ((match = regex.exec(source))) {
      libs.add(match[1].toLowerCase());
    }
    return libs;
  }


  function buildProject(project) {
    const client = project.files["client.krnk"];
    const server = project.files["server.krnk"];

    if (!client || !client.valid) {
      console.error("Build blocked: client.krnk is not validated");
      alert("Build blocked: client.krnk is not validated");
      return false;
    }
    if (server && !server.valid) {
      console.error("Build blocked: server.krnk is not validated");
      alert("Build blocked: server.krnk is not validated");
      return false;
    }

    function processFile(fileName) {
      const file = project.files[fileName];
      if (!file) return null;

      let content = file.content;



      const allExports = {};
      const seenExports = new Map();

      content = content.replace(
        /import\s+([a-zA-Z_][\w]*)\s*;/gi,
        function (_, libName) {
          const libEntry = Object.entries(project.files).find(([fname, f]) => {
            const base = fname.replace(/\.[^.]+$/, "").toLowerCase();
            return (
              base === libName.toLowerCase() &&
              ["clientLibrary", "serverLibrary", "sharedLibrary"].includes(
                f.type,
              )
            );
          });

          if (!libEntry) return "";

          const [libFileName, libFile] = libEntry;

          if (/^\s*import\s+/m.test(libFile.content)) {
            throw new Error(`Library "${libName}" cannot contain imports`);
          }

          const exports = extractExports(libFile.content);

          for (const sym in exports) {
            if (seenExports.has(sym)) {
              throw new Error(
                `Duplicate export "${sym}" in "${seenExports.get(sym)}" and "${libFileName}"`,
              );
            }
            seenExports.set(sym, libFileName);
            allExports[sym] = exports[sym];
          }

          return "";
        },
      );


      const used = collectUsedSymbols(content, allExports);
      let injected = "";

      for (const sym of used) {
        if (allExports[sym]) {
          injected += allExports[sym] + "\n\n";
        }
      }

      content = injected + content;
      content = stripExportKeyword(content);

      content = funcOb(content);
      content = varOb(content);


      content = minify(content);



      return content;
    }

    let clientOut, serverOut;

    try {
      clientOut = processFile("client.krnk");
      serverOut = processFile("server.krnk");
    } catch (err) {
      console.error(err);
      alert(err.message);
      return false;
    }

    function downloadFile(name, content) {
      const blob = new Blob([content], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }, 100);
    }



    console.info("build successful");
    try {
      if (linkingAction && typeof linkingAction.linking === 'function') {

        linkingAction.linking(clientOut, serverOut);
      }
    } catch (_) {}
    return true;
  }

  return { buildProject };
});
