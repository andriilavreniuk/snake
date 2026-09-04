import { AdOutcome } from './AdOutcome';
import type { IAdPlayer } from './IAdPlayer';

export class ImaAdPlayer implements IAdPlayer {
  private loader: google.ima.AdsLoader | null = null;
  private manager: google.ima.AdsManager | null = null;
  private timer = 0;
  private disposed = false;
  private finish: ((outcome: AdOutcome) => void) | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly video: HTMLVideoElement,
    private readonly adTagUrl: string,
    private readonly loadTimeoutMs: number,
    private readonly width: number,
    private readonly height: number,
  ) {}

  unlock(): void {
    if (this.disposed || this.loader !== null) {
      return;
    }

    if (typeof google === 'undefined' || google.ima === undefined) {
      console.warn('ad: IMA SDK did not load');
      return;
    }

    const displayContainer = new google.ima.AdDisplayContainer(this.container, this.video);
    displayContainer.initialize();

    const loader = new google.ima.AdsLoader(displayContainer);

    loader.addEventListener<google.ima.AdsManagerLoadedEvent>(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      (event) => this.startAd(event),
    );

    loader.addEventListener<google.ima.AdErrorEvent>(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      (event) => {
        this.fail(`request failed: ${event.getError().toString()}`);
      },
    );

    this.loader = loader;

    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  play(): Promise<AdOutcome> {
    const loader = this.loader;

    if (this.disposed || loader === null) {
      console.warn('ad: player was never unlocked');
      return Promise.resolve(AdOutcome.Failed);
    }

    return new Promise<AdOutcome>((resolve) => {
      // Reset the loader for a new request. Called before finish is set so
      // leftover events from the previous ad are ignored by settle().
      loader.contentComplete();

      this.finish = resolve;

      // Covers an empty VAST response or a blocked request. Cleared once the
      // manager loads, so it never cuts a playing ad short.
      this.timer = window.setTimeout(() => {
        this.fail(`no response within ${this.loadTimeoutMs}ms`);
      }, this.loadTimeoutMs);

      this.container.style.visibility = 'visible';

      const request = new google.ima.AdsRequest();
      request.adTagUrl = this.adTagUrl;
      request.linearAdSlotWidth = this.width;
      request.linearAdSlotHeight = this.height;
      loader.requestAds(request);
    });
  }

  stop(): void {
    this.settle(AdOutcome.Failed);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.stop();

    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    if (this.loader !== null) {
      this.loader.destroy();
      this.loader = null;
    }
  }

  private startAd(event: google.ima.AdsManagerLoadedEvent): void {
    if (this.disposed) {
      try {
        event.getAdsManager(this.video).destroy();
      } catch (error) {
        console.warn('ad: discarding manager after dispose failed', error);
      }
      return;
    }

    window.clearTimeout(this.timer);
    this.destroyManager();

    const manager = event.getAdsManager(this.video);
    this.manager = manager;

    manager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () =>
      this.settle(AdOutcome.Completed),
    );
    manager.addEventListener(google.ima.AdEvent.Type.SKIPPED, () => this.settle(AdOutcome.Skipped));
    manager.addEventListener<google.ima.AdErrorEvent>(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      (adError) => {
        this.fail(`playback failed: ${adError.getError().toString()}`);
      },
    );

    try {
      manager.init(this.width, this.height, google.ima.ViewMode.NORMAL);
      manager.start();
    } catch (error) {
      this.fail(`could not start: ${String(error)}`);
    }
  }

  private readonly onVisibilityChange = (): void => {
    const manager = this.manager;

    if (manager === null) {
      return;
    }

    if (document.hidden) {
      manager.pause();
    } else {
      manager.resume();
    }
  };

  // Every failure keeps its cause here, in the only file that speaks IMA. The
  // dialog copy stays generic; without this the causes are indistinguishable.
  private fail(reason: string): void {
    if (this.finish !== null) {
      console.warn(`ad: ${reason}`);
    }

    this.settle(AdOutcome.Failed);
  }

  private settle(outcome: AdOutcome): void {
    const finish = this.finish;

    if (finish === null) {
      return;
    }

    this.finish = null;

    window.clearTimeout(this.timer);
    this.destroyManager();
    this.container.style.visibility = 'hidden';
    finish(outcome);
  }

  private destroyManager(): void {
    if (this.manager !== null) {
      this.manager.destroy();
      this.manager = null;
    }
  }
}
