import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

window.helpMessage = `
Help:

🖱️  Drag nodes around the canvas by clicking and dragging
↗️  Double click an item to enlarge and view it in a dialog
📋  Paste text or drag from toolbar to create new nodes
🔄  Change node type using dropdown (System/Assistant/User) 
🗑️  Delete nodes with Backspace key
🔑  Set OpenAI API key in top-right
🤖  Select model (GPT-4o, GPT-3.5, etc) next to API key


Also access this help anytime by typing "help()" in the console
`;
