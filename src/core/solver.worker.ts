import { solve, type Algorithm } from "./puzzle";
self.onmessage = (
  event: MessageEvent<{
    board: number[];
    size: number;
    algorithms: Algorithm[];
  }>,
) => {
  const { board, size, algorithms } = event.data;
  try {
    for (const algorithm of algorithms)
      self.postMessage({ result: solve(board, size, algorithm) });
    self.postMessage({ done: true });
  } catch {
    self.postMessage({ error: "Le calcul a échoué. Vous pouvez réessayer." });
  }
};
