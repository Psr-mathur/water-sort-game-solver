import React from 'react';

type ColorPickerProps = {
  colors: string[];
  selectedColor: string | null;
  onSelect: (color: string) => void;
};

const ColorPicker: React.FC<ColorPickerProps> = ({ colors, selectedColor, onSelect }) => {
  return (
    <div className="color-picker">
      {colors.map((color) => (
        <div
          key={color}
          className={`color-option${selectedColor === color ? ' selected' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onSelect(color)}
        />
      ))}
    </div>
  );
};

export default ColorPicker;