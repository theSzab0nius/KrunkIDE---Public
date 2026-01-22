# Frost IDE (Preview)

**Important:** This repository hosts an **unminified development snapshot** of Frost IDE.  
It is shared for preview and experimentation purposes and is **not a finished product**.

The project is currently paused and may change significantly if/when development resumes.

---

## What is Frost IDE?

Frost IDE is an experimental external IDE designed to work alongside the official **Krunker Editor**, with the goal of providing a more flexible and powerful scripting experience.

It does **not** replace the Krunker editor — instead, it integrates with it.

---

## How to Use

1. Open Frost IDE in your browser.
2. Click **File → Open Linked Editor**.
3. This will open the official Krunker editor in a linked browser tab.
4. Once linked, Frost IDE can automatically inject code into the Krunker editor.

>  The Krunker editor **must be opened via Frost IDE** for injection to work correctly.


---

### Using Libraries

You can import libraries exposed in the **Inspector panel** using:

```js
import libraryName;

Imported libraries expose helper functions that can be used in your script.

Required Function Format

Functions inside a library must follow this format:
# Dummy helper actions for testing

export num action helperAlpha(num x) {
  return x;
}

export num action helperBeta(num a, num b) {
  helperAlpha(a);
  return b;
}

export action helperGamma() {
  helperBeta(1, 2);
}

The Build Button (What It Does)

Clicking Build performs several transformations automatically:

Inlines custom import statements

Tree-shakes unused library code

Obfuscates and minifies the output

Injects the result into the linked Krunker editor

Triggers Krunker’s validation step

Because of this aggressive transformation pipeline:

Output code is not human-readable

Runtime issues are hard to debug


Required Userscripts (Tampermonkey)

Frost IDE relies on Tampermonkey to bridge communication between the IDE and the official Krunker scripting editor.

You must install the following userscripts for Frost to function correctly.

1. FROST ↔ Krunker Editor Bridge
// ==UserScript==
// @name         FROST ↔ Krunker Editor Bridge
// @namespace    frost.ide
// @version      2.0.1
// @description  Opens Scripting tab and forwards scripts to scripting.html
// @match        https://krunker.io/editor.html
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    if (window.__FROST_EDITOR_BRIDGE__) return;
    window.__FROST_EDITOR_BRIDGE__ = true;

    let PLAY = false;
    const DEBUG = true;
    const log = (...a) => DEBUG && console.log('[FROST editor]', ...a);

    const ALLOWED_ORIGINS = [
        /^https:\/\/theszab0nius\.github\.io$/
    ];

    const isAllowed = origin => ALLOWED_ORIGINS.some(r => r.test(origin));

    let scriptingWindow = null;
    let pendingMessages = [];
    let ideWindow = null;
    let ideOrigin = null;

    function openScriptingTab() {
        // If scripting window already exists, nothing to do
        if (scriptingWindow && !scriptingWindow.closed) {
            return true;
        }

        if (window.GUI && typeof GUI.action === 'function') {
            log('Opening Scripting tab via GUI.action');
            GUI.action(['_toolbar', 'blueprint', 'Scripting']);
            return true;
        }

        log('GUI.action not available (yet)');
        return false;
    }
    function openHost() {
        if (window.KE && typeof KE.testMap === 'function') {
            log('Hosting game via KE.testMap(true)');
            KE.testMap(true);
            return true;
    }

    log('KE.testMap not available');
    return false;
    }

    log('Bridge ready');

    window.addEventListener('message', e => {
        if (!e.data || typeof e.data !== 'object') return;

        const { type } = e.data;
        log('Message:', type);

        if (type === 'FROST_HELLO' && isAllowed(e.origin)) {
            ideWindow = e.source;
            ideOrigin = e.origin;

            ideWindow.postMessage(
                { type: 'KRUNKER_READY' },
                ideOrigin
            );
            return;
        }
        if (type === 'BUILD_PLAY' && isAllowed(e.origin)) {
            PLAY = true;
        }

        if (type === 'FROST_SCRIPTING_READY' && e.source) {
            scriptingWindow = e.source;
            log('Scripting window registered');

            if (pendingMessages.length) {
                log(`Flushing ${pendingMessages.length} queued message(s)`);
                for (const msg of pendingMessages) {
                    scriptingWindow.postMessage(msg, '*');
                }
                pendingMessages.length = 0;
            }
            return;
        }

        if (type === 'FROST_SET_SCRIPT' && isAllowed(e.origin)) {
            openScriptingTab();

            if (scriptingWindow && !scriptingWindow.closed) {
                scriptingWindow.postMessage(e.data, '*');
                log('Forwarded to scripting.html');
            } else {
                pendingMessages.push(e.data);
                log('Queued script (scripting not ready)');
            }
        }
        if (type === 'FROST_SCRIPT_APPLIED') {
            log('Script successfully injected & validated:', e.data.target);

            if (ideWindow && ideOrigin) {
                ideWindow.postMessage(
                    {
                        type: 'SCRIPT_SYNCED',
                        target: e.data.target
                    },
                    ideOrigin
                );
            }
            if (PLAY == true){
            openHost();
            PLAY = false;
            }
            return;
        }
    });
})();

2. Krunker Editor Bridge ↔ Krunker Scripting Bridge

// ==UserScript==
// @name        Krunker Editor Bridge ↔ Krunker Scripting Bridge
// @namespace   frost.krunker.scripting
// @version     1.1.0
// @description  Injects scripts, validates client & server, reports success
// @match       https://krunker.io/scripting.html
// @run-at      document-start
// @grant       none
// ==/UserScript==

(() => {
    'use strict';

    if (window.__FROST_SCRIPTING_BRIDGE__) return;
    window.__FROST_SCRIPTING_BRIDGE__ = true;

    const DEBUG = true;
    const log = (...a) => DEBUG && console.log('[FROST scripting]', ...a);

    let clientCM = null;
    let serverCM = null;

    /* ------------------ messaging ------------------ */

    function notifyApplied(target = 'both') {
        if (!window.opener) return;

        window.opener.postMessage(
            { type: 'FROST_SCRIPT_APPLIED', target },
            '*'
        );

        log('Notified editor bridge: script applied & validated');
    }

    /* ------------------ validation ------------------ */

    function activateTab(id) {
        const tab = document.getElementById(id);
        if (!tab || typeof window.changeTab !== 'function') {
            log(`Tab "${id}" not available`);
            return false;
        }

        window.changeTab(tab);
        return true;
    }

    function validate() {
        if (!window.opener?.KE?.updateScript) {
            log('KE.updateScript not available');
            return false;
        }

        window.opener.KE.updateScript();
        return true;
    }

    function validateBothAndClose() {
        log('Validating CLIENT');
        activateTab('client');
        validate();

        setTimeout(() => {
            log('Validating SERVER');
            activateTab('server');
            validate();

            setTimeout(closeWhenValidationSettles, 300);
        }, 300);
    }

    function closeWhenValidationSettles() {
        const KE = window.opener?.KE;
        if (!KE) {
            log('No opener.KE — cannot poll validation');
            return;
        }

        let attempts = 0;
        const maxAttempts = 60;

        const check = setInterval(() => {
            attempts++;
            log(
                `Polling KE.validating (${attempts}/${maxAttempts}):`,
                KE.validating
            );

            if (!KE.validating) {
                clearInterval(check);
                log('Validation settled');

                notifyApplied('both');
                window.close();
            }

            if (attempts >= maxAttempts) {
                clearInterval(check);
                log('Validation timeout — forcing close');

                notifyApplied('both');
                window.close();
            }
        }, 100);
    }

    /* ------------------ editor discovery ------------------ */

    const waitForEditors = setInterval(() => {
        const editors = [...document.querySelectorAll('.CodeMirror')]
            .map(el => el.CodeMirror)
            .filter(Boolean);

        if (editors.length < 2) return;

        clearInterval(waitForEditors);
        [clientCM, serverCM] = editors;

        log('Client & Server editors ready');

        window.opener?.postMessage(
            { type: 'FROST_SCRIPTING_READY' },
            '*'
        );
    }, 50);

    /* ------------------ tab hook (CodeMirror refresh) ------------------ */

    const hookTabChange = setInterval(() => {
        if (typeof window.changeTab !== 'function') return;

        clearInterval(hookTabChange);

        const originalChangeTab = window.changeTab;
        window.changeTab = function (tab, ...args) {
            const result = originalChangeTab.call(this, tab, ...args);

            setTimeout(() => {
                if (tab?.id === 'client') clientCM?.refresh();
                if (tab?.id === 'server') serverCM?.refresh();
            }, 0);

            return result;
        };

        log('changeTab hooked');
    }, 50);

    /* ------------------ message handling ------------------ */

    window.addEventListener('message', event => {
        if (event.data?.type !== 'FROST_SET_SCRIPT') return;

        const { target, code } = event.data;

        if (!clientCM || !serverCM) {
            log('Editors not ready — injection skipped');
            return;
        }

        const cm = target === 'server' ? serverCM : clientCM;

        log(`Injecting ${target.toUpperCase()} script`);
        cm.setValue(code ?? '');
        cm.refresh();

        clearTimeout(window.__FROST_VALIDATE_TIMER__);
        window.__FROST_VALIDATE_TIMER__ = setTimeout(
            validateBothAndClose,
            200
        );
    });
})();


## Validation (Current State)

At the moment, **Frost IDE does not provide proper validation**.

- There is **no reliable syntax or semantic validation**
- Errors may not be detected
- Invalid scripts may still be injected

Validation was planned but is **not yet implemented** in this snapshot.

---

## Project Status

- This is a **development snapshot**
- Code is intentionally **unbundled and unminified**
- Folder structure reflects active development
- Some features are incomplete or experimental

This repository exists to:
- preserve the current state of the project
- provide a preview of the concept
- serve as a reference for future development

---

## Notes

- Do not rely on this for production scripts
- Expect rough edges
- Expect breaking changes if development resumes

If you’re curious, feel free to explore — just keep expectations in check.
