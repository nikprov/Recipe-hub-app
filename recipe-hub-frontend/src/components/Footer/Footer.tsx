// recipe-hub-frontend/src/components/Footer/Footer.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Github, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Firstly we have to define interfaces for all properties for type
// specificity. We do this for common properties, navigation links, action links and
// one union type that will include all possible link types.

// Here we define the base interface for common properties
interface BaseLink {
  label: string;
  to: string;
}

// Here we define the interface for navigation links
interface NavigationLink extends BaseLink {
  type: 'navigation';
}

// Here we define the interface for action links (like logout)
interface ActionLink extends BaseLink {
  type: 'action';
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

// Here we create a union type for all possible link types
type QuickLink = NavigationLink | ActionLink;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { user, logout } = useAuth();

  const renderQuickLinks = () => {
    // Start with home link which is always present
    const links: QuickLink[] = [
      {
        type: 'navigation',
        to: "/",
        label: "Home"
      }
    ];

    if (user) {
      // Add authenticated user links
      links.push(
        {
          type: 'navigation',
          to: "/recipe/new",
          label: "Create Recipe"
        },
        {
          type: 'action',
          to: "#",
          label: "Log Out",
          onClick: (e) => {
            e.preventDefault();
            logout();
          }
        }
      );
    } else {
      // Add unauthenticated user links
      links.push(
        {
          type: 'navigation',
          to: "/login",
          label: "Login"
        },
        {
          type: 'navigation',
          to: "/register",
          label: "Register"
        }
      );
    }

    return (
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            {link.type === 'action' ? (
              // Render button for action links
              <button
                onClick={link.onClick}
                className="text-amber-600 hover:text-brown transition-colors"
              >
                {link.label}
              </button>
            ) : (
              // Render Link component for navigation links
              <Link
                to={link.to}
                className="text-amber-600 hover:text-brown transition-colors"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    );
  };

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
              Write about your experiences to help others prepare the best dish for the day!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-brown mb-4">Quick Links</h3>
            {renderQuickLinks()}
          </div>

          {/* Contact/Social */}
          <div>
            <h3 className="text-lg font-semibold text-brown mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/nikprov/Recipe-hub-app"
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
            <span className="mx-2">|</span>
            React.ts + tailwind.css + Django 
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;