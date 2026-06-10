import "./index.css";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const rootElement = document.querySelector<HTMLDivElement>("#app");

if (!rootElement) {
  throw new Error("No se encontró el contenedor #app");
}

createRoot(rootElement).render(
  createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(App),
  ),
);
