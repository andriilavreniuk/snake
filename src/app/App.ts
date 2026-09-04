import { AdOutcome } from '../ads/AdOutcome';
import type { IAdPlayer } from '../ads/IAdPlayer';
import { STRINGS } from '../config/strings';
import { REDIRECT_URL } from '../config/urls';
import type { CanvasSurface } from '../engine/CanvasSurface';
import type { LoopClient } from '../engine/GameLoop';
import type { InputBuffer } from '../engine/InputBuffer';
import { AdScreen } from './AdScreen';
import { ConfirmScreen } from './ConfirmScreen';
import type { GameResult, GameScreenFactory, IScreen } from './IScreen';

export class App implements LoopClient {
  private current: IScreen | null = null;
  private pending: IScreen | null = null;

  constructor(
    private readonly surface: CanvasSurface,
    private readonly input: InputBuffer,
    private readonly adPlayer: IAdPlayer,
    private readonly createGameScreen: GameScreenFactory,
    private readonly redirect: (url: string) => void,
  ) {}

  start(): void {
    this.showStartConfirm();
  }

  update(dtMs: number): void {
    this.applyPendingScreen();

    if (this.current === null) {
      this.input.clearEdges();
      return;
    }

    this.current.handleInput(this.input);
    this.current.update(dtMs);
    this.input.clearEdges();
  }

  draw(): void {
    if (this.current !== null) {
      this.current.draw(this.surface);
    }
  }

  private showStartConfirm(): void {
    this.setScreen(
      new ConfirmScreen(
        STRINGS.startTitle,
        STRINGS.startBody,
        [STRINGS.yes, STRINGS.no],
        (primary) => (primary ? this.showAd() : this.leave()),
      ),
    );
  }

  private showAd(): void {
    this.setScreen(
      new AdScreen(this.adPlayer, (outcome) =>
        outcome === AdOutcome.Completed ? this.showPlay() : this.showAdProblem(),
      ),
    );
  }

  private showAdProblem(): void {
    this.setScreen(
      new ConfirmScreen(
        STRINGS.adProblemTitle,
        STRINGS.adProblemBody,
        [STRINGS.retry, STRINGS.leave],
        (primary) => (primary ? this.showAd() : this.leave()),
      ),
    );
  }

  private showPlay(): void {
    this.surface.focus();
    this.setScreen(this.createGameScreen((result) => this.showGameOver(result)));
  }

  private showGameOver(result: GameResult): void {
    this.setScreen(
      new ConfirmScreen(
        STRINGS.gameOverTitle,
        `${STRINGS.score} ${result.score}. ${STRINGS.gameOverBody}`,
        [STRINGS.yes, STRINGS.no],
        (primary) => (primary ? this.showAd() : this.leave()),
      ),
    );
  }

  private leave(): void {
    this.redirect(REDIRECT_URL);
  }

  private setScreen(screen: IScreen): void {
    this.pending = screen;
  }

  private applyPendingScreen(): void {
    const next = this.pending;

    if (next === null) {
      return;
    }

    this.pending = null;

    if (this.current !== null) {
      this.current.exit();
    }

    this.current = next;
    next.enter();

    this.input.clearEdges();
  }
}
