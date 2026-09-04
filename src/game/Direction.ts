import type { Point } from './Point';

export enum Direction {
  Up = 'Up',
  Down = 'Down',
  Left = 'Left',
  Right = 'Right',
}

const STEPS: { readonly [key in Direction]: Point } = {
  [Direction.Up]: { x: 0, y: -1 },
  [Direction.Down]: { x: 0, y: 1 },
  [Direction.Left]: { x: -1, y: 0 },
  [Direction.Right]: { x: 1, y: 0 },
};

export function stepFrom(point: Point, direction: Direction): Point {
  const step = STEPS[direction];
  return { x: point.x + step.x, y: point.y + step.y };
}

export function opposite(direction: Direction): Direction {
  switch (direction) {
    case Direction.Up:
      return Direction.Down;
    case Direction.Down:
      return Direction.Up;
    case Direction.Left:
      return Direction.Right;
    case Direction.Right:
      return Direction.Left;
  }
}

export function isOpposite(a: Direction, b: Direction): boolean {
  return STEPS[a].x + STEPS[b].x === 0 && STEPS[a].y + STEPS[b].y === 0;
}
