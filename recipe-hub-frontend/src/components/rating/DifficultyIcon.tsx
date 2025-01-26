// src/components/rating/DifficultyIcon.tsx

import React from 'react';
import Caserole from '../icons/Caserole';

interface DifficultyIconProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  disabled?: boolean;
}

const DifficultyIcon: React.FC<DifficultyIconProps> = ({
  rating,
  maxRating = 5,
  size = 24,
  interactive = false,
  onRatingChange,
  className = '',
  disabled = false,
}) => {
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

  const handleClick = (selectedRating: number) => {
    if (interactive && onRatingChange && !disabled) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <div className={`flex items-center ${className} ${disabled ? 'opacity-50' : ''}`}>
      {[...Array(maxRating)].map((_, index) => {
        const iconValue = index + 1;
        const fillPercentage = Math.min(Math.max((roundedRating - index) * 100, 0), 100);
        
        return (
          <div
            key={index}
            className={`relative ${interactive && !disabled ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => handleClick(iconValue)}
          >
            {/* Background caserole (empty) */}
            <Caserole
              size={size}
              className="text-gray-300"
            />
            
            {/* Foreground caserole (filled) */}
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Caserole
                size={size}
                className="text-brown"
                fill="currentColor"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DifficultyIcon;