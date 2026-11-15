import { isSolvable } from "./puzzle";
export type Session = {
  version: 1;
  size: number;
  board: number[];
  moves: number;
  seconds: number;
  history: number[][];
  assisted?: boolean;
};
export function parseSession(raw: string | null): Session | null {
  try {
    if (!raw) return null;
    const s = JSON.parse(raw);
    const valid = (b: unknown): b is number[] =>
      Array.isArray(b) &&
      b.length === s.size * s.size &&
      new Set(b).size === b.length &&
      b.every((v) => Number.isInteger(v) && v >= 0 && v < b.length) &&
      isSolvable(b, s.size);
    if (
      s.version !== 1 ||
      ![3, 4, 5].includes(s.size) ||
      !valid(s.board) ||
      !Number.isSafeInteger(s.moves) ||
      s.moves < 0 ||
      !Number.isSafeInteger(s.seconds) ||
      s.seconds < 0
    )
      return null;
    return {
      ...s,
      assisted: !!s.assisted,
      history: Array.isArray(s.history)
        ? s.history.filter(valid).slice(-500)
        : [],
    };
  } catch {
    return null;
  }
}
export const SESSION_KEY = "taquin-lab:session";
