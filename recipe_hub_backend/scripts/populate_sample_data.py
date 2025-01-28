#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

# Get the project root directory (one level up from the script location)
project_root = Path(__file__).resolve().parent.parent

# Add the project root to Python path
sys.path.append(str(project_root))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recipe_hub_backend.settings')
django.setup()

from django.core.management import call_command
from django.core.management.base import CommandError

def populate_database():
    """Load sample data from fixture file"""
    try:
        print('Loading sample data from fixture...')
        
        # Check if fixture exists
        fixture_path = project_root / 'recipes' / 'fixtures' / 'recipe_hub_sample_data.json'
        
        if not fixture_path.exists():
            raise CommandError(
                'Fixture file not found! '
                'Make sure recipe_hub_sample_data.json exists in recipes/fixtures directory.'
            )
        
        # Load the fixture
        call_command('loaddata', 'recipe_hub_sample_data', verbosity=1)
        print('Successfully loaded sample data!')
        
    except Exception as e:
        print(f'Error: Failed to load fixture: {str(e)}')
        return False
        
    return True

if __name__ == '__main__':
    success = populate_database()
    exit(0 if success else 1)