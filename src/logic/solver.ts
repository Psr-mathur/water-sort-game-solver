import { Move, State } from '../types';

export function findSolution(initialState: State): Move[] {
  const state: State = JSON.parse(JSON.stringify(initialState));
  if (isSolved(state)) {
    return [];
  }

  const visited = new Set<string>();
  visited.add(serializeState(state));

  const queue: { state: State; path: Move[] }[] = [{ state, path: [] }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const moves = generateValidMoves(current.state);
    for (const move of moves) {
      const newState = applyMove(current.state, move.from, move.to);
      const serialized = serializeState(newState);
      if (!visited.has(serialized)) {
        visited.add(serialized);
        const newPath = [...current.path, move];
        if (isSolved(newState)) {
          return newPath;
        }
        queue.push({ state: newState, path: newPath });
      }
    }
  }

  throw new Error('No solution found for this configuration');
}

function generateValidMoves(state: State): Move[] {
  const moves: Move[] = [];
  const bottleCount = state.length;
  for (let from = 0; from < bottleCount; from++) {
    for (let to = 0; to < bottleCount; to++) {
      if (from !== to && isValidMove(state, from, to)) {
        moves.push({ from, to });
      }
    }
  }
  return moves;
}

function isValidMove(state: State, from: number, to: number): boolean {
  if (state[from].length === 0) return false;
  if (state[to].length === 0) return true;

  const fromTop = state[from][state[from].length - 1];
  const toTop = state[to][state[to].length - 1];
  if (fromTop !== toTop) return false;

  return getTransferAmount(state, from, to) > 0;
}

function getTransferAmount(state: State, from: number, to: number): number {
  const fromBottle = state[from];
  const toBottle = state[to];
  const color = fromBottle[fromBottle.length - 1];
  let count = 0;
  for (let i = fromBottle.length - 1; i >= 0; i--) {
    if (fromBottle[i] === color) count++;
    else break;
  }
  const availableSpace = 4 - toBottle.length;
  return Math.min(count, availableSpace);
}

function applyMove(state: State, from: number, to: number): State {
  const newState: State = JSON.parse(JSON.stringify(state));
  const transferAmount = getTransferAmount(newState, from, to);
  for (let i = 0; i < transferAmount; i++) {
    newState[to].push(newState[from].pop()!);
  }
  return newState;
}

function isSolved(state: State): boolean {
  return state.every((bottle) => {
    if (bottle.length === 0) return true;
    if (bottle.length !== 4) return false;
    return bottle.every((color) => color === bottle[0]);
  });
}

function serializeState(state: State): string {
  return JSON.stringify(state);
}