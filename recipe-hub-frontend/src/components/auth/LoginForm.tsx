import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FormInput from './FormInput';

interface LocationState {
  message?: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get success message from registration if it exists
  const state = location.state as LocationState;
  const successMessage = state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brown flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Top section */}
        <div className="bg-cream rounded-t-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-brown text-center">
            Welcome back chef!
          </h2>
          <p className="mt-2 text-center text-amber-700">
            Sign in to your Recipe Hub account
          </p>
        </div>

        {/* Form section */}
        <div className="bg-white px-8 py-10 shadow-lg">
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 rounded-md border border-green-200">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-md border border-red-200">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              id="username"
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                username: e.target.value
              }))}
              required
              autoFocus
            />

            <FormInput
              id="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                password: e.target.value
              }))}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent
                       rounded-md shadow-sm text-sm font-medium text-white bg-brown
                       hover:bg-brown/90 focus:outline-none focus:ring-2
                       focus:ring-offset-2 focus:ring-brown disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                       xmlns="http://www.w3.org/2000/svg" fill="none" 
                       viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" 
                            stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Bottom section */}
        <div className="bg-cream rounded-b-lg p-6 shadow-lg">
          <p className="text-center text-amber-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-brown hover:text-brown/80
                       transition-colors duration-200"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;