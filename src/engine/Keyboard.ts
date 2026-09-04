import type { InputBuffer } from './InputBuffer';
import { Key } from './Key';

const BINDINGS: { readonly [code: string]: Key } = {
  ArrowUp: Key.Up,
  ArrowDown: Key.Down,
  ArrowLeft: Key.Left,
  ArrowRight: Key.Right,
  Enter: Key.Confirm,
  Backspace: Key.Cancel,
};

export class Keyboard implements InputBuffer {
  private readonly edges = new Set<Key>();
  private firstKeyDown: (() => void) | null = null;
  private attached = false;

  constructor(private readonly target: Window = window) {}

  attach(): void {
    if (this.attached) {
      return;
    }
    this.attached = true;
    this.target.addEventListener('keydown', this.onKeyDown, true);
  }

  detach(): void {
    if (!this.attached) {
      return;
    }
    this.attached = false;
    this.target.removeEventListener('keydown', this.onKeyDown, true);
  }

  wasPressed(key: Key): boolean {
    return this.edges.has(key);
  }

  clearEdges(): void {
    this.edges.clear();
  }

  // Fires inside the real keydown handler (user-activation window), not the poll.
  onFirstKeyDown(callback: () => void): void {
    this.firstKeyDown = callback;
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const key = BINDINGS[event.code];

    if (key === undefined) {
      return;
    }

    event.preventDefault();
    if (event.repeat) {
      return;
    }

    this.edges.add(key);

    const callback = this.firstKeyDown;
    if (callback !== null) {
      this.firstKeyDown = null;
      callback();
    }
  };
}
