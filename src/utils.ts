import { BottleState, Move } from './types';

const DEPTH = 50;

export const COLORS = [
  "#FF0000", // Red
  "#87CEEB", // Sky Blue
  "#0000FF", // Blue
  "#4B0082", // Indigo
  "#008000", // Green
  "#00FF00", // Lime
  "#FFFF00", // Yellow
  "#FFA500", // Orange
  "#800080", // Purple
  "#FFC0CB", // Pink
  "#00FFFF", // Cyan
  "#A52A2A", // Brown
  "#808080", // Gray
  "#008080", // Teal
  "#800000", // Maroon
  "#FF1493", // Pink
  '#FF00FF', // Magenta
];

export async function generatePythonCode(bottleColors: string[][]) {
  const pythonCode = `
            from typing import List, Dict
            from collections import deque
  
            Color = str
            State = List[List[Color]]
            Move = Dict[str, int]
  
            initial_state: State = ${JSON.stringify(bottleColors)}
  
            def serialize_state(state: State) -> str:
                return str(state)
  
            def is_solved(state: State) -> bool:
                return all(len(bottle) == 0 or (len(bottle) == 4 and all(color == bottle[0] for color in bottle)) for bottle in state)
  
            def is_valid_move(state: State, from_idx: int, to_idx: int) -> bool:
                if from_idx == to_idx or not state[from_idx]:
                    return False
                if len(state[to_idx]) >= 4:
                    return False
                if not state[to_idx]:
                    return True
                return state[from_idx][-1] == state[to_idx][-1]
  
            def get_transfer_amount(state: State, from_idx: int, to_idx: int) -> int:
                if not is_valid_move(state, from_idx, to_idx):
                    return 0
                from_bottle = state[from_idx]
                to_bottle = state[to_idx]
                color = from_bottle[-1]
                count = 0
                for i in range(len(from_bottle) - 1, -1, -1):
                    if from_bottle[i] == color:
                        count += 1
                    else:
                        break
                available_space = 4 - len(to_bottle)
                return min(count, available_space)
  
            def apply_move(state: State, from_idx: int, to_idx: int) -> State:
                new_state = [list(bottle) for bottle in state]
                amount = get_transfer_amount(new_state, from_idx, to_idx)
                for _ in range(amount):
                    new_state[to_idx].append(new_state[from_idx].pop())
                return new_state
  
            def generate_valid_moves(state: State) -> List[Move]:
                moves = []
                for i in range(len(state)):
                    for j in range(len(state)):
                        if is_valid_move(state, i, j):
                            moves.append({'from': i, 'to': j})
                return moves
  
            def find_solution_dfs(initial_state: State, depth_limit=${DEPTH}) -> List[Move]:
                stack = deque()
                visited = set()
                stack.append((initial_state, []))
                visited.add(serialize_state(initial_state))
  
                while stack:
                    state, path = stack.pop()
                    if is_solved(state):
                        return path
                    if len(path) >= depth_limit:
                        continue
                    for move in generate_valid_moves(state):
                        new_state = apply_move(state, move['from'], move['to'])
                        key = serialize_state(new_state)
                        if key not in visited:
                            visited.add(key)
                            stack.append((new_state, path + [move]))
  
                return []
  
            solution = find_solution_dfs(initial_state, depth_limit=${DEPTH})
            solution
          `;
  return pythonCode
}

export async function generatePythonCodeWithLock(bottleColors: string[][]) {
  const pythonCode = `
      from typing import List, Dict
      from collections import deque

      Color = str
      State = List[List[Color]]
      Move = Dict[str, int]

      initial_state: State = ${JSON.stringify(bottleColors)}

      def serialize_state(state: State) -> str:
          return str(state)

      def is_solved(state: State) -> bool:
          return all(len(bottle) == 0 or (len(bottle) == 4 and all(color == bottle[0] for color in bottle)) for bottle in state)

      def is_locked(bottle: List[Color]) -> bool:
          return len(bottle) == 4 and all(color == bottle[0] for color in bottle)

      def is_valid_move(state: State, from_idx: int, to_idx: int) -> bool:
          if from_idx == to_idx or not state[from_idx]:
              return False
          if is_locked(state[from_idx]) or is_locked(state[to_idx]):
              return False
          if len(state[to_idx]) >= 4:
              return False
          if not state[to_idx]:
              return True
          return state[from_idx][-1] == state[to_idx][-1]

      def get_transfer_amount(state: State, from_idx: int, to_idx: int) -> int:
          if not is_valid_move(state, from_idx, to_idx):
              return 0
          from_bottle = state[from_idx]
          to_bottle = state[to_idx]
          color = from_bottle[-1]
          count = 0
          for i in range(len(from_bottle) - 1, -1, -1):
              if from_bottle[i] == color:
                  count += 1
              else:
                  break
          available_space = 4 - len(to_bottle)
          return min(count, available_space)

      def apply_move(state: State, from_idx: int, to_idx: int) -> State:
          new_state = [list(bottle) for bottle in state]
          amount = get_transfer_amount(new_state, from_idx, to_idx)
          for _ in range(amount):
              new_state[to_idx].append(new_state[from_idx].pop())
          return new_state

      def generate_valid_moves(state: State) -> List[Move]:
          moves = []
          for i in range(len(state)):
              if not state[i] or is_locked(state[i]):
                  continue
              for j in range(len(state)):
                  if i == j or is_locked(state[j]):
                      continue
                  if is_valid_move(state, i, j):
                      moves.append({'from': i, 'to': j})
          return moves

      def find_solution_dfs(initial_state: State, depth_limit=${DEPTH}) -> List[Move]:
          stack = deque()
          visited = set()
          stack.append((initial_state, []))
          visited.add(serialize_state(initial_state))

          while stack:
              state, path = stack.pop()
              if is_solved(state):
                  return path
              if len(path) >= depth_limit:
                  continue
              for move in generate_valid_moves(state):
                  new_state = apply_move(state, move['from'], move['to'])
                  key = serialize_state(new_state)
                  if key not in visited:
                      visited.add(key)
                      stack.append((new_state, path + [move]))

          return []

      solution = find_solution_dfs(initial_state, depth_limit=${DEPTH})
      solution
  `;
  return pythonCode;
}

export async function generatePythonCodeWithLockAndPartiallyLocked(bottleColors: string[][]) {
  const pythonCode = `
      from typing import List, Dict
      from collections import deque

      Color = str
      State = List[List[Color]]
      Move = Dict[str, int]

      initial_state: State = ${JSON.stringify(bottleColors)}

      def serialize_state(state: State) -> str:
          return str(state)

      def is_solved(state: State) -> bool:
          return all(len(bottle) == 0 or (len(bottle) == 4 and all(color == bottle[0] for color in bottle)) for bottle in state)

      def is_locked(bottle: List[Color]) -> bool:
          return len(bottle) == 4 and all(color == bottle[0] for color in bottle)

      def is_partially_locked(bottle: List[Color]) -> bool:
          return 0 < len(bottle) < 4 and all(color == bottle[0] for color in bottle)

      def is_valid_move(state: State, from_idx: int, to_idx: int) -> bool:
          if from_idx == to_idx or not state[from_idx]:
              return False
          if is_locked(state[from_idx]) or is_locked(state[to_idx]):
              return False
          if len(state[to_idx]) >= 4:
              return False
          if not state[to_idx]:
              return True
          return state[from_idx][-1] == state[to_idx][-1]

      def get_transfer_amount(state: State, from_idx: int, to_idx: int) -> int:
          if not is_valid_move(state, from_idx, to_idx):
              return 0
          from_bottle = state[from_idx]
          to_bottle = state[to_idx]
          color = from_bottle[-1]
          count = 0
          for i in range(len(from_bottle) - 1, -1, -1):
              if from_bottle[i] == color:
                  count += 1
              else:
                  break
          available_space = 4 - len(to_bottle)
          return min(count, available_space)

      def apply_move(state: State, from_idx: int, to_idx: int) -> State:
          new_state = [list(bottle) for bottle in state]
          amount = get_transfer_amount(new_state, from_idx, to_idx)
          for _ in range(amount):
              new_state[to_idx].append(new_state[from_idx].pop())
          return new_state

      def generate_valid_moves(state: State) -> List[Move]:
          moves = []
          for i in range(len(state)):
              if not state[i] or is_locked(state[i]):
                  continue  # Skip empty or locked bottles as source
              for j in range(len(state)):
                  if i == j or is_locked(state[j]):
                      continue  # Skip same or locked bottles as destination
                  if is_partially_locked(state[i]) and not state[j]:
                      continue  # Skip pouring from partially locked bottle into empty
                  if is_valid_move(state, i, j):
                      moves.append({'from': i, 'to': j})
          return moves

      def find_solution_dfs(initial_state: State, depth_limit=${DEPTH}) -> List[Move]:
          stack = deque()
          visited = set()
          stack.append((initial_state, []))
          visited.add(serialize_state(initial_state))

          while stack:
              state, path = stack.pop()
              if is_solved(state):
                  return path
              if len(path) >= depth_limit:
                  continue
              for move in generate_valid_moves(state):
                  new_state = apply_move(state, move['from'], move['to'])
                  key = serialize_state(new_state)
                  if key not in visited:
                      visited.add(key)
                      stack.append((new_state, path + [move]))

          return []

      solution = find_solution_dfs(initial_state, depth_limit=${DEPTH})
      solution
  `;
  return pythonCode;
}



/* eslint-disable @typescript-eslint/no-explicit-any */
export async function convertToJsObjects(pyData: any): Promise<Move[]> {
  return pyData.map((entry: [string, number][]) => {
    const obj: { [key: string]: number } = {};
    entry.forEach(([key, value]) => {
      obj[key] = value;
    });
    return obj as Move;
  });
}

export const INIT_BOTTLE_STATE: BottleState[] = [
  {
    colors: ['blue', 'yellow', 'green', 'green'],
    capacity: 4
  },
  {
    colors: ['pink', 'cyan', '#bdd', 'pink'],
    capacity: 4
  },
  {
    colors: ['hotPink', 'orange', 'red', 'gray',],
    capacity: 4
  },
  {
    colors: ['orange', 'red', 'orange', 'yellow'],
    capacity: 4
  },
  {
    colors: ['purple', 'green', 'purple', 'purple'],
    capacity: 4
  },
  {
    colors: ['hotPink', 'purple', '#bdd', '#bdd'],
    capacity: 4
  },
  {
    colors: ['orange', 'blue', 'blue', 'yellow'],
    capacity: 4
  },
  {
    colors: ['pink', 'yellow', 'gray', 'gray'],
    capacity: 4
  },
  {
    colors: ['red', 'red', '#bdd', 'cyan'],
    capacity: 4
  },
  {
    colors: ['green', 'pink', 'cyan', 'gray'],
    capacity: 4
  },
  {
    colors: ['cyan', 'hotPink', 'hotPink', 'blue'],
    capacity: 4
  },
  {
    colors: [],
    capacity: 4
  },
  {
    colors: [],
    capacity: 4
  },
]


export const INIT_SOLUTION: Move[] = [
  { 'from': 10, 'to': 12 },
  { 'from': 9, 'to': 11 },
  { 'from': 8, 'to': 9 },
  { 'from': 7, 'to': 11 },
  { 'from': 6, 'to': 7 },
  { 'from': 12, 'to': 6 },
  { 'from': 11, 'to': 12 },
  { 'from': 10, 'to': 11 },
  { 'from': 9, 'to': 10 },
  { 'from': 5, 'to': 8 },
  { 'from': 3, 'to': 7 },
  { 'from': 2, 'to': 12 },
  { 'from': 8, 'to': 5 },
  { 'from': 1, 'to': 9 },
  { 'from': 8, 'to': 1 },
  { 'from': 2, 'to': 8 },
  { 'from': 3, 'to': 2 },
  { 'from': 3, 'to': 8 },
  { 'from': 3, 'to': 2 },
  { 'from': 12, 'to': 3 },
  { 'from': 11, 'to': 12 },
  { 'from': 10, 'to': 11 },
  { 'from': 12, 'to': 10 },
  { 'from': 11, 'to': 12 },
  { 'from': 8, 'to': 11 },
  { 'from': 12, 'to': 8 },
  { 'from': 11, 'to': 12 },
  { 'from': 10, 'to': 11 },
  { 'from': 12, 'to': 10 },
  { 'from': 11, 'to': 12 },
  { 'from': 7, 'to': 11 },
  { 'from': 9, 'to': 7 },
  { 'from': 0, 'to': 9 },
  { 'from': 0, 'to': 11 },
  { 'from': 6, 'to': 0 },
  { 'from': 2, 'to': 6 },
  { 'from': 12, 'to': 2 },
  { 'from': 11, 'to': 12 },
  { 'from': 10, 'to': 11 },
  { 'from': 12, 'to': 10 },
  { 'from': 9, 'to': 12 },
  { 'from': 5, 'to': 9 },
  { 'from': 4, 'to': 5 },
  { 'from': 4, 'to': 12 },
  { 'from': 5, 'to': 4 },
  { 'from': 5, 'to': 2 },
  { 'from': 1, 'to': 5 },
  { 'from': 1, 'to': 8 },
  { 'from': 7, 'to': 1 },
  { 'from': 9, 'to': 5 }
];