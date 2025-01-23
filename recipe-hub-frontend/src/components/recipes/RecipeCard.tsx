// src/components/recipes/RecipeCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MessageSquare, ChevronRight, User } from 'lucide-react';
import { Recipe } from '../../types/types';
import { motion } from 'framer-motion';

interface RecipeCardProps {
    recipe: Recipe;
    delay?: number;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, delay = 0 }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const formattedDate = new Date(recipe.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Function to truncate text with ellipsis
    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all 
                         duration-300 hover:-translate-y-1 hover:shadow-xl max-h-[800px] relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Colored banner */}
            <div className="h-2 bg-gradient-to-r from-brown to-sage" />

            <div className="p-6">
                {/* Title and Author */}
                <div className="flex justify-between items-start mb-4 mt-8">
                    <h3 className="text-xl font-semibold text-brown hover:text-opacity-80 
                                 transition-colors flex-grow pr-4">
                        {truncateText(recipe.title, 50)}
                    </h3>
                    <div className="flex items-center text-tan text-sm whitespace-nowrap">
                        <User size={16} className="mr-1" />
                        <span>
                            {typeof recipe.author === 'object' 
                                ? recipe.author.username 
                                : recipe.author}
                        </span>
                    </div>
                </div>

                {/* Average Rating Badge */}
                {recipe.average_difficulty > 0 && (
                    <div className="absolute top-3 right-4 bg-brown bg-opacity-90 text-white 
                                  px-3 py-0.4 rounded-full z-10 text-sm font-medium">
                        Difficulty: {recipe.average_difficulty.toFixed(1)}
                    </div>
                )}

                {/* Description Preview */}
                <div className="mb-4 relative">
                    <p className={`text-gray-600 transition-all duration-300 
                                ${isHovered ? 'line-clamp-6' : 'line-clamp-2'}`}>
                        {recipe.description}
                    </p>
                    {recipe.description.length > 350 && !isHovered && (
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t 
                                      from-white to-transparent" />
                    )}
                </div>

                {/* Recipe Metadata */}
                <div className="flex items-center justify-between text-sm text-tan mt-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            <span>{recipe.cooking_time} mins</span>
                        </div>
                        <div className="flex items-center">
                            <MessageSquare size={16} className="mr-1" />
                            <span>{recipe.comments?.length || 0} comments</span>
                        </div>
                    </div>
                    <span>{formattedDate}</span>
                </div>

                {/* View Details Button */}
                <motion.button
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                    className="mt-4 w-full flex items-center justify-center px-4 py-2 
                             border border-brown rounded-md text-brown hover:bg-brown 
                             hover:text-white transition-colors group"
                >
                    View Details
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 
                                                     transition-transform" />
                </motion.button>
            </div>
        </motion.div>
    );
};

export default RecipeCard;