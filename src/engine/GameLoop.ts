export interface LoopClient {
  update(dtMs: number): void;
  draw(): void;
}

// A backgrounded tab resumes with a huge gap between frames.
const MAX_DT_MS = 100;

export class GameLoop {
  private handle = 0;
  private lastMs = 0;
  private running = false;

  constructor(private readonly client: LoopClient) {}

  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastMs = performance.now();
    this.handle = requestAnimationFrame(this.frame);
  }

  stop(): void {
    if (!this.running) {
      return;
    }
    this.running = false;
    cancelAnimationFrame(this.handle);
  }

  private readonly frame = (nowMs: number): void => {
    if (!this.running) {
      return;
    }

    const dtMs = Math.min(nowMs - this.lastMs, MAX_DT_MS);
    this.lastMs = nowMs;

    this.client.update(dtMs);
    this.client.draw();

    if (this.running) {
      this.handle = requestAnimationFrame(this.frame);
    }
  };
}
