// src/components/recipes/RecipeDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Recipe } from '../../types/types';
import { RecipeService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Edit, Trash2, Clock, User } from 'lucide-react';
import CommentSection from '../comments/CommentSection';
import DifficultyRatingSection from '../rating/DifficultyRatingSection';

const RecipeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch recipe data including ratings
    const fetchRecipe = async () => {
        try {
            setIsLoading(true);
            const response = await RecipeService.getOne(Number(id));
            setRecipe(response.data);
        } catch (error) {
            console.error('Error fetching recipe:', error);
            setError('Failed to load recipe details');
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchRecipe();
    }, [id]);

    // Handle recipe deletion with confirmation
    const handleDelete = async () => {
        if (!recipe || !window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
            return;
        }

        try {
            await RecipeService.delete(recipe.id);
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert('Failed to delete recipe');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-brown text-xl animate-pulse">Loading recipe details...</div>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                    {error || 'Recipe not found'}
                </div>
            </div>
        );
    }

    // Helper function to get author name consistently
    const getAuthorName = (author: string | { username: string; id: number; email: string }): string => {
        return typeof author === 'object' ? author.username : author;
    };
    
    // Check user permissions
    const authorName = getAuthorName(recipe.author);
    const isAuthor = user?.username === authorName;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back button */}
            <button
                onClick={() => navigate('/')}
                className="flex items-center text-brown hover:text-opacity-80 mb-6 
                         transition-colors duration-200"
            >
                <ArrowLeft className="mr-2" size={20} />
                Back to all recipes
            </button>

            {/* Recipe Details Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                {/* Title and Actions */}
                <div className="flex justify-between items-start mb-6">
                    <h1 className="text-3xl font-bold text-brown">{recipe.title}</h1>
                    {(isAuthor || user?.isAdmin) && (
                        <div className="flex space-x-4">
                            {isAuthor && (
                                <button
                                    onClick={() => navigate(`/recipe/edit/${recipe.id}`)}
                                    className="flex items-center px-4 py-2 bg-sage text-white 
                                             rounded-md hover:bg-opacity-90 transition-colors"
                                >
                                    <Edit size={18} className="mr-2" />
                                    Edit
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="flex items-center px-4 py-2 bg-red-500 text-white 
                                         rounded-md hover:bg-red-600 transition-colors"
                            >
                                <Trash2 size={18} className="mr-2" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Recipe Metadata */}
                <div className="flex items-center space-x-6 text-tan mb-6">
                    <div className="flex items-center">
                        <User size={18} className="mr-2" />
                        <span>{authorName}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock size={18} className="mr-2" />
                        <span>{recipe.cooking_time} minutes</span>
                    </div>
                </div>

                {/* Difficulty Rating Section */}
                <DifficultyRatingSection
                    recipeId={recipe.id}
                    averageRating={recipe.average_difficulty || 0}
                    userRating={recipe.user_rating}
                    onRatingUpdate={fetchRecipe}
                />

                {/* Description */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-brown mb-3">Description</h2>
                    <p className="text-gray-700">{recipe.description}</p>
                </div>

                {/* Ingredients */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-brown mb-4">Ingredients</h2>
                    <div className="bg-cream bg-opacity-30 rounded-lg p-4">
                        {recipe.ingredients.split('\n').map((ingredient, index) => (
                            <div key={index} className="flex items-center mb-2 last:mb-0">
                                <span className="w-2 h-2 bg-brown rounded-full mr-3" />
                                <span className="text-gray-700">{ingredient.trim()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-brown mb-4">Instructions</h2>
                    <div className="space-y-4">
                        {recipe.instructions.split('\n').map((step, index) => (
                            <div key={index} className="flex">
                                <span className="flex-shrink-0 w-8 h-8 bg-brown text-white 
                                               rounded-full flex items-center justify-center mr-3">
                                    {index + 1}
                                </span>
                                <p className="text-gray-700 pt-1">{step.trim()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comments Section */}
                {user ? (
                    <CommentSection
                        recipeId={recipe.id}
                        recipeComments={recipe.comments}
                        onCommentUpdate={fetchRecipe}
                    />
                ) : (
                    <div className="mt-8 p-6 bg-cream bg-opacity-30 rounded-lg text-center">
                        <p className="text-brown">
                            Please log in to see and add comments on this recipe.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeDetail;