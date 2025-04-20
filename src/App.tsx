import React, { useState } from 'react';
import { findSolution } from './logic/solver';
import { BottleState, History, Move } from './types';
import ColorPicker from './components/color-picker';
import Bottle from './components/bottle';
import SolutionSteps from './components/solution-steps';

const COLORS = [
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

const App: React.FC = () => {
  const [bottleCount, setBottleCount] = useState<number>(5);
  const [bottles, setBottles] = useState<BottleState[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [history, setHistory] = useState<History>({
    data: [bottles],
    currIndex: 0
  });
  const [solution, setSolution] = useState<Move[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const setupBottles = () => {
    const initialBottles: BottleState[] = Array.from({ length: bottleCount }, () => ({
      colors: [],
      capacity: 4
    }));
    setBottles(initialBottles);
    setHistory({
      data: [structuredClone(initialBottles)],
      currIndex: 0
    });
    setSolution([]);
    setCurrentStep(0);
    setError('');
  };

  const reset = () => setupBottles();

  const handleBottleClick = (index: number) => {
    if (!selectedColor) {
      setError('Please select a color first!');
      return;
    };
    if (bottles[index].colors.length >= bottles[index].capacity) {
      setError('This bottle is already full!');
      return;
    }
    const newBottles = bottles.map((b, i) => {
      if (i === index) {
        return { ...b, colors: [...b.colors, selectedColor] };
      }
      return b;
    });
    setBottles(newBottles);
    setHistory(prev => {
      const newHistoryData = [...prev.data.slice(0, prev.currIndex + 1), newBottles];
      return { ...prev, data: newHistoryData, currIndex: newHistoryData.length - 1 };
    });
    setError('');
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

  const handleUndo = () => {
    if (history.currIndex > 0) {
      setBottles(history.data[history.currIndex - 1]);
      setHistory(prev => ({ ...prev, currIndex: prev.currIndex - 1 }));
    }
  };

  const handleRedo = () => {
    if (history.currIndex < history.data.length - 1) {
      setBottles(history.data[history.currIndex + 1]);
      setHistory(prev => ({ ...prev, currIndex: prev.currIndex + 1 }));
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
        {/** UNDO REDO */}
        <div className="undo-redo">
          <button
            className="move-btn"
            onClick={handleUndo}
            disabled={history.currIndex === 0}
          >
            Undo
          </button>
          <button
            className="move-btn"
            onClick={handleRedo}
            disabled={history.currIndex >= history.data.length - 1}
          >
            Redo
          </button>
        </div>
        <ColorPicker colors={COLORS} selectedColor={selectedColor} onSelect={setSelectedColor} />
        <div>
          <p>Click a Color, then click a Bottle to fill from bottom up</p>
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
