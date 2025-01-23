"""
Script to generate sample data for Recipe Hub.
Run this file with:
python manage.py shell < generate_sample_data.py
"""

import os
import django
import random
from datetime import datetime, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recipe_hub_backend.settings')
django.setup()

from django.contrib.auth.models import User
from recipes.models import Recipe, Comment, DifficultyRating
from django.utils import timezone

# Sample data for generating recipes
RECIPE_TEMPLATES = [
    {
        "title": "Homemade Pizza",
        "description": "A delicious homemade pizza with a crispy crust and your favorite toppings.",
        "ingredients": "Pizza dough\nTomato sauce\nMozzarella cheese\nBasil\nOlive oil",
        "instructions": "1. Preheat oven to 450°F\n2. Roll out dough\n3. Add toppings\n4. Bake for 15-20 minutes",
        "cooking_time": 45
    },
    # Add more recipe templates here
]

COMMENTS = [
    "Great recipe! Will definitely make it again!",
    "My family loved this!",
    "Simple and delicious.",
    "Made some modifications but turned out great!",
    "Perfect for weeknight dinner.",
]

def create_users():
    """Create admin and test user if they don't exist"""
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'AdminPass123!')
    if not User.objects.filter(username='testuser1').exists():
        User.objects.create_user('testuser1', 'testuser1@example.com', 'TestPass123!')
    
    return User.objects.get(username='admin'), User.objects.get(username='testuser1')

def create_recipe(template, author, created_at):
    """Create a single recipe"""
    recipe = Recipe.objects.create(
        title=template['title'],
        description=template['description'],
        ingredients=template['ingredients'],
        instructions=template['instructions'],
        cooking_time=template['cooking_time'],
        author=author,
        created_at=created_at,
        updated_at=created_at
    )
    return recipe

def create_comments(recipe, users, base_date):
    """Create comments for a recipe"""
    for i, user in enumerate(users):
        comment_date = base_date + timedelta(hours=i+1)
        Comment.objects.create(
            recipe=recipe,
            author=user,
            content=random.choice(COMMENTS),
            created_at=comment_date,
            updated_at=comment_date
        )

def create_ratings(recipe, users, base_date):
    """Create difficulty ratings for a recipe"""
    for i, user in enumerate(users):
        rating_date = base_date + timedelta(hours=i+1)
        DifficultyRating.objects.create(
            recipe=recipe,
            rating_author=user,
            rating=random.randint(1, 5),
            created_at=rating_date,
            updated_at=rating_date
        )

def main():
    """Main function to generate sample data"""
    print("Generating sample data...")
    
    # Create users
    admin, testuser = create_users()
    users = [admin, testuser]
    
    # Create recipes
    base_date = timezone.now() - timedelta(days=30)
    
    for i, template in enumerate(RECIPE_TEMPLATES):
        # Alternate between authors
        author = users[i % 2]
        recipe_date = base_date + timedelta(days=i)
        
        # Create recipe
        recipe = create_recipe(template, author, recipe_date)
        print(f"Created recipe: {recipe.title}")
        
        # Create comments and ratings
        create_comments(recipe, users, recipe_date)
        create_ratings(recipe, users, recipe_date)
    
    print("Sample data generation complete!")

if __name__ == "__main__":
    main()