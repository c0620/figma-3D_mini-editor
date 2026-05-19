import { render } from "@testing-library/react";

import App from "@/App";
import { AppKernelProvider } from "@/app/ApplicationKernelContext";
import { buildKernel } from "@/app/compositionRoot";

import { loadSceneIntoStore } from "./renderEditor";

export function renderApp(options?: { preloadScene?: boolean }) {
  const kernel = buildKernel();
  if (options?.preloadScene !== false) {
    loadSceneIntoStore();
  }

  return {
    kernel,
    ...render(
      <AppKernelProvider kernel={kernel}>
        <App />
      </AppKernelProvider>,
    ),
  };
}
