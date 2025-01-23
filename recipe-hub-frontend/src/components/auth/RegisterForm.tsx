import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FormInput from './FormInput';

// Define our expected form data structure to match Django's expectations
interface RegisterFormData {
    username: string;
    email: string;
    password1: string;
    password2: string;
}

// Define the structure for our form errors
interface FormErrors {
    username?: string[];
    email?: string[];
    password1?: string[];
    password2?: string[];
    non_field_errors?: string[];
}

const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState<RegisterFormData>({
        username: '',
        email: '',
        password1: '',
        password2: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    // Validate the form before submission
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = ['Username is required'];
        } else if (formData.username.length < 3) {
            newErrors.username = ['Username must be at least 3 characters'];
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = ['Email is required'];
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = ['Please enter a valid email address'];
        }
        
        // Password validation
        if (!formData.password1) {
            newErrors.password1 = ['Password is required'];
        } else if (formData.password1.length < 8) {
            newErrors.password1 = ['Password must be at least 8 characters'];
        }
        
        // Confirm password validation
        if (!formData.password2) {
            newErrors.password2 = ['Please confirm your password'];
        } else if (formData.password1 !== formData.password2) {
            newErrors.password2 = ['Passwords do not match'];
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        
        // First validate the form
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await register(
                formData.username,
                formData.email,
                formData.password1,
                formData.password2
            );
            
            // Redirect to login with success message
            navigate('/login', { 
                state: { message: 'Registration successful! You are logged in.' }
            });
        } catch (err: any) {
            console.error('Registration error:', err.response?.data);
            
            // Handle different types of error responses
            if (err.response?.data) {
              const errorData = err.response.data;
              // Map backend password errors to the correct field
              if (errorData.password) {
                  errorData.password1 = errorData.password;
                  delete errorData.password;
              }
              setErrors(errorData);
          } else {
              setErrors({
                  non_field_errors: ['Registration failed. Please try again.']
              });
          }
      } finally {
          setIsLoading(false);
      }
  };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear the error for this field when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Helper function to render error messages
    const getErrorMessage = (field: keyof FormErrors): string | undefined => {
        const fieldErrors = errors[field];
        return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : undefined;
    };

    return (
        <div className="min-h-screen bg-brown flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md space-y-8">
                {/* Form Header */}
                <div className="bg-cream rounded-t-lg p-8 shadow-lg">
                    <h2 className="text-3xl font-bold text-brown text-center">
                        Create an account
                    </h2>
                    <p className="mt-2 text-center text-brown">
                        Join Recipe Hub and start sharing your recipes
                    </p>
                </div>

                {/* Form Body */}
                <div className="bg-white px-8 py-10 shadow-lg">
                    {/* Show non-field errors at the top */}
                    {errors.non_field_errors && (
                        <div className="mb-6 p-4 bg-red-50 rounded-md flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                            <span className="text-red-800">
                                {errors.non_field_errors[0]}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormInput
                            id="username"
                            name="username"
                            label="Username"
                            value={formData.username}
                            onChange={handleChange}
                            error={getErrorMessage('username')}
                            required
                            autoFocus
                        />

                        <FormInput
                            id="email"
                            name="email"
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={getErrorMessage('email')}
                            required
                        />

                        <FormInput
                            id="password1"
                            name="password1"
                            label="Password"
                            type="password"
                            value={formData.password1}
                            onChange={handleChange}
                            error={getErrorMessage('password1')}
                            required
                        />

                        <FormInput
                            id="password2"
                            name="password2"
                            label="Confirm Password"
                            type="password"
                            value={formData.password2}
                            onChange={handleChange}
                            error={getErrorMessage('password2')}
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
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                                         xmlns="http://www.w3.org/2000/svg" fill="none" 
                                         viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" 
                                                stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" 
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    Create Account
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Form Footer */}
                <div className="bg-cream rounded-b-lg p-6 shadow-lg">
                    <p className="text-center text-amber-600">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-brown hover:text-brown/80
                                     transition-colors duration-200"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;