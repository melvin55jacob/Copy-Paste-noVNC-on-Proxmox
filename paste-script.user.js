
```javascript
// ==UserScript==
// @name         noVNC Clipboard Paste via Middle Click
// @namespace    https://yourdomain.dev/
// @version      1.0
// @description  Paste host clipboard to noVNC canvas on middle click
// @author       You
// @match        *://*/?console=kvm*
// @grant        clipboardRead
// @run-at       document-idle
// ==/UserScript==

(function () {
  const CANVAS_SELECTOR = "canvas";
  const MIDDLE_MOUSE_BUTTON = 1;

  let canvas;

  function waitForCanvas() {
    canvas = document.querySelector(CANVAS_SELECTOR);

    if (canvas) {
      initCanvas();
    } else {
      console.log("NoVNC canvas not found. Retrying...");
      setTimeout(waitForCanvas, 1000);
    }
  }

  function initCanvas() {
    console.log("NoVNC detected. Middle-click paste enabled.");
    canvas.id = "canvas-id";
    canvas.addEventListener("mousedown", handleMouseDown);
  }

  function handleMouseDown(event) {
    if (event.button === MIDDLE_MOUSE_BUTTON) {
      console.log("Middle-click detected. Pasting clipboard content...");
      event.preventDefault();
      pasteClipboardContent();
    }
  }

  async function pasteClipboardContent() {
    try {
      const text = await navigator.clipboard.readText();
      sendString(text);
    } catch (error) {
      console.error("Clipboard read failed:", error);
    }
  }

  function sendString(text) {
    text.split("").forEach((char, index) => {
      setTimeout(() => {
        const needsShift = /[A-Z!@#$%^&*()_+{}:"<>?~|]/.test(char);
        const event = new KeyboardEvent("keydown", { key: char, shiftKey: needsShift });

        if (needsShift) {
          const shiftDownEvent = new KeyboardEvent("keydown", { keyCode: 16 });
          canvas.dispatchEvent(shiftDownEvent);
        }

        canvas.dispatchEvent(event);

        if (needsShift) {
          const shiftUpEvent = new KeyboardEvent("keyup", { keyCode: 16 });
          canvas.dispatchEvent(shiftUpEvent);
        }

        const keyUpEvent = new KeyboardEvent("keyup", { key: char });
        canvas.dispatchEvent(keyUpEvent);
      }, index * 10);
    });
  }

  waitForCanvas();
})();
