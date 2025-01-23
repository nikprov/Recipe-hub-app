// src/components/common/NotFound.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brown mb-4">404</h1>
        <h2 className="text-2xl text-tan mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-brown text-white 
                   rounded-md hover:bg-opacity-90 transition-colors"
        >
          <Home className="mr-2" size={20} />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;