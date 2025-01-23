// recipe-hub-frontend\src\components\Footer\Footer.tsx


// Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cream shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-brown" />
              <span className="text-2xl font-bold text-brown">Recipe Hub</span>
            </div>
            <p className="text-amber-700">
              Share your favorite recipes and discover new ones from our community of food lovers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-brown mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-amber-600 hover:text-brown transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-amber-600 hover:text-brown transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-amber-600 hover:text-brown transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Social */}
          <div>
            <h3 className="text-lg font-semibold text-brown mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/yourusername/recipe-hub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-brown transition-colors"
              >
                <Github size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-amber-600">
          <p className="text-center text-brown flex items-center justify-center">
            Made with <Heart className="h-4 w-4 mx-1 text-brown" /> by Nick Providakis
            <span className="mx-2">|</span>
            © {currentYear} Recipe Hub
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;