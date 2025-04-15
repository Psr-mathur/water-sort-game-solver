import React from 'react';
import { Move } from '../types';

type SolutionStepsProps = {
  steps: Move[];
};

const SolutionSteps: React.FC<SolutionStepsProps> = ({ steps }) => {
  if (steps.length === 0) {
    return <p>Puzzle is already solved!</p>;
  }
  return (
    <>
      {steps.map((step, i) => (
        <div key={i} className="step">
          <strong>Step {i + 1}:</strong> Pour from bottle {step.from + 1} to bottle {step.to + 1}
        </div>
      ))}
    </>
  );
};

export default SolutionSteps;