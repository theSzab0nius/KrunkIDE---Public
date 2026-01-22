define(["./storage.js"], function (storage) {
  function createProject(clientTemplate, serverTemplate) {
    return {
      name: "Untitled Project",
      files: {
        "client.krnk": {
          type: "client",
          content: clientTemplate,
          open: true,
          pinned: true,
          valid: false,
          hasErrors: false,
        },
        "server.krnk": {
          type: "server",
          content: serverTemplate,
          open: true,
          pinned: true,
          valid: false,
          hasErrors: false,
        },
        "mathUtils.krnk": {
          type: "sharedLibrary",
          content: "# Math utility functions",
          open: false,
          valid: false,
          hasErrors: false,
        },
      },
      openTabs: ["client.krnk", "server.krnk"],
      activeFile: "client.krnk",
    };
  }

  async function loadProject(clientTemplate, serverTemplate) {
    try {
      let saved = await storage.getItem("krunk-project");
      if (!saved) {

        try {
          const raw = localStorage.getItem("krunk-project");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.files && parsed.activeFile) {
              saved = parsed;
              await storage.setItem("krunk-project", parsed);
            }
          }
        } catch (_) {}
      }
      if (saved && saved.files && saved.activeFile) {
        if (!saved.name) saved.name = "Untitled Project";
        return saved;
      }
    } catch (_) {}
    return createProject(clientTemplate, serverTemplate);
  }

  async function saveProject(project) {
    try {
      await storage.setItem("krunk-project", project);
    } catch (err) {
      console.warn("[storage] save failed", err && err.message);
    }
  }

  return { createProject, loadProject, saveProject };
});
