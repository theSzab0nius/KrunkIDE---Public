define(["./consoleCommands.js"], function (consoleCommands) {
  return {
    setupConsole: function () {
      const consoleContent = document.getElementById("console-content");

      function appendConsoleMessage(type, args) {
        if (!consoleContent) return;

        const line = document.createElement("div");
        line.className = `console-line console-${type}`;

        line.textContent = args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
          )
          .join(" ");

        consoleContent.appendChild(line);
        consoleContent.scrollTop = consoleContent.scrollHeight;
      }

      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;
      const originalInfo = console.info;

      console.log = (...args) => {
        appendConsoleMessage("log", args);
        originalLog.apply(console, args);
      };

      console.warn = (...args) => {
        appendConsoleMessage("warn", args);
        originalWarn.apply(console, args);
      };

      console.error = (...args) => {
        appendConsoleMessage("error", args);
        originalError.apply(console, args);
      };

      console.info = (...args) => {
        appendConsoleMessage("info", args);
        (originalInfo || originalLog).apply(console, args);
      };


      const consoleInput = document.getElementById("console-input");
      if (consoleInput) {
        consoleInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            const code = consoleInput.value.trim();
            if (code) {

              const context = {
                openFile: window.openFile,
                project: window.project,
              };
              const result = consoleCommands.handleCommand(code, context);
              if (result && result.handled) {
                appendConsoleMessage(result.error ? "error" : "log", [result.output]);
              } else {
                appendConsoleMessage("log", ["> " + code]);
                try {

                  const evalResult = eval(code);
                  if (evalResult !== undefined) {
                    appendConsoleMessage("log", [evalResult]);
                  }
                } catch (err) {
                  appendConsoleMessage("error", [err]);
                }
              }
            }
            consoleInput.value = "";
          }
        });
      }

      return { appendConsoleMessage };
    },
  };
});
