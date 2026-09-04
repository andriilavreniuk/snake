import type { Key } from './Key';

/** What screens are allowed to do with input: ask, never mutate. */
export interface InputSource {
  wasPressed(key: Key): boolean;
}
