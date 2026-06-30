declare module "tinykeys" {
  export interface KeyBindingMap {
    [keybinding: string]: (event: KeyboardEvent) => void;
  }

  export interface KeyBindingOptions {
    capture?: boolean;
    event?: "keydown" | "keyup";
    timeout?: number;
  }

  export function tinykeys(
    target: HTMLElement | Window,
    keyBindingMap: KeyBindingMap,
    options?: KeyBindingOptions,
  ): () => void;
}
