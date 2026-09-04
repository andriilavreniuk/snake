declare namespace google.ima {
  interface AdEvent {
    type: string;
  }

  interface AdErrorEvent {
    getError(): { toString(): string };
  }

  interface AdsManagerLoadedEvent {
    getAdsManager(contentVideo: HTMLVideoElement): AdsManager;
  }

  interface AdsManager {
    init(width: number, height: number, viewMode: string): void;
    start(): void;
    pause(): void;
    resume(): void;
    destroy(): void;
    addEventListener<E>(type: string, listener: (event: E) => void): void;
  }

  const AdEvent: { Type: { STARTED: string; ALL_ADS_COMPLETED: string; SKIPPED: string } };
  const AdErrorEvent: { Type: { AD_ERROR: string } };
  const AdsManagerLoadedEvent: { Type: { ADS_MANAGER_LOADED: string } };
  const ViewMode: { NORMAL: string };

  class AdDisplayContainer {
    constructor(container: HTMLElement, contentVideo: HTMLVideoElement);
    initialize(): void;
  }

  class AdsRequest {
    adTagUrl: string;
    linearAdSlotWidth: number;
    linearAdSlotHeight: number;
  }

  class AdsLoader {
    constructor(container: AdDisplayContainer);
    addEventListener<E>(type: string, listener: (event: E) => void): void;
    requestAds(request: AdsRequest): void;
    contentComplete(): void;
    destroy(): void;
  }
}
