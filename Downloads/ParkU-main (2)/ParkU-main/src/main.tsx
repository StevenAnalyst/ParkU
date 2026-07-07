
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
//   const ignoredWarnings = [
//   "Unsupported style property @media",
//   "Function components cannot be given refs",
// ];

// const originalWarn = console.warn;

// console.warn = (...args) => {
//   if (
//     typeof args[0] === "string" &&
//     ignoredWarnings.some((msg) => args[0].includes(msg))
//   ) {
//     return;
//   }

//   originalWarn(...args);
// };

// const originalError = console.error;

// console.error = (...args) => {
//   if (
//     typeof args[0] === "string" &&
//     args[0].includes("Function components cannot be given refs")
//   ) {
//     return;
//   }

//   originalError(...args);
// };

// console.warn = () => {};
// console.error = () => {};

  createRoot(document.getElementById("root")!).render(<App />);
  