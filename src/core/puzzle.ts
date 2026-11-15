export type Algorithm = "BFS" | "A*" | "IDA*";
export type SearchResult = {
  algorithm: Algorithm;
  status: "solved" | "limit" | "unsolvable" | "unsupported";
  path: number[];
  expanded: number;
  frontier: number;
  duration: number;
};
export const goal = (n: number) =>
  Array.from({ length: n * n }, (_, i) => (i + 1) % (n * n));
export const isSolved = (b: number[]) =>
  b.every((v, i) => v === (i + 1) % b.length);
export function move(b: number[], n: number, index: number): number[] | null {
  const z = b.indexOf(0);
  if (
    index < 0 ||
    index >= b.length ||
    Math.abs(Math.floor(index / n) - Math.floor(z / n)) +
      Math.abs((index % n) - (z % n)) !==
      1
  )
    return null;
  const c = [...b];
  [c[z], c[index]] = [c[index], c[z]];
  return c;
}
export function neighbors(b: number[], n: number) {
  const z = b.indexOf(0);
  return [z - n, z + n, z - 1, z + 1]
    .map((i) => ({ index: i, board: move(b, n, i) }))
    .filter((x): x is { index: number; board: number[] } => x.board !== null);
}
export function shuffle(n: number, steps = 30): number[] {
  let b = goal(n),
    previous = -1;
  for (let s = 0; s < steps; s++) {
    const next = neighbors(b, n).filter((v) => v.index !== previous);
    const pick = next[Math.floor(Math.random() * next.length)];
    previous = b.indexOf(0);
    b = pick.board;
  }
  return isSolved(b) ? shuffle(n, steps + 1) : b;
}
export function isSolvable(b: number[], n: number) {
  let inv = 0;
  for (let i = 0; i < b.length; i++)
    for (let j = i + 1; j < b.length; j++)
      if (b[i] && b[j] && b[i] > b[j]) inv++;
  return n % 2 === 1
    ? inv % 2 === 0
    : (inv + n - Math.floor(b.indexOf(0) / n)) % 2 === 1;
}
export function manhattan(b: number[], n: number) {
  return b.reduce(
    (s, v, i) =>
      v
        ? s +
          Math.abs(Math.floor(i / n) - Math.floor((v - 1) / n)) +
          Math.abs((i % n) - ((v - 1) % n))
        : s,
    0,
  );
}
export function wellPlacedTrace(b: number[], start = 0) {
  const events: {
    type: "call" | "return";
    index: number;
    value?: number;
    stack: number[];
  }[] = [];
  const stack: number[] = [];
  function count(i: number): number {
    stack.push(i);
    events.push({ type: "call", index: i, stack: [...stack] });
    const v =
      i === b.length
        ? 0
        : Number(b[i] !== 0 && b[i] === (i + 1) % b.length) + count(i + 1);
    events.push({ type: "return", index: i, value: v, stack: [...stack] });
    stack.pop();
    return v;
  }
  count(start);
  return events;
}
type Node = { b: number[]; g: number; f: number; parent?: Node; index: number };
class Heap {
  items: Node[] = [];
  push(v: Node) {
    let i = this.items.push(v) - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.items[p].f <= v.f) break;
      this.items[i] = this.items[p];
      i = p;
    }
    this.items[i] = v;
  }
  pop() {
    const first = this.items[0],
      last = this.items.pop()!;
    if (this.items.length) {
      let i = 0;
      while (i * 2 + 1 < this.items.length) {
        let c = i * 2 + 1;
        if (c + 1 < this.items.length && this.items[c + 1].f < this.items[c].f)
          c++;
        if (this.items[c].f >= last.f) break;
        this.items[i] = this.items[c];
        i = c;
      }
      this.items[i] = last;
    }
    return first;
  }
}
export function solve(
  b: number[],
  n: number,
  algorithm: Algorithm,
  options: { maxNodes?: number; maxMs?: number } = {},
): SearchResult {
  const begin = performance.now(),
    maxNodes = options.maxNodes ?? 250000,
    maxMs = options.maxMs ?? 6000;
  let expanded = 0,
    frontier = 1;
  const result = (
    status: SearchResult["status"],
    path: number[] = [],
  ): SearchResult => ({
    algorithm,
    status,
    path,
    expanded,
    frontier,
    duration: performance.now() - begin,
  });
  if (!isSolvable(b, n)) return result("unsolvable");
  if (isSolved(b)) return result("solved");
  if (algorithm === "BFS" && n !== 3) return result("unsupported");
  const over = () => expanded >= maxNodes || performance.now() - begin > maxMs;
  if (algorithm === "IDA*") {
    let threshold = manhattan(b, n);
    const path: number[] = [],
      seen = new Set([b.join(",")]);
    let found = false,
      limited = false;
    function visit(
      board: number[],
      g: number,
      bound: number,
      previous: number,
    ): number {
      if (over()) {
        limited = true;
        return Infinity;
      }
      const f = g + manhattan(board, n);
      if (f > bound) return f;
      if (isSolved(board)) {
        found = true;
        return g;
      }
      expanded++;
      let min = Infinity;
      for (const child of neighbors(board, n).sort(
        (a, c) => manhattan(a.board, n) - manhattan(c.board, n),
      )) {
        if (child.index === previous) continue;
        const key = child.board.join(",");
        if (seen.has(key)) continue;
        seen.add(key);
        path.push(child.index);
        frontier = Math.max(frontier, path.length + 1);
        const t = visit(child.board, g + 1, bound, board.indexOf(0));
        if (found || limited) return t;
        path.pop();
        seen.delete(key);
        min = Math.min(min, t);
      }
      return min;
    }
    while (!over()) {
      const next = visit(b, 0, threshold, -1);
      if (found) return result("solved", [...path]);
      if (limited || next === Infinity) break;
      threshold = next;
    }
    return result("limit");
  }
  const root: Node = { b: [...b], g: 0, f: manhattan(b, n), index: -1 };
  const heap = new Heap();
  heap.push(root);
  const queue: Node[] = [root];
  let head = 0;
  const best = new Map([[b.join(","), 0]]);
  while (algorithm === "BFS" ? head < queue.length : heap.items.length) {
    if (over()) return result("limit");
    const cur = algorithm === "BFS" ? queue[head++] : heap.pop();
    if (cur.g !== best.get(cur.b.join(","))) continue;
    if (isSolved(cur.b)) {
      const p: number[] = [];
      for (let c = cur; c.parent; c = c.parent) p.push(c.index);
      return result("solved", p.reverse());
    }
    expanded++;
    for (const v of neighbors(cur.b, n)) {
      const key = v.board.join(","),
        g = cur.g + 1;
      if ((best.get(key) ?? Infinity) <= g) continue;
      best.set(key, g);
      const child: Node = {
        b: v.board,
        g,
        f: g + manhattan(v.board, n),
        parent: cur,
        index: v.index,
      };
      if (algorithm === "BFS") queue.push(child);
      else heap.push(child);
    }
    frontier = Math.max(
      frontier,
      algorithm === "BFS" ? queue.length - head : heap.items.length,
    );
  }
  return result("unsolvable");
}
