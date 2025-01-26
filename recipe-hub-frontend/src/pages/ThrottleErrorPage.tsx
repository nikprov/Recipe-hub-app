// src/components/common/ThrottleErrorPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, ArrowLeft } from 'lucide-react';

const ThrottleErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Playful Chef Hat Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <ChefHat 
              size={80} 
              className="text-brown animate-bounce"
            />
            <span className="absolute -top-2 -right-2 text-2xl">👋</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl font-bold text-brown mb-4">
          Cooking Break Time!
        </h1>
        <h2 className="text-xl text-tan mb-6">
          Oops, passed the fair use limit!<br/>
          More cooking, less scrolling ;D
        </h2>
        <p className="text-gray-600 mb-8">
          Our kitchen needs a moment to catch up.<br/>
          Why not try that recipe you've been eyeing?
        </p>

        {/* Back Button */}
        <button
          onClick={() => navigate(`/`)}
          className="inline-flex items-center px-6 py-3 bg-brown text-white 
                   rounded-md hover:bg-opacity-90 transition-colors group"
        >
          <ArrowLeft 
            className="mr-2 group-hover:-translate-x-1 transition-transform" 
            size={20} 
          />
          Back to Recipes
        </button>
      </div>
    </div>
  );
};

export default ThrottleErrorPage;