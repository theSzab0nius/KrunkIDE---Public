define([], function () {
  function updateCurrentFileIndicator(project) {
    const indicator = document.getElementById("current-file-indicator");
    if (!indicator) return;
    indicator.innerHTML = '';
    const circle = document.createElement('span');
    circle.style.display = 'inline-block';
    circle.style.width = '10px';
    circle.style.height = '10px';
    const active = project.activeFile && project.files[project.activeFile];
    const hasErrors = !!(active && active.hasErrors);
    const isValid = !!(active && active.valid);
    circle.style.background = hasErrors
      ? 'var(--ui-error)'
      : (isValid ? 'var(--ui-success)' : 'var(--ui-accent)');
    circle.style.borderRadius = '50%';
    circle.style.marginRight = '8px';
    circle.style.verticalAlign = 'middle';
    const fileName = document.createElement('span');
    fileName.textContent = project.activeFile || '';
    fileName.style.verticalAlign = 'middle';
    indicator.appendChild(circle);
    indicator.appendChild(fileName);
  }

  function enhanceOpenFile(project) {
    const originalOpenFile = window.openFile;
    window.openFile = function(fileName, focusEditor = true) {
      originalOpenFile(fileName, focusEditor);
      updateCurrentFileIndicator(project);
    };
    updateCurrentFileIndicator(project);
  }

  return { updateCurrentFileIndicator, enhanceOpenFile };
});
