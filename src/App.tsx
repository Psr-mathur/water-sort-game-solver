
import React, { useEffect, useState } from 'react';
import { BottleState, History, Move } from './types';
import ColorPicker from './components/color-picker';
import Bottle from './components/bottle';
import SolutionSteps from './components/solution-steps';
import { loadPyodide, PyodideInterface } from 'pyodide';
import { COLORS, convertToJsObjects, generatePythonCodeWithLockAndPartiallyLocked } from './utils';


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
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [pyodide, setPyodide] = useState<PyodideInterface>();

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

  const loadPyodideAndRun = async () => {
    const pyodideInstance = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/"
    });
    setPyodide(pyodideInstance);
  };

  useEffect(() => {
    loadPyodideAndRun();
  }, []);

  const solvePuzzle = async () => {
    if (!pyodide) return alert('Please load Pyodide first!');
    setError('');
    setIsSolving(true);
    setTimeout(async () => {
      try {
        const bottleColorsOnly = bottles.map(b => b.colors);
        const pythonCode = await generatePythonCodeWithLockAndPartiallyLocked(bottleColorsOnly);
        const result = await pyodide.runPythonAsync(pythonCode);
        const converted = result.toJs({ dict_converter: Object });
        const moves = await convertToJsObjects(converted);
        result.destroy();
        setSolution(moves);
        setCurrentStep(0);
      } catch (error) {
        console.error(error);
        setError('An error occurred while solving the puzzle');
      } finally {
        setIsSolving(false);
      }
    }, 0);
  };

  // Execute the next step of the solution
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

  // Handle undo and redo actions
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
      {isSolving && <div className="loader"><span className='spinner' /></div>}
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
