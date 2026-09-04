import { COLORS } from '../config/colors';
import { MAX_CATCHUP_TICKS, TICK_MS } from '../config/game';
import { CELL, FOOD_INSET, SCORE_SIZE, SCORE_X, SCORE_Y, SNAKE_INSET } from '../config/layout';
import { STRINGS } from '../config/strings';
import type { CanvasSurface, CornerRadius } from '../engine/CanvasSurface';
import type { InputSource } from '../engine/InputSource';
import { Key } from '../engine/Key';
import { Direction } from '../game/Direction';
import type { Point } from '../game/Point';
import type { SnakeGame } from '../game/SnakeGame';
import type { GameResult, IScreen } from './IScreen';

const DIRECTION_KEYS: readonly Key[] = [Key.Up, Key.Down, Key.Left, Key.Right];

const DIRECTION_BY_KEY: { readonly [key in Key]?: Direction } = {
  [Key.Up]: Direction.Up,
  [Key.Down]: Direction.Down,
  [Key.Left]: Direction.Left,
  [Key.Right]: Direction.Right,
};

export class PlayScreen implements IScreen {
  private sinceTickMs = 0;
  private reported = false;

  constructor(
    private readonly game: SnakeGame,
    private readonly onGameOver: (result: GameResult) => void,
  ) {}

  enter(): void {}

  exit(): void {}

  handleInput(input: InputSource): void {
    const direction = readDirection(input);
    if (direction !== null) {
      this.game.setDirection(direction);
    }
  }

  update(dtMs: number): void {
    this.sinceTickMs += dtMs;

    let ticks = 0;
    while (this.sinceTickMs >= TICK_MS && ticks < MAX_CATCHUP_TICKS && !this.game.isOver) {
      this.sinceTickMs -= TICK_MS;
      ticks += 1;
      this.game.tick();
    }

    if (this.sinceTickMs >= TICK_MS) {
      this.sinceTickMs = 0;
    }

    if (this.game.isOver && !this.reported) {
      this.reported = true;
      this.onGameOver({ score: this.game.score });
    }
  }

  draw(surface: CanvasSurface): void {
    surface.clear(COLORS.court);

    for (let x = CELL; x < surface.width; x += CELL) {
      surface.fillRect(x, 0, 1, surface.height, COLORS.grid);
    }
    for (let y = CELL; y < surface.height; y += CELL) {
      surface.fillRect(0, y, surface.width, 1, COLORS.grid);
    }

    const food = this.game.foodCell;
    if (food !== null) {
      const radius = (CELL - FOOD_INSET * 2) / 2;
      surface.fillCircle(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, radius, COLORS.food);
    }

    const snake = this.game.snakeCells;
    const size = CELL - SNAKE_INSET * 2;
    const cap = size / 2;

    snake.forEach((cell, index) => {
      surface.fillRoundedRect(
        cell.x * CELL + SNAKE_INSET,
        cell.y * CELL + SNAKE_INSET,
        size,
        size,
        segmentRadii(cell, index, snake, cap),
        index === 0 ? COLORS.snakeHead : COLORS.snake,
      );
    });

    surface.text(
      `${STRINGS.score} ${this.game.score}`,
      SCORE_X,
      SCORE_Y,
      SCORE_SIZE,
      COLORS.textDim,
    );
  }
}

function readDirection(input: InputSource): Direction | null {
  for (const key of DIRECTION_KEYS) {
    if (input.wasPressed(key)) {
      return DIRECTION_BY_KEY[key] ?? null;
    }
  }
  return null;
}

const SQUARE: CornerRadius = { tl: 0, tr: 0, br: 0, bl: 0 };

function segmentRadii(
  cell: Point,
  index: number,
  cells: readonly Point[],
  cap: number,
): CornerRadius {
  if (cells.length === 1) {
    return { tl: cap, tr: cap, br: cap, bl: cap };
  }

  if (index === 0) {
    const neck = cells[1];
    return neck === undefined ? SQUARE : capRadii(cell, neck, cap);
  }

  if (index === cells.length - 1) {
    const prev = cells[cells.length - 2];
    return prev === undefined ? SQUARE : capRadii(cell, prev, cap);
  }

  return SQUARE;
}

function capRadii(cell: Point, neighbor: Point, radius: number): CornerRadius {
  const dx = neighbor.x - cell.x;
  const dy = neighbor.y - cell.y;

  if (dx === 1 && dy === 0) {
    return { tl: radius, tr: 0, br: 0, bl: radius };
  }
  if (dx === -1 && dy === 0) {
    return { tl: 0, tr: radius, br: radius, bl: 0 };
  }
  if (dx === 0 && dy === 1) {
    return { tl: radius, tr: radius, br: 0, bl: 0 };
  }
  if (dx === 0 && dy === -1) {
    return { tl: 0, tr: 0, br: radius, bl: radius };
  }

  return { tl: radius, tr: radius, br: radius, bl: radius };
}
