import { describe, it, expect } from "vitest";
import { findSolution } from "../src/logic/solver";
import { Move, State } from '../src/types';

describe("findSolution", () => {

  it("should return empty array when initial state is already solved", () => {
    const solvedState: string[][] = [
      ["red", "red", "red", "red"],
      ["blue", "blue", "blue", "blue"],
      ["green", "green", "green", "green"],
      []
    ];

    const result = findSolution(solvedState);

    expect(result).toEqual([]);
  });

  it("should throw error when no solution exists", () => {
    const unsolvableState: string[][] = [
      ["red", "blue", "red", "blue"],
      ["green", "red", "green", "red"],
      ["blue", "green", "purple", "green"],
      []
    ];

    expect(() => {
      findSolution(unsolvableState);
    }).toThrow("No solution found for this configuration");
  });

  it("should return correct moves for a simple solvable puzzle", () => {
    const initialState: string[][] = [
      ["red", "red", "red", "red"],
      [],
      []
    ];

    const expectedMoves: Move[] = [];

    const result = findSolution(initialState);

    expect(result).toEqual(expectedMoves);
  });

  it('should find the optimal solution for a complex puzzle', () => {
    const initialState: State = [
      ['red', 'blue', 'red', 'blue'],
      ['blue', 'red', 'blue', 'red'],
      []
    ];
    const expectedMoves: Move[] = [
      { from: 0, to: 2 },
      { from: 1, to: 0 },
      { from: 1, to: 2 },
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 0 },
      { from: 1, to: 2 },
    ];
    const result = findSolution(initialState);
    expect(result).toEqual(expectedMoves);
  });

  it('should handle puzzles with multiple bottles of the same color', () => {
    const initialState: State = [
      ['red', 'red', 'red', 'red'],
      ['blue', 'blue', 'blue', 'blue'],
      []
    ];
    const expectedMoves: Move[] = [];
    const result = findSolution(initialState);
    expect(result).toEqual(expectedMoves);
  })

  it('should throw an error when processing partially filled bottles', () => {
    const initialState: State = [
      ['red', 'blue', 'blue'],
      ['blue', 'blue', 'red', 'red'],
      []
    ];
    expect(() => {
      findSolution(initialState);
    }).toThrow("No solution found for this configuration");
  });

  it('should return empty array when initial state is empty', () => {
    const initialState: State = [];
    const expectedMoves: Move[] = [];
    const result = findSolution(initialState);
    expect(result).toEqual(expectedMoves);
  });

  it('should return empty array when all bottles are empty', () => {
    const initialState: State = [[], [], []];
    const result = findSolution(initialState);
    expect(result).toEqual([]);
  });

  it('should return empty array when state has only one bottle', () => {
    const initialState: State = [['red', 'red', 'red', 'red']];
    const result = findSolution(initialState);
    expect(result).toEqual([]);
  });

  it('should solve large puzzle efficiently', () => {
    const initialState: State = Array.from({ length: 20 }, (_, i) => Array(4).fill(`color${i}`));
    initialState.push(['red', 'red', 'blue', 'blue'],
      ['blue', 'blue', 'red', 'red'], [], []);
    const result = findSolution(initialState);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should find solution for puzzles with maximum possible moves', () => {
    const initialState: State = [
      ['red', 'blue', 'green', 'yellow'],
      ['yellow', 'green', 'blue', 'red'],
      ['blue', 'red', 'yellow', 'green'],
      ['green', 'yellow', 'red', 'blue'],
      []
    ];
    const result = findSolution(initialState);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should correctly apply moves that transfer multiple units of the same color', () => {
    const initialState: State = [
      ['red', 'red'],
      ['red', 'red'],
      [],
      []
    ];
    const result = findSolution(initialState);
    expect(result).toEqual([{ from: 0, to: 1 }]);
  });

});