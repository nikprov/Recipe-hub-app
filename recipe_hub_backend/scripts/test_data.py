"""
Simple test script to verify Django data creation
"""

import os
import sys
import django

# Immediately print a message to verify script is running
print("Script starting...", flush=True)

# Setup Django
print("Setting up Django...", flush=True)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recipe_hub_backend.settings')
django.setup()

# Import our models
print("Importing models...", flush=True)
from django.contrib.auth.models import User
from recipes.models import Recipe

def create_test_data():
    print("\nCreating test data...")
    
    # Create a test user
    username = "testuser_new"
    try:
        if User.objects.filter(username=username).exists():
            print(f"User {username} already exists")
            user = User.objects.get(username=username)
        else:
            user = User.objects.create_user(
                username=username,
                email="testuser_new@example.com",
                password="TestPass123!"
            )
            print(f"Created new user: {username}")
            
        # Create a test recipe
        recipe_title = "Test Recipe 123"
        if Recipe.objects.filter(title=recipe_title).exists():
            print(f"Recipe '{recipe_title}' already exists")
        else:
            recipe = Recipe.objects.create(
                title=recipe_title,
                description="A test recipe description",
                ingredients="Test ingredient 1\nTest ingredient 2",
                instructions="1. Test step 1\n2. Test step 2",
                cooking_time=30,
                author=user
            )
            print(f"Created new recipe: {recipe_title}")
            
        # Print current counts
        print("\nCurrent database counts:")
        print(f"Users: {User.objects.count()}")
        print(f"Recipes: {Recipe.objects.count()}")
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise

if __name__ == "__main__":
    create_test_data()
    print("\nScript completed!")