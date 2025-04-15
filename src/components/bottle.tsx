import React from 'react';

type BottleProps = {
  colors: string[];
  index: number;
  onClick: (index: number) => void;
};

const Bottle: React.FC<BottleProps> = ({ colors, index, onClick }) => {
  return (
    <div className="bottle" onClick={() => onClick(index)}>
      <div className="bottle-neck" />
      <div className="bottle-body">
        {colors.map((color, i) => (
          <div key={i} className="liquid" style={{ backgroundColor: color }} />
        ))}
      </div>
    </div>
  );
};

export default Bottle;