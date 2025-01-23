// src/components/rating/DifficultyRatingSection.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DifficultyIcon from './DifficultyIcon';
import { DifficultyRatingService } from '../../services/api';
import { AlertCircle, Info } from 'lucide-react';

// Type definitions
interface RatingAuthor {
  username: string;
  id: number;
  email: string;
}

interface RatingResponse {
  id: number;
  rating: number;
  rating_author: RatingAuthor;
  created_at: string;
}

interface DifficultyRatingSectionProps {
  recipeId: number;
  averageRating: number;
  userRating: number | null;
  onRatingUpdate: () => void;
}

interface UserRatingDetails {
  id: number;
  rating: number;
}

interface UpdateRecord {
  timestamp: number;
  recipeId: number;
}

// Constants
const UPDATE_LIMIT_KEY = 'recipe_rating_updates';
const WINDOW_DURATION = 60000; // 1 minute in milliseconds
const WARNING_THRESHOLD = 2; // Show warning after 2 updates
const MAX_UPDATES = 4;      // Hard limit at 3 updates before backend limit of 5

// Helper functions for update tracking
const getRecentUpdates = (): UpdateRecord[] => {
  const now = Date.now();
  const stored = localStorage.getItem(UPDATE_LIMIT_KEY);
  const updates: UpdateRecord[] = stored ? JSON.parse(stored) : [];
  
  // Filter out old updates
  const recentUpdates = updates.filter(update => 
    now - update.timestamp < WINDOW_DURATION
  );
  
  // Save filtered list back to storage
  localStorage.setItem(UPDATE_LIMIT_KEY, JSON.stringify(recentUpdates));
  
  return recentUpdates;
};

const addUpdate = (recipeId: number) => {
  const updates = getRecentUpdates();
  updates.push({ timestamp: Date.now(), recipeId });
  localStorage.setItem(UPDATE_LIMIT_KEY, JSON.stringify(updates));
};

// Main component
const DifficultyRatingSection: React.FC<DifficultyRatingSectionProps> = ({
  recipeId,
  averageRating,
  userRating,
  onRatingUpdate,
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRatingDetails, setUserRatingDetails] = useState<UserRatingDetails | null>(null);
  const [displayRating, setDisplayRating] = useState<number>(0);
  const [updateWarning, setUpdateWarning] = useState<string | null>(null);

  // Fetch user's existing rating details
  useEffect(() => {
    const fetchUserRatingDetails = async () => {
      if (!user) return;

      try {
        const response = await DifficultyRatingService.getAll(recipeId);
        const userRatingData = response.data.find(
          (rating: RatingResponse) => rating.rating_author.username === user.username
        );

        if (userRatingData) {
          setUserRatingDetails({
            id: userRatingData.id,
            rating: userRatingData.rating
          });
          setDisplayRating(userRatingData.rating);
          console.log('Found existing rating:', userRatingData);
        }
      } catch (error) {
        console.error('Error fetching user rating details:', error);
      }
    };

    fetchUserRatingDetails();
  }, [recipeId, user]);

  // Update display rating when userRating prop changes
  useEffect(() => {
    if (userRating !== null) {
      setDisplayRating(userRating);
    }
  }, [userRating]);

  // Check updates count and set warning
  const checkUpdateLimit = () => {
    if (!userRatingDetails) return false; // No warning for first rating
    
    const recentUpdates = getRecentUpdates();
    const recipeUpdates = recentUpdates.filter(u => u.recipeId === recipeId);
    
    // Reset warning if under threshold
    if (recipeUpdates.length < WARNING_THRESHOLD) {
      setUpdateWarning(null);
      return false;
    }
    
    if (recipeUpdates.length === WARNING_THRESHOLD) {
      setUpdateWarning(
        "You're updating this rating frequently. Please make reasoned changes."
      );
      // Don't block the update, just warn
      return false;
    }
    
    // Block updates at max limit
    if (recipeUpdates.length >= MAX_UPDATES) {
      const oldestUpdate = recipeUpdates[0].timestamp;
      const timeLeft = Math.ceil((WINDOW_DURATION - (Date.now() - oldestUpdate)) / 1000);
      setUpdateWarning(
        `You've reached the update limit. Please wait ${timeLeft} seconds before making more changes.`
      );
      return true; // Block the update
    }
    
    return false;
  };

  // Handle rating submission
  const handleRatingSubmit = async (rating: number) => {
    if (!user) return;

    // For updates, check the limit
    if (userRatingDetails && checkUpdateLimit()) {
      setError("Please wait before updating your rating again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setUpdateWarning(null);

    try {
      if (userRatingDetails) {
        // Update existing rating
        await DifficultyRatingService.update(
          recipeId,
          userRatingDetails.id,
          { rating }
        );
        
        setUserRatingDetails({
          ...userRatingDetails,
          rating
        });
        
        // Record the update and check for warning
        addUpdate(recipeId);
        checkUpdateLimit();
      } else {
        // Create new rating - no throttling for first rating
        const response = await DifficultyRatingService.create(recipeId, { rating });
        
        setUserRatingDetails({
          id: response.data.id,
          rating: rating
        });
      }
      
      setDisplayRating(rating);
      onRatingUpdate();
    } catch (err: any) {
      console.error('Rating submission error:', err.response?.data || err);
      if (err.response?.status === 429) {
        setError("You've reached the rate limit. Please try again later.");
      } else {
        setError(err.response?.data?.detail || 'Failed to submit rating');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render for non-authenticated users
  if (!user) {
    return (
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-brown mb-2">Recipe Difficulty</h3>
        <div className="flex items-center mb-2">
          <DifficultyIcon rating={averageRating || 0} className="mr-2" />
          <span className="text-tan">
            {averageRating ? `${averageRating.toFixed(1)} on average of user ratings` : 'No ratings yet'}
          </span>
        </div>
        <p className="text-gray-600 text-sm">Log in to rate this recipe's difficulty</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-brown mb-2">Recipe Difficulty</h3>
      
      {/* Average Rating Display */}
      <div className="flex items-center mb-4">
        <DifficultyIcon rating={averageRating || 0} className="mr-2" />
        <span className="text-tan">
          {averageRating 
            ? `${averageRating.toFixed(1)} on average of user ratings` 
            : 'No ratings yet'}
        </span>
      </div>

      {/* User Rating Section */}
      <div className="bg-cream bg-opacity-30 p-4 rounded-lg">
        <h4 className="font-medium text-brown mb-2">
          {userRatingDetails ? 'Your Rating' : 'Rate this Recipe'}
        </h4>
        
        <div className="flex items-center">
          <DifficultyIcon
            rating={displayRating}
            interactive={!isSubmitting}
            onRatingChange={handleRatingSubmit}
            className="mr-2"
          />
          {isSubmitting && <span className="text-tan">Submitting...</span>}
        </div>

        {userRatingDetails && (
          <p className="text-sm text-gray-600 mt-2">
            Click on the caseroles to update your rating
          </p>
        )}

        {updateWarning && (
          <div className="flex items-center text-amber-600 text-sm mt-2">
            <Info size={16} className="mr-1" />
            {updateWarning}
          </div>
        )}

        {error && (
          <div className="flex items-center text-red-500 text-sm mt-2">
            <AlertCircle size={16} className="mr-1" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DifficultyRatingSection;