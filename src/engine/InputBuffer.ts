import type { InputSource } from './InputSource';

/**
 * The owner's view of input. Clearing edges belongs to whoever drives the
 * frame, because screen transitions depend on when it happens.
 */
export interface InputBuffer extends InputSource {
  clearEdges(): void;
}
