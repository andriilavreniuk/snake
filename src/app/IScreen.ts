import type { CanvasSurface } from '../engine/CanvasSurface';
import type { InputSource } from '../engine/InputSource';

export interface IScreen {
  enter(): void;
  exit(): void;
  handleInput(input: InputSource): void;
  update(dtMs: number): void;
  draw(surface: CanvasSurface): void;
}

export interface GameResult {
  readonly score: number;
}

export type GameScreenFactory = (onGameOver: (result: GameResult) => void) => IScreen;
