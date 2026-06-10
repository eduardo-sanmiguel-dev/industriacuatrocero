import "./index.css";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.querySelector<HTMLDivElement>("#app");

if (!rootElement) {
  throw new Error("No se encontró el contenedor #app");
}

createRoot(rootElement).render(createElement(App));
