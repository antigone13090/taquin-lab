import { describe, it, expect } from "vitest";
import {
  goal,
  move,
  neighbors,
  shuffle,
  isSolvable,
  manhattan,
  solve,
  isSolved,
  wellPlacedTrace,
} from "./puzzle";
describe("moteur du taquin", () => {
  it("interdit les diagonales et les passages entre lignes sans mutation", () => {
    const b = goal(3);
    expect(move(b, 3, 6)).toBeNull();
    expect(move(b, 3, 4)).toBeNull();
    expect(move(b, 3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7, 0, 8]);
    expect(b).toEqual(goal(3));
    expect(neighbors([1, 2, 0, 4, 5, 3, 7, 8, 6], 3)).toHaveLength(2);
  });
  for (const n of [3, 4, 5])
    it(`mélange soluble ${n}×${n}`, () => {
      for (let i = 0; i < 20; i++) {
        const b = shuffle(n, 30);
        expect(isSolvable(b, n)).toBe(true);
        expect(new Set(b).size).toBe(n * n);
        expect(isSolved(b)).toBe(false);
      }
    });
  it("rejette une permutation impossible pour tailles paires et impaires", () => {
    for (const n of [3, 4, 5]) {
      const b = goal(n);
      [b[0], b[1]] = [b[1], b[0]];
      expect(isSolvable(b, n)).toBe(false);
    }
  });
  it("mesure Manhattan sans compter le vide", () =>
    expect(manhattan([1, 2, 3, 4, 5, 6, 0, 7, 8], 3)).toBe(2));
  for (const algorithm of ["BFS", "A*", "IDA*"] as const)
    it(`${algorithm} trouve une solution optimale légale`, () => {
      let b = [1, 2, 3, 4, 0, 6, 7, 5, 8];
      const r = solve(b, 3, algorithm);
      expect(r.status).toBe("solved");
      expect(r.path).toHaveLength(2);
      for (const p of r.path) b = move(b, 3, p)!;
      expect(isSolved(b)).toBe(true);
    });
  it("respecte les budgets et explique les refus", () => {
    expect(solve(shuffle(4, 12), 4, "BFS").status).toBe("unsupported");
    expect(solve([2, 1, 3, 4, 5, 6, 7, 8, 0], 3, "A*").status).toBe(
      "unsolvable",
    );
    expect(
      solve([1, 2, 3, 4, 0, 6, 7, 5, 8], 3, "A*", { maxNodes: 0 }).status,
    ).toBe("limit");
    expect(solve(goal(3), 3, "IDA*").path).toEqual([]);
  });
  it("trace les appels et les retours du PDF", () => {
    const trace = wellPlacedTrace([1, 2, 3, 4, 0, 6, 7, 5, 8], 5);
    expect(trace.filter((e) => e.type === "call").map((e) => e.index)).toEqual([
      5, 6, 7, 8, 9,
    ]);
    expect(trace.at(-1)?.value).toBe(2);
  });
});

describe("résolution sur les grandes grilles et budgets", () => {
  for (const n of [4, 5]) {
    for (const algorithm of ["A*", "IDA*"] as const) {
      it(`${algorithm} résout réellement une grille ${n} × ${n}`, () => {
        let board = goal(n);
        for (const index of [
          n * n - 2,
          n * n - n - 2,
          n * n - n - 3,
          n * n - 2 * n - 3,
        ])
          board = move(board, n, index)!;
        const result = solve(board, n, algorithm);
        expect(result.status).toBe("solved");
        expect(result.path).toHaveLength(4);
        for (const index of result.path) board = move(board, n, index)!;
        expect(board).toEqual(goal(n));
      });
    }
  }
  for (const algorithm of ["BFS", "A*", "IDA*"] as const) {
    it(`${algorithm} respecte une limite de temps nulle`, () => {
      expect(
        solve([1, 2, 3, 4, 0, 6, 7, 5, 8], 3, algorithm, { maxMs: -1 }).status,
      ).toBe("limit");
    });
  }
  it("les trois algorithmes retrouvent le même optimum sur plusieurs chemins", () => {
    let board = goal(3);
    for (const index of [7, 4, 3, 0, 1, 4, 7, 8]) {
      board = move(board, 3, index)!;
      const results = (["BFS", "A*", "IDA*"] as const).map((a) =>
        solve(board, 3, a),
      );
      expect(results.every((r) => r.status === "solved")).toBe(true);
      expect(new Set(results.map((r) => r.path.length)).size).toBe(1);
    }
  });
});
