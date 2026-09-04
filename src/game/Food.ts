import type { Point } from './Point';

export class Food {
  private cell: Point | null = null;

  constructor(
    private readonly cols: number,
    private readonly rows: number,
    private readonly rng: () => number,
  ) {}

  get position(): Point | null {
    return this.cell;
  }

  respawn(occupied: readonly Point[]): boolean {
    const taken = new Set(occupied.map((cell) => `${cell.x},${cell.y}`));
    const free: Point[] = [];

    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < this.cols; x += 1) {
        if (!taken.has(`${x},${y}`)) {
          free.push({ x, y });
        }
      }
    }

    if (free.length === 0) {
      this.cell = null;
      return false;
    }

    const index = Math.min(free.length - 1, Math.max(0, Math.floor(this.rng() * free.length)));

    const pick = free[index];

    if (pick === undefined) {
      this.cell = null;
      return false;
    }

    this.cell = pick;
    return true;
  }
}
