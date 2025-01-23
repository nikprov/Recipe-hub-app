// src/services/api.ts

import axios from 'axios';
import { Recipe, PaginatedResponse } from '../types/types';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { AxiosError } from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create an axios instance for authenticated requests
const api = axios.create({
    baseURL: API_URL,
});

// Create a separate axios instance for public endpoints
const publicApi = axios.create({
    baseURL: API_URL,
});

// Add token to requests if it exists, but only for authenticated api instance
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const useThrottleHandler = () => {
    const navigate = useNavigate();
  
    const handleError = useCallback((error: unknown) => {
      if (error instanceof Error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 429) {
          // Redirect to throttle error page
          navigate('/throttle-error', { replace: true });
          return true; // Error was handled
        }
      }
      return false; // Error wasn't handled
    }, [navigate]);
  
    return handleError;
  };

export const RecipeService = {
    // Public endpoints use publicApi
    getAll: (page: number = 1) => 
        publicApi.get<PaginatedResponse<Recipe>>(`/recipes/?page=${page}`),
    getOne: (id: number) => publicApi.get<Recipe>(`/recipes/${id}/`),
    // Protected endpoints use authenticated api
    create: (recipe: Omit<Recipe, 'id' | 'comments'>) => 
        api.post<Recipe>('/recipes/', recipe),
    update: (id: number, recipe: Omit<Recipe, 'id' | 'comments'>) =>
        api.put<Recipe>(`/recipes/${id}/`, recipe),
    delete: (id: number) => api.delete(`/recipes/${id}/`),
};

export const CommentService = {
    create: (recipeId: number, comment: { content: string }) =>
        api.post(`/recipes/${recipeId}/comments/`, comment),
    update: (recipeId: number, commentId: number, comment: { content: string }) =>
        api.put(`/recipes/${recipeId}/comments/${commentId}/`, comment),
    delete: (recipeId: number, commentId: number) => 
        api.delete(`/recipes/${recipeId}/comments/${commentId}/`),
};

export const AuthService = {
    login: (username: string, password: string) =>
        publicApi.post('/token/', { username, password }),
    register: (userData: { 
        username: string; 
        email: string; 
        password1: string; 
        password2: string; 
    }) => publicApi.post('/auth/registration/', userData),
    refreshToken: (refresh: string) =>
        publicApi.post('/token/refresh/', { refresh }),
};

export const DifficultyRatingService = {
    // Get all ratings for a recipe
    getAll: (recipeId: number) => 
        publicApi.get(`/recipes/${recipeId}/difficulty-ratings/`),
    
    // Create a new rating
    create: (recipeId: number, rating: { rating: number }) =>
        api.post(`/recipes/${recipeId}/difficulty-ratings/`, rating),
    
    // Update an existing rating
    update: (recipeId: number, ratingId: number, rating: { rating: number }) =>
        api.put(`/recipes/${recipeId}/difficulty-ratings/${ratingId}/`, rating),
    
    // Delete a rating (if needed)
    delete: (recipeId: number, ratingId: number) =>
        api.delete(`/recipes/${recipeId}/difficulty-ratings/${ratingId}/`),
};