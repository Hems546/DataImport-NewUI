
/// <reference types="vite/client" />

declare module '*.MD?raw' {
  const content: string;
  export default content;
}

declare module '/README.md?raw' {
  const content: string;
  export default content;
}
