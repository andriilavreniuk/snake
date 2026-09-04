import type { AdOutcome } from './AdOutcome';

export interface IAdPlayer {
  play(): Promise<AdOutcome>;
  stop(): void;
}
