export type Move = {
  from: number;
  to: number;
};

export type State = string[][];

export interface BottleState {
  colors: string[];
  capacity: number;
}

export type History = {
  data: BottleState[][];
  currIndex: number;
};