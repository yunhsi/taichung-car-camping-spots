import { JSDOM } from "jsdom";

class TestResizeObserver implements ResizeObserver {
  disconnect(): void {}

  observe(): void {}

  unobserve(): void {}
}

export function installTestDom(): JSDOM {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
  });

  Object.defineProperties(globalThis, {
    CustomEvent: { configurable: true, value: dom.window.CustomEvent },
    document: { configurable: true, value: dom.window.document },
    DocumentFragment: {
      configurable: true,
      value: dom.window.DocumentFragment,
    },
    DOMException: { configurable: true, value: dom.window.DOMException },
    Element: { configurable: true, value: dom.window.Element },
    Event: { configurable: true, value: dom.window.Event },
    getComputedStyle: {
      configurable: true,
      value: dom.window.getComputedStyle.bind(dom.window),
    },
    HTMLElement: { configurable: true, value: dom.window.HTMLElement },
    HTMLInputElement: {
      configurable: true,
      value: dom.window.HTMLInputElement,
    },
    localStorage: { configurable: true, value: dom.window.localStorage },
    MutationObserver: {
      configurable: true,
      value: dom.window.MutationObserver,
    },
    Node: { configurable: true, value: dom.window.Node },
    NodeFilter: { configurable: true, value: dom.window.NodeFilter },
    navigator: { configurable: true, value: dom.window.navigator },
    PointerEvent: {
      configurable: true,
      value: dom.window.PointerEvent ?? dom.window.MouseEvent,
    },
    requestAnimationFrame: {
      configurable: true,
      value: (callback: FrameRequestCallback) => {
        callback(0);
        return 0;
      },
    },
    ResizeObserver: { configurable: true, value: TestResizeObserver },
    StorageEvent: { configurable: true, value: dom.window.StorageEvent },
    window: { configurable: true, value: dom.window },
    IS_REACT_ACT_ENVIRONMENT: {
      configurable: true,
      value: true,
      writable: true,
    },
  });

  Object.defineProperties(dom.window.HTMLElement.prototype, {
    scrollIntoView: {
      configurable: true,
      value: () => undefined,
    },
  });
  Object.defineProperty(dom.window, "scrollTo", {
    configurable: true,
    value: () => undefined,
  });

  return dom;
}

export const testDom = installTestDom();
