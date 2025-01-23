# recipe_hub_backend\recipes\models.py

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg

class Recipe(models.Model):
    title = models.CharField(max_length=200, db_index=True)
    description = models.TextField()
    ingredients = models.TextField(help_text="Add a new line for each ingredient")
    instructions = models.TextField()
    cooking_time = models.IntegerField(help_text="Cooking time in minutes")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ['-created_at']  # Show newest comments first
        indexes = [
            models.Index(fields=['-created_at']),  # Index for ordering
            models.Index(fields=['author']),       # Index for author lookups
        ]

    def __str__(self):
        return self.title

class Comment(models.Model):
    recipe = models.ForeignKey(Recipe, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=5000, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']  # Show newest comments first
        indexes = [
            models.Index(fields=['created_at', 'recipe'])
        ]

    def __str__(self):
        return f'Comment by {self.author.username} on {self.recipe.title}'
    
class DifficultyRating(models.Model):
    recipe = models.ForeignKey(
        Recipe, 
        related_name='difficulty_ratings',
        on_delete=models.CASCADE
    )
    rating_author = models.ForeignKey(
        User, 
        related_name='difficulty_ratings',
        on_delete=models.CASCADE
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Difficulty rating from 1 (easiest) to 5 (hardest)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ensure one rating per user per recipe
        unique_together = ['recipe', 'rating_author']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipe', 'rating_author']),  # Index for uniqueness checks
        ]

    def __str__(self):
        return f'Difficulty rating of {self.rating} by {self.rating_author.username} for {self.recipe.title}'
