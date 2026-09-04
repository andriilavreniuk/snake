import { AdOutcome } from '../ads/AdOutcome';
import type { IAdPlayer } from '../ads/IAdPlayer';
import { COLORS } from '../config/colors';
import { AD_MESSAGE_SIZE } from '../config/layout';
import { STRINGS } from '../config/strings';
import type { CanvasSurface } from '../engine/CanvasSurface';
import type { IScreen } from './IScreen';

export class AdScreen implements IScreen {
  private active = false;

  constructor(
    private readonly adPlayer: IAdPlayer,
    private readonly onOutcome: (outcome: AdOutcome) => void,
  ) {}

  enter(): void {
    this.active = true;

    const report = (outcome: AdOutcome): void => {
      if (this.active) {
        this.onOutcome(outcome);
      }
    };

    this.adPlayer.play().then(report, () => report(AdOutcome.Failed));
  }

  // Drops a result that arrives after we have left the screen.
  exit(): void {
    this.active = false;
    this.adPlayer.stop();
  }

  handleInput(): void {}

  update(): void {}

  draw(surface: CanvasSurface): void {
    surface.clear(COLORS.adBackdrop);
    surface.text(
      STRINGS.adLoading,
      surface.width / 2,
      surface.height / 2,
      AD_MESSAGE_SIZE,
      COLORS.textDim,
      'center',
    );
  }
}
