import { COLORS } from '../config/colors';
import {
  CONFIRM_BODY_SIZE,
  CONFIRM_BODY_Y,
  CONFIRM_BOX_GAP,
  CONFIRM_BOX_HEIGHT,
  CONFIRM_BOX_WIDTH,
  CONFIRM_BOX_Y,
  CONFIRM_HINT_SIZE,
  CONFIRM_HINT_Y,
  CONFIRM_OPTION_SIZE,
  CONFIRM_TITLE_SIZE,
  CONFIRM_TITLE_Y,
} from '../config/layout';
import { STRINGS } from '../config/strings';
import type { CanvasSurface } from '../engine/CanvasSurface';
import type { InputSource } from '../engine/InputSource';
import { Key } from '../engine/Key';
import type { IScreen } from './IScreen';

export class ConfirmScreen implements IScreen {
  private selectedIndex = 0;

  constructor(
    private readonly title: string,
    private readonly body: string,
    private readonly options: readonly [string, string],
    private readonly onChoice: (primary: boolean) => void,
  ) {}

  enter(): void {
    this.selectedIndex = 0;
  }

  exit(): void {}

  handleInput(input: InputSource): void {
    if (input.wasPressed(Key.Left) || input.wasPressed(Key.Up)) {
      this.selectedIndex = 0;
    }
    if (input.wasPressed(Key.Right) || input.wasPressed(Key.Down)) {
      this.selectedIndex = 1;
    }
    if (input.wasPressed(Key.Confirm)) {
      this.onChoice(this.selectedIndex === 0);
      return;
    }
    if (input.wasPressed(Key.Cancel)) {
      this.onChoice(false);
    }
  }

  update(): void {}

  draw(surface: CanvasSurface): void {
    surface.clear(COLORS.court);

    const centerX = surface.width / 2;
    surface.text(this.title, centerX, CONFIRM_TITLE_Y, CONFIRM_TITLE_SIZE, COLORS.text, 'center');
    surface.text(this.body, centerX, CONFIRM_BODY_Y, CONFIRM_BODY_SIZE, COLORS.textDim, 'center');

    this.drawOption(
      surface,
      this.options[0],
      centerX - CONFIRM_BOX_WIDTH - CONFIRM_BOX_GAP / 2,
      CONFIRM_BOX_Y,
      this.selectedIndex === 0,
    );
    this.drawOption(
      surface,
      this.options[1],
      centerX + CONFIRM_BOX_GAP / 2,
      CONFIRM_BOX_Y,
      this.selectedIndex === 1,
    );

    surface.text(
      STRINGS.hint,
      centerX,
      CONFIRM_HINT_Y,
      CONFIRM_HINT_SIZE,
      COLORS.textDim,
      'center',
    );
  }

  private drawOption(
    surface: CanvasSurface,
    label: string,
    x: number,
    y: number,
    selected: boolean,
  ): void {
    if (selected) {
      surface.fillRect(x, y, CONFIRM_BOX_WIDTH, CONFIRM_BOX_HEIGHT, COLORS.accent);
    } else {
      surface.strokeRect(x, y, CONFIRM_BOX_WIDTH, CONFIRM_BOX_HEIGHT, COLORS.border);
    }

    surface.text(
      label,
      x + CONFIRM_BOX_WIDTH / 2,
      y + CONFIRM_BOX_HEIGHT / 2,
      CONFIRM_OPTION_SIZE,
      selected ? COLORS.court : COLORS.text,
      'center',
    );
  }
}
