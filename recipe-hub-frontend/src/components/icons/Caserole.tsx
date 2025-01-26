// src/components/icons/Caserole.tsx

import React from 'react';

interface CaseroleProps {
  size?: number;
  className?: string;
  fill?: string;
}

const Caserole: React.FC<CaseroleProps> = ({ 
  size = 24, 
  className = "", 
  fill = "none" 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Lid handle */}
    <line x1="12" y1="4" x2="12" y2="6" />
    <line x1="8" y1="4" x2="16" y2="4" />
    
    {/* Pot body */}
    <path d="M5 8h14a2 2 0 0 1 2 2v4a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6v-4a2 2 0 0 1 2-2z" />
    
    {/* Handles */}
    <path d="M4 10h1" />
    <path d="M19 10h1" />
  </svg>
);

export default Caserole;