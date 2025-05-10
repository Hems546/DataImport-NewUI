
/// <reference types="vite/client" />

declare module '*.MD?raw' {
  const content: string;
  export default content;
}
