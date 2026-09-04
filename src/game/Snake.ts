import { type Direction, opposite, stepFrom } from './Direction';
import { type Point, samePoint } from './Point';

export class Snake {
  private readonly cells: Point[] = [];
  private direction: Direction;

  constructor(head: Point, length: number, direction: Direction) {
    if (length < 1) {
      throw new Error('snake length must be >= 1');
    }

    this.direction = direction;
    const back = opposite(direction);
    let cell = head;
    for (let i = 0; i < length; i += 1) {
      this.cells.push(cell);
      cell = stepFrom(cell, back);
    }
  }

  get head(): Point {
    const cell = this.cells[0];

    if (cell === undefined) {
      throw new Error('empty snake');
    }

    return { x: cell.x, y: cell.y };
  }

  get body(): readonly Point[] {
    return this.cells.map((cell) => ({ x: cell.x, y: cell.y }));
  }

  get facing(): Direction {
    return this.direction;
  }

  move(direction: Direction, grow: boolean): void {
    this.direction = direction;
    this.cells.unshift(stepFrom(this.head, direction));
    if (!grow) {
      this.cells.pop();
    }
  }

  hitsSelf(): boolean {
    const head = this.head;
    return this.cells.slice(1).some((cell) => samePoint(cell, head));
  }
}
