import { ImaAdPlayer } from './ads/ImaAdPlayer';
import { App } from './app/App';
import { PlayScreen } from './app/PlayScreen';
import { AD_TAG, AD_TIMEOUT_MS } from './config/ads';
import { START_LEN } from './config/game';
import { COLS, ROWS, STAGE_HEIGHT, STAGE_WIDTH } from './config/layout';
import { CanvasSurface } from './engine/CanvasSurface';
import { GameLoop } from './engine/GameLoop';
import { Keyboard } from './engine/Keyboard';
import { SnakeGame } from './game/SnakeGame';

const canvas = requireElement('game', HTMLCanvasElement);
const stage = requireElement('stage', HTMLElement);
const adContainer = requireElement('ad-container', HTMLElement);
const adVideo = requireElement('ad-content-video', HTMLVideoElement);

stage.style.width = `${STAGE_WIDTH}px`;
stage.style.height = `${STAGE_HEIGHT}px`;
canvas.width = STAGE_WIDTH;
canvas.height = STAGE_HEIGHT;

const surface = new CanvasSurface(canvas);
const keyboard = new Keyboard();
keyboard.attach();

const adPlayer = new ImaAdPlayer(
  adContainer,
  adVideo,
  AD_TAG,
  AD_TIMEOUT_MS,
  STAGE_WIDTH,
  STAGE_HEIGHT,
);

// Input is polled in the loop, which is outside the browser's user-activation
// window, so IMA has to be unlocked from the first real keydown.
keyboard.onFirstKeyDown(() => adPlayer.unlock());

const app = new App(
  surface,
  keyboard,
  adPlayer,
  (onGameOver) => new PlayScreen(new SnakeGame(COLS, ROWS, START_LEN), onGameOver),
  (url) => window.location.assign(url),
);

const loop = new GameLoop(app);
app.start();
loop.start();
surface.focus();

function reclaimInput(): void {
  keyboard.attach();
  loop.start();
  surface.focus();
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    reclaimInput();
  }
});

window.addEventListener('pageshow', () => {
  reclaimInput();
});

window.addEventListener('pagehide', (event) => {
  if (event.persisted) {
    return;
  }
  loop.stop();
  keyboard.detach();
  adPlayer.dispose();
});

function requireElement<T extends HTMLElement>(id: string, type: { new (): T }): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) {
    throw new Error(`missing #${id}`);
  }
  return element;
}
