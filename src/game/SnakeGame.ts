import { Direction, isOpposite, stepFrom } from './Direction';
import { Food } from './Food';
import { type Point, samePoint } from './Point';
import { Snake } from './Snake';

export class SnakeGame {
  private readonly snake: Snake;
  private readonly food: Food;
  private queued: Direction | null = null;
  private dead = false;
  private scoreValue = 0;

  constructor(
    private readonly cols: number,
    private readonly rows: number,
    startLength: number,
    rng: () => number = Math.random,
  ) {
    const head = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
    this.snake = new Snake(head, startLength, Direction.Right);
    this.food = new Food(cols, rows, rng);
    this.food.respawn(this.snake.body);
  }

  get isOver(): boolean {
    return this.dead;
  }

  get score(): number {
    return this.scoreValue;
  }

  get snakeCells(): readonly Point[] {
    return this.snake.body;
  }

  get foodCell(): Point | null {
    return this.food.position;
  }

  setDirection(direction: Direction): void {
    const relativeTo = this.queued ?? this.snake.facing;
    if (!isOpposite(direction, relativeTo)) {
      this.queued = direction;
    }
  }

  tick(): void {
    if (this.dead) {
      return;
    }

    const direction = this.queued ?? this.snake.facing;
    this.queued = null;

    const next = stepFrom(this.snake.head, direction);
    if (next.x < 0 || next.y < 0 || next.x >= this.cols || next.y >= this.rows) {
      this.dead = true;
      return;
    }

    const food = this.food.position;
    const eating = food !== null && samePoint(next, food);

    this.snake.move(direction, eating);
    if (this.snake.hitsSelf()) {
      this.dead = true;
      return;
    }

    if (eating) {
      this.scoreValue += 1;
      if (!this.food.respawn(this.snake.body)) {
        this.dead = true;
      }
    }
  }
}
