// src/components/Header/TokenTimer.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock } from 'lucide-react';

const TokenTimer: React.FC = () => {
  const { tokenExpiry } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!tokenExpiry) return;

      const now = Date.now();
      const diff = tokenExpiry.getTime() - now;

      if (diff > 0) {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('Expired');
      }
    };

    // Update immediately and then every second
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [tokenExpiry]);

  if (!tokenExpiry) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-brown">
      <Clock size={16} />
      <span>Session: {timeLeft}</span>
    </div>
  );
};

export default TokenTimer;