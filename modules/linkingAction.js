define([], function () {
  function linking(clientOut, serverOut) {
    try {
      if (!window.frost?.krunkerWin || !window.frost?.linked) {
        console.warn("[FROST] Not linked to Krunker editor");
        return;
      }

      const krunkerWin = window.frost.krunkerWin;
      console.warn("[FROST] Sending scripts to Krunker editor");

      if (clientOut) {
        krunkerWin.postMessage(
          {
            type: "FROST_SET_SCRIPT",
            target: "client",
            code: clientOut,
          },
          "https://krunker.io",
        );
      }

      if (serverOut) {
        krunkerWin.postMessage(
          {
            type: "FROST_SET_SCRIPT",
            target: "server",
            code: serverOut,
          },
          "https://krunker.io",
        );
      }
      setTimeout(() => {
        try {
          krunkerWin.focus();
          console.log("[FROST] Focused Krunker editor window");

          krunkerWin.postMessage(
            { type: "FROST_FOCUS_EDITOR" },
            "https://krunker.io",
          );
        } catch (focusErr) {
          console.warn("[FROST] Could not focus Krunker window", focusErr);
        }
      }, 0);
    } catch (err) {
      console.error("[FROST] Linking failed", err);
    }
  }

  return { linking };
});
