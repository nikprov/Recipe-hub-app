// src/components/recipes/EditRecipe.tsx

import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Recipe } from '../../types/types';
import { RecipeService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RecipeForm from './RecipeForm';

const EditRecipe: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                if (!id) throw new Error('Recipe ID not provided');
                const response = await RecipeService.getOne(parseInt(id));
                setRecipe(response.data);
            } catch (err) {
                console.error('Failed to load recipe:', err);
                setError('Failed to load recipe');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecipe();
    }, [id]);

    // Redirect if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-brown">Loading recipe...</div>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="text-center p-4 text-red-600">
                {error || 'Recipe not found'}
            </div>
        );
    }

    // Check if user is authorized to edit this recipe
    const isAuthor = user.username === (
        typeof recipe.author === 'object' ? recipe.author.username : recipe.author
    );
    
    if (!isAuthor && !user.isAdmin) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (formData: Partial<Recipe>) => {
        try {
            const response = await RecipeService.update(recipe.id, {
                ...formData,
                author: recipe.author // Preserve the original author
            });
            // Navigate to the recipe detail page after successful update
            navigate(`/recipe/${response.data.id}`);
        } catch (error) {
            console.error('Failed to update recipe:', error);
            throw error; // Let the form handle the error display
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-brown mb-6">Edit Recipe</h1>
            <RecipeForm
                initialData={recipe}
                onSubmit={handleSubmit}
                isEditing={true}
            />
        </div>
    );
};

export default EditRecipe;