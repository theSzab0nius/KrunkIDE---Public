define([], function () {
  function initConsoleUI() {
    const consoleContainer = document.getElementById("console-container");
    const consoleArrow = document.getElementById("console-toggle-arrow");
    const consoleHeader = document.getElementById("console-header");

    let isConsoleCollapsed = false;
    let lastHeight = 150;

    consoleHeader.addEventListener("click", () => {
      if (!isConsoleCollapsed) {
        lastHeight = consoleContainer.offsetHeight;
        document.documentElement.style.setProperty("--console-height", "40px");
        consoleContainer.classList.add("collapsed");
      } else {
        const restoreHeight = Math.max(lastHeight, 100);
        document.documentElement.style.setProperty(
          "--console-height",
          restoreHeight + "px",
        );
        lastHeight = restoreHeight;
        consoleContainer.classList.remove("collapsed");
      }

      consoleArrow.classList.toggle("collapsed", !isConsoleCollapsed);
      isConsoleCollapsed = !isConsoleCollapsed;

      document.getElementById("resize-handle-vertical").style.bottom =
        getComputedStyle(document.documentElement).getPropertyValue(
          "--console-height",
        );

      window.dispatchEvent(new Event("resize"));
    });
  }
  return { initConsoleUI };
});
