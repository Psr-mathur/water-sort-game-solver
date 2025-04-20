import React, { useState } from 'react';
import { findSolution } from './logic/solver';
import { BottleState, Move } from './types';
import ColorPicker from './components/color-picker';
import Bottle from './components/bottle';
import SolutionSteps from './components/solution-steps';

const COLORS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#A52A2A',
  '#808080', '#008000', '#000080', '#800080', // Existing colors
  '#9370DB', // Purple (Medium Purple)
  '#87CEEB', // Sky Blue
  '#FF1493', // Deep Pink
  '#FFD700', // Gold
  '#7CFC00', // Lawn Green
  '#4682B4', // Steel Blue
  '#DC143C', // Crimson
];

const App: React.FC = () => {
  const [bottleCount, setBottleCount] = useState<number>(5);
  const [bottles, setBottles] = useState<BottleState[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [solution, setSolution] = useState<Move[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const setupBottles = () => {
    const initialBottles: BottleState[] = Array.from({ length: bottleCount }, () => ({
      colors: [],
      capacity: 4
    }));
    setBottles(initialBottles);
    setSolution([]);
    setCurrentStep(0);
    setError('');
  };

  const reset = () => setupBottles();

  const handleBottleClick = (index: number) => {
    if (!selectedColor) return;
    setBottles(prev => {
      if (prev[index].colors.length >= prev[index].capacity) return prev;
      return prev.map((b, i) =>
        i === index ? { ...b, colors: [...b.colors, selectedColor] } : b
      );
    });
  };

  const solvePuzzle = () => {
    setError('');
    try {
      const bottleColorsOnly = bottles.map(b => b.colors);
      const sol = findSolution(bottleColorsOnly);
      setSolution(sol);
      setCurrentStep(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.message);
    }
  };

  const nextAutoSolveStep = () => {
    if (currentStep < solution.length) {
      const move = solution[currentStep];
      setBottles(prev => {
        const newState: BottleState[] = JSON.parse(JSON.stringify(prev));
        const { from, to } = move;
        const fromBottle = newState[from];
        const toBottle = newState[to];
        const color = fromBottle.colors[fromBottle.colors.length - 1];
        let count = 0;

        for (let i = fromBottle.colors.length - 1; i >= 0; i--) {
          if (fromBottle.colors[i] === color) count++;
          else break;
        }

        const availableSpace = toBottle.capacity - toBottle.colors.length;
        const transferAmount = Math.min(count, availableSpace);

        for (let i = 0; i < transferAmount; i++) {
          toBottle.colors.push(fromBottle.colors.pop()!);
        }

        return newState;
      });
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div>
      <h1>Water Sort Puzzle Solver</h1>
      <div className="controls">
        <div>
          <label htmlFor="bottle-count">Number of Bottles:</label>
          <input
            type="number"
            id="bottle-count"
            min={3}
            max={12}
            value={bottleCount}
            onChange={e => setBottleCount(Number(e.target.value))}
          />
          <button className="move-btn" onClick={setupBottles}>Setup Bottles</button>
        </div>
        <ColorPicker colors={COLORS} selectedColor={selectedColor} onSelect={setSelectedColor} />
        <div>
          <p>Click a bottle, then click a color to fill from bottom up</p>
          <div id="bottles-container">
            {bottles.map((bottle, index) => (
              <Bottle key={index} index={index} colors={bottle.colors} onClick={handleBottleClick} />
            ))}
          </div>
        </div>
        <button className="move-btn" onClick={solvePuzzle}>Solve Puzzle</button>
        <button className="move-btn" onClick={reset}>Reset</button>
        <button
          className="move-btn"
          onClick={nextAutoSolveStep}
          disabled={currentStep >= solution.length}
        >
          Auto Solve Step-by-Step
        </button>
        {error && <div className="error">{error}</div>}
      </div>
      <div className="solution">
        <h2>Solution Steps</h2>
        <div id="steps-container">
          <SolutionSteps steps={solution} />
        </div>
      </div>
    </div>
  );
};

export default App;
