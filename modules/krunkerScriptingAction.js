define([], function () {

  let helloInterval = null;

  function log(msg) {
    console.log("[FROST]", msg);
  }

  function openKrunkerEditor() {
    log("Opening Krunker editor...");

    try {
      window.frost.krunkerWin = window.open(
        "https://krunker.io/editor.html",
        "krunkerEditor"
      );
    } catch (_) {
      location.href = "https://krunker.io/editor.html";
      return;
    }

    if (!window.frost.krunkerWin) {
      log("Failed to open Krunker editor");
      return;
    }

    window.addEventListener("message", onMessage);

    helloInterval = setInterval(() => {
      if (window.frost.krunkerWin.closed) {
        log("Krunker editor closed");
        clearInterval(helloInterval);
        window.frost.linked = false;
        return;
      }

      log("Sending FROST_HELLO");
      window.frost.krunkerWin.postMessage(
        { type: "FROST_HELLO" },
        "https://krunker.io"
      );
    }, 500);
  }

  function onMessage(e) {
    if (e.origin !== "https://krunker.io") return;


    if (e.data?.type === "KRUNKER_READY") {
      clearInterval(helloInterval);
      window.frost.linked = true;  
      log("Linked to Krunker editor ✓");
    }
    if (e.data?.type === "SCRIPT_SYNCED") {
      log("Script synced to Krunker editor ✓");
    }
  }

  return { openKrunkerEditor };
});
