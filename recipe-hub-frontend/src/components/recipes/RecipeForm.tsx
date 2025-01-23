//  recipe-hub-frontend\src\components\recipes\RecipeForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../../types/types';
import { Clock, AlertCircle } from 'lucide-react';

// This interface defines the form data structure we'll work with
interface RecipeFormData {
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  cooking_time: number;
}

interface RecipeFormProps {
  initialData?: Partial<Recipe>;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  isEditing?: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData = {},
  onSubmit,
  isEditing = false,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RecipeFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    ingredients: initialData.ingredients || '',
    instructions: initialData.instructions || '',
    cooking_time: initialData.cooking_time || 30,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RecipeFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to validate the form data
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RecipeFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.ingredients.trim()) {
      newErrors.ingredients = 'Ingredients are required';
    }
    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    }
    if (formData.cooking_time <= 0) {
      newErrors.cooking_time = 'Cooking time must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      navigate('/');
    } catch (err: any) {
      const responseErrors = err.response?.data || {};
      setErrors(responseErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cooking_time' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-brown mb-6">
          {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-brown font-medium mb-2">
              Recipe Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter recipe title"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 
                         focus:ring-brown focus:border-brown ${
                           errors.title ? 'border-red-500' : 'border-tan'
                         }`}
            />
            {errors.title && (
              <p className="mt-1 text-red-500 flex items-center text-sm">
                <AlertCircle size={16} className="mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-brown font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your recipe"
              rows={3}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 
                         focus:ring-brown focus:border-brown resize-none ${
                           errors.description ? 'border-red-500' : 'border-tan'
                         }`}
            />
            {errors.description && (
              <p className="mt-1 text-red-500 flex items-center text-sm">
                <AlertCircle size={16} className="mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Ingredients Field */}
          <div>
            <label className="block text-brown font-medium mb-2">
              Ingredients (one per line)
            </label>
            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              placeholder="Enter ingredients, one per line"
              rows={6}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 
                         focus:ring-brown focus:border-brown ${
                           errors.ingredients ? 'border-red-500' : 'border-tan'
                         }`}
            />
            {errors.ingredients && (
              <p className="mt-1 text-red-500 flex items-center text-sm">
                <AlertCircle size={16} className="mr-1" />
                {errors.ingredients}
              </p>
            )}
          </div>

          {/* Instructions Field */}
          <div>
            <label className="block text-brown font-medium mb-2">
              Instructions (one step per line)
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Enter instructions, one step per line"
              rows={8}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 
                         focus:ring-brown focus:border-brown ${
                           errors.instructions ? 'border-red-500' : 'border-tan'
                         }`}
            />
            {errors.instructions && (
              <p className="mt-1 text-red-500 flex items-center text-sm">
                <AlertCircle size={16} className="mr-1" />
                {errors.instructions}
              </p>
            )}
          </div>

          {/* Cooking Time Field */}
          <div>
            <label className="block text-brown font-medium mb-2">
              Cooking Time (minutes)
            </label>
            <div className="relative">
              <Clock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tan" />
              <input
                type="number"
                name="cooking_time"
                value={formData.cooking_time}
                onChange={handleChange}
                min="1"
                className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 
                           focus:ring-brown focus:border-brown ${
                             errors.cooking_time ? 'border-red-500' : 'border-tan'
                           }`}
              />
            </div>
            {errors.cooking_time && (
              <p className="mt-1 text-red-500 flex items-center text-sm">
                <AlertCircle size={16} className="mr-1" />
                {errors.cooking_time}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-tan text-tan rounded-md 
                       hover:border-brown hover:text-brown transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-brown text-white rounded-md hover:bg-opacity-90 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeForm;