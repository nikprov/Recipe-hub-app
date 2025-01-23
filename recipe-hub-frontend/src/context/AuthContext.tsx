// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/api';
import { AuthContextType, User, JwtPayload, DjangoUser } from '../types/types';
import { jwtDecode } from 'jwt-decode';

// Create context with null default value
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook for using auth context with type checking
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Core state management
    const [user, setUser] = useState<User | null>(null);
    const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
    // New state to track initialization
    const [isInitialized, setIsInitialized] = useState(false);

    // Helper function to check if a token is expired
    const isTokenExpired = (decodedToken: JwtPayload): boolean => {
        const currentTime = Date.now() / 1000;
        return decodedToken.exp < currentTime;
    };

    // Fetch user data from Django backend
    const fetchUserData = async (token: string) => {
        try {
            // Use the fetch API to make the request
            const response = await fetch('http://localhost:8000/api/auth/user/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Handle non-200 responses
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData: DjangoUser = await response.json();
            return userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Clear invalid tokens on error
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            return null;
        }
    };

    // Parse token and set user state
    const parseAndSetUser = async (token: string) => {
        try {
            // Decode the JWT token
            const decoded = jwtDecode<JwtPayload>(token);
            
            // Check for token expiration
            if (isTokenExpired(decoded)) {
                throw new Error('Token expired');
            }

            // Only fetch user data if token is valid
            const userData = await fetchUserData(token);
            if (!userData) {
                throw new Error('Failed to get user data');
            }

            // Set user state with validated data
            const userState: User = {
                username: userData.username,
                isAdmin: userData.is_staff,
                token: token
            };

            setUser(userState);
            setTokenExpiry(new Date(decoded.exp * 1000));
        } catch (error) {
            // Clear everything on any error
            console.error('Error in parseAndSetUser:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            setTokenExpiry(null);
        }
    };

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            // Only attempt to parse and set user if token exists
            if (token) {
                await parseAndSetUser(token);
            }
            // Mark initialization as complete
            setIsInitialized(true);
        };

        initializeAuth();
    }, []);

    // Handle user login
    const login = async (username: string, password: string) => {
        try {
            const response = await AuthService.login(username, password);
            const { access, refresh } = response.data;
            
            // Store tokens
            localStorage.setItem('token', access);
            localStorage.setItem('refresh_token', refresh);
            
            // Set user state
            await parseAndSetUser(access);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Handle user logout
    const logout = () => {
        // Clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setTokenExpiry(null);
    };

    // Handle user registration
    const register = async (
        username: string, 
        email: string, 
        password: string, 
        password2: string
    ) => {
        try {
            // Register the user
            await AuthService.register({ 
                username, 
                email, 
                password1: password, 
                password2
            });

            // Automatically log in after successful registration
            await login(username, password);
        } catch (error: any) {
            console.error('Registration error:', error.response?.data || error);
            throw error;
        }
    };

    // Don't render until initialization is complete
    if (!isInitialized) {
        // You could return a loading spinner here instead
        return null;
    }

    return (
        <AuthContext.Provider 
            value={{ user, login, logout, register, tokenExpiry }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;