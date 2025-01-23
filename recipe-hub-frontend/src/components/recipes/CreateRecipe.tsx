// src/components/recipes/CreateRecipe.tsx

import React from 'react';
import { RecipeService } from '../../services/api';
import RecipeForm from './RecipeForm';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

const CreateRecipe: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (formData: any) => {
    try {
      const response = await RecipeService.create(formData);
      navigate(`/recipe/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create recipe:', error);
      throw error; // Let the form handle the error display
    }
  };

  return <RecipeForm onSubmit={handleSubmit} />;
};

export default CreateRecipe;