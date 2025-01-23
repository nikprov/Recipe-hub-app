"""
Script to generate sample data for Recipe Hub.
Run this script using:
python manage.py shell -c "exec(open('scripts/generate_sample_data.py').read())"
"""

import os
import django
import random
import sys
from datetime import datetime, timedelta

# Add debug print function
def debug_print(message):
    """Print with flush to ensure immediate output"""
    print(message, flush=True)

debug_print("Starting script execution...")

try:
    debug_print("Setting up Django environment...")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recipe_hub_backend.settings')
    django.setup()
    debug_print("Django environment setup complete.")

    from django.contrib.auth.models import User
    from recipes.models import Recipe, Comment, DifficultyRating
    from django.utils import timezone
    from django.db import transaction

except Exception as e:
    debug_print(f"Error during setup: {str(e)}")
    sys.exit(1)

# Sample data remains the same as before
RECIPE_TEMPLATES = [
    {
        "title": "Classic Spaghetti Carbonara",
        "description": "A traditional Italian pasta dish with eggs, cheese, pancetta, and black pepper.",
        "ingredients": "400g spaghetti\n200g pancetta or guanciale\n4 large eggs\n100g Pecorino Romano\n100g Parmigiano-Reggiano\nBlack pepper\nSalt",
        "instructions": "1. Bring a large pot of salted water to boil\n2. Cook spaghetti according to package instructions\n3. While pasta cooks, whisk eggs and cheese\n4. Cook pancetta until crispy\n5. Combine hot pasta with egg mixture\n6. Add pancetta and plenty of black pepper",
        "cooking_time": 30
    },
    {
        "title": "Homemade Pizza",
        "description": "A delicious homemade pizza with a crispy crust and your favorite toppings.",
        "ingredients": "Pizza dough\nTomato sauce\nMozzarella cheese\nBasil\nOlive oil\nYour choice of toppings",
        "instructions": "1. Preheat oven to 450°F\n2. Roll out pizza dough\n3. Spread sauce and add toppings\n4. Bake for 15-20 minutes\n5. Let cool slightly before slicing",
        "cooking_time": 45
    }
]

COMMENTS = [
    "Great recipe! Will definitely make it again!",
    "My family loved this!",
    "Simple and delicious.",
    "Made some modifications but turned out great!",
    "Perfect for weeknight dinner."
]

def create_users():
    """Create admin and test users if they don't exist"""
    debug_print("\nCreating users...")
    users = []
    
    try:
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='12345'
            )
            debug_print("Created admin user")
        else:
            admin = User.objects.get(username='admin')
            debug_print("Admin user already exists")
        users.append(admin)

        # Create test users
        for i in range(1, 4):
            username = f'testuser{i}'
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=f'{username}@example.com',
                    password=f'TestPass{i}123!'
                )
                debug_print(f"Created {username}")
            else:
                user = User.objects.get(username=username)
                debug_print(f"{username} already exists")
            users.append(user)

        return users
    except Exception as e:
        debug_print(f"Error creating users: {str(e)}")
        raise

def create_recipe(template, author, created_at):
    """Create a single recipe"""
    try:
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
        debug_print(f"Created recipe: {recipe.title}")
        return recipe
    except Exception as e:
        debug_print(f"Error creating recipe: {str(e)}")
        raise

def create_comments(recipe, users, base_date):
    """Create comments for a recipe"""
    try:
        for i, user in enumerate(users):
            comment_date = base_date + timedelta(hours=i+1)
            comment = Comment.objects.create(
                recipe=recipe,
                author=user,
                content=random.choice(COMMENTS),
                created_at=comment_date,
                updated_at=comment_date
            )
            debug_print(f"Created comment by {user.username} on {recipe.title}")
    except Exception as e:
        debug_print(f"Error creating comments: {str(e)}")
        raise

def create_ratings(recipe, users, base_date):
    """Create difficulty ratings for a recipe"""
    try:
        for i, user in enumerate(users):
            rating_date = base_date + timedelta(hours=i+1)
            rating = DifficultyRating.objects.create(
                recipe=recipe,
                rating_author=user,
                rating=random.randint(1, 5),
                created_at=rating_date,
                updated_at=rating_date
            )
            debug_print(f"Created rating by {user.username} for {recipe.title}")
    except Exception as e:
        debug_print(f"Error creating ratings: {str(e)}")
        raise

@transaction.atomic
def main():
    """Main function to generate sample data"""
    try:
        debug_print("\nStarting sample data generation...")
        debug_print("=" * 50)

        # Create users
        users = create_users()
        debug_print(f"\nCreated {len(users)} users successfully")

        # Create recipes
        base_date = timezone.now() - timedelta(days=30)
        
        for i, template in enumerate(RECIPE_TEMPLATES):
            debug_print(f"\nProcessing recipe {i+1}/{len(RECIPE_TEMPLATES)}")
            
            # Rotate through authors
            author = users[i % len(users)]
            recipe_date = base_date + timedelta(days=i)
            
            # Create recipe and related data
            recipe = create_recipe(template, author, recipe_date)
            create_comments(recipe, users, recipe_date)
            create_ratings(recipe, users, recipe_date)
            
            debug_print(f"Completed setup for: {recipe.title}")

        # Print final statistics
        debug_print("\n" + "=" * 50)
        debug_print("Sample data generation complete!")
        debug_print(f"Created {Recipe.objects.count()} recipes")
        debug_print(f"Created {Comment.objects.count()} comments")
        debug_print(f"Created {DifficultyRating.objects.count()} ratings")
        debug_print("=" * 50)

    except Exception as e:
        debug_print(f"\nERROR: Sample data generation failed: {str(e)}")
        raise

if __name__ == "__main__":
    main()