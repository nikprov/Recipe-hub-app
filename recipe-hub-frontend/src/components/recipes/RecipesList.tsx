// src/components/recipes/RecipesList.tsx

import React, { useState, useEffect } from 'react';
import { Recipe } from '../../types/types';
import { RecipeService } from '../../services/api';
import RecipeCard from './RecipeCard';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useThrottleHandler } from '../../hooks/useThrottleHandler';
import { PaginatedResponse } from '../../types/types';

const RecipesList: React.FC = () => {
    // State management for recipes and pagination
    const handleThrottleError = useThrottleHandler();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecipes, setTotalRecipes] = useState(0);
    const recipesPerPage = 10; // Matches backend pagination setting

    // Fetch recipes with pagination
    const fetchRecipes = async (page: number) => {
        try {
            setIsLoading(true);
            const response = await RecipeService.getAll(page);
            const paginatedData: PaginatedResponse<Recipe> = response.data;
            
            setRecipes(paginatedData.results);
            setTotalRecipes(paginatedData.count);
            setTotalPages(Math.ceil(paginatedData.count / recipesPerPage));
            
        } catch (error) {
            // Try to handle it as a throttle error first
            const wasThrottleError = handleThrottleError(error);
            
            // If it wasn't a throttle error, handle it normally
            if (!wasThrottleError) {
                console.error('Error fetching recipes:', error);
                setError('Failed to load recipes. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch recipes when page changes
    useEffect(() => {
        fetchRecipes(currentPage);
    }, [currentPage]);

    // Handle page navigation
    const handlePageChange = (newPage: number) => {
        // Ensure we stay within valid page range
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Scroll to top when changing pages
            window.scrollTo(0, 0);
        }
    };

    // Client-side search with pagination
    const handleSearch = (searchValue: string) => {
        setSearchTerm(searchValue);
        // Reset to first page when searching
        setCurrentPage(1);
    };

    // Filter recipes based on search term
    const filteredRecipes = recipes.filter(recipe => {
        const searchLower = searchTerm.toLowerCase();
        return (
            recipe.title.toLowerCase().includes(searchLower) ||
            recipe.description.toLowerCase().includes(searchLower) ||
            (typeof recipe.author === 'object' 
                ? recipe.author.username.toLowerCase().includes(searchLower)
                : recipe.author.toLowerCase().includes(searchLower))
        );
    });

    // Loading state
    if (isLoading && currentPage === 1) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-brown text-xl animate-pulse">
                    Loading recipes...
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section with Search */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-brown mb-4">
                    Discover delicious recipes every day!
                </h1>
                
                {/* Search Bar */}
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-tan" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-tan 
                                 rounded-md leading-5 bg-white placeholder-tan
                                 focus:outline-none focus:ring-2 focus:ring-brown
                                 focus:border-brown transition duration-150 ease-in-out"
                    />
                </div>
            </div>

            {/* Recipes Grid */}
            {filteredRecipes.length === 0 ? (
                <div className="text-center py-8 text-brown">
                    {searchTerm 
                        ? 'No recipes found matching your search.'
                        : 'No recipes available yet. Be the first to add one!'}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRecipes.map((recipe, index) => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                delay={index * 0.1}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-8 flex items-center justify-between border-t border-tan pt-4">
                        <div className="flex items-center">
                            <p className="text-sm text-tan">
                                Showing {((currentPage - 1) * recipesPerPage) + 1} to{' '}
                                {Math.min(currentPage * recipesPerPage, totalRecipes)} of{' '}
                                {totalRecipes} recipes
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            {/* Previous Page Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-md ${
                                    currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-brown hover:bg-brown hover:text-white'
                                } transition-colors`}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            {/* Page Numbers */}
                            <div className="flex items-center space-x-1">
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => handlePageChange(index + 1)}
                                        className={`px-3 py-1 rounded-md ${
                                            currentPage === index + 1
                                                ? 'bg-brown text-white'
                                                : 'text-brown hover:bg-cream'
                                        } transition-colors`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Next Page Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-md ${
                                    currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-brown hover:bg-brown hover:text-white'
                                } transition-colors`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RecipesList;