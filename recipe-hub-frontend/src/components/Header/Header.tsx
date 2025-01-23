// src/components/Header/Header.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TokenTimer from './TokenTimer';
import { ChefHat } from 'lucide-react';


const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // console.log('Current user in Header:', user);  // Debug user data

    // Styles
    const buttonClasses = "px-4 py-2 rounded-md transition-colors duration-200";
    const primaryButton = `${buttonClasses} bg-brown text-cream hover:bg-opacity-70`;
    const secondaryButton = `${buttonClasses} border-2 border-brown text-brown hover:bg-brown hover:text-cream`;

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="bg-cream shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-24">
                    {/* Logo */}
                    <ChefHat className="h-8 w-8 text-brown absolute inset-y-8 left-5" />
                    <Link to="/" className="flex items-stretch">
                        <h1 className="text-2xl font-bold text-brown absolute inset-y-8 left-14">RecipeHub</h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <div className="flex items-center space-x-4">
                                    <span className="text-brown font-medium">
                                        Welcome{user.username && `, ${user.username}`}
                                        {user.isAdmin && (
                                            <span className="text-sage ml-1">(Administrator access)</span>
                                        )}
                                    </span>
                                    <TokenTimer />
                                    <Link 
                                        to="/recipe/new"
                                        className={secondaryButton}
                                    >
                                        Create Recipe
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className={primaryButton}
                                    >
                                        Log Out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className={secondaryButton}>
                                    Login
                                </Link>
                                <Link to="/register" className={primaryButton}>
                                    Register
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 rounded-md text-brown hover:bg-tan"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4">
                        <div className="flex flex-col space-y-3">
                            {user ? (
                                <>
                                    <span className="text-brown font-medium">
                                        Welcome back{user.username && `, ${user.username}`}
                                        {user.isAdmin && (
                                            <span className="text-sage ml-1">(Admin)</span>
                                        )}
                                    </span>
                                    <TokenTimer />
                                    <Link 
                                        to="/recipe/new"
                                        className={`${secondaryButton} text-center`}
                                    >
                                        Create Recipe
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className={`${primaryButton} w-full`}
                                    >
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/login" 
                                        className={`${secondaryButton} text-center`}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        className={`${primaryButton} text-center`}
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;