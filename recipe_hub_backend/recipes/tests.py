# recipe_hub_backend/recipes/tests.py

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from recipes.models import Recipe, Comment, DifficultyRating
from rest_framework_simplejwt.tokens import RefreshToken
from django.test import override_settings
from django.core.cache import cache


TEST_THROTTLE_SETTINGS = {
    'DEFAULT_THROTTLE_CLASSES': [
        'recipes.api.throttling.RecipeUserThrottle',
        'recipes.api.throttling.RecipeAnonThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'user': '5/minute',
        'anon': '3/minute',
    }
}

@override_settings(
    REST_FRAMEWORK=TEST_THROTTLE_SETTINGS,
    # Use local memory cache for testing
    CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }
)


class BaseTestCase(APITestCase):
    """
    Base test case that provides common setup and utility methods for all test classes.
    This includes user creation, authentication, and common test data.
    """
    def setUp(self):
        # Create three types of users for testing different permission scenarios
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='AdminPass123!'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='OtherPass123!'
        )
        
        # Define reusable test data
        self.valid_recipe_data = {
            'title': 'Test Recipe',
            'description': 'A test recipe description',
            'ingredients': 'Ingredient 1\nIngredient 2',
            'instructions': 'Step 1\nStep 2',
            'cooking_time': 30
        }
        
        self.valid_comment_data = {
            'content': 'This is a test comment'
        }

    def get_tokens_for_user(self, user):
        """Helper method to generate JWT tokens for a user"""
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    def authenticate_user(self, user):
        """Helper method to authenticate requests with JWT token"""
        tokens = self.get_tokens_for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')

class AuthenticationTests(BaseTestCase):
    """Tests for user authentication and registration functionality"""

    def test_user_registration_success(self):
        """Test successful user registration with valid data"""
        url = reverse('registration')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password1': 'NewPass123!',
            'password2': 'NewPass123!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_registration_duplicate_email(self):
        """Test that registration fails when using an existing email"""
        url = reverse('registration')
        data = {
            'username': 'differentuser',
            'email': 'test@example.com',  # Already used in setUp
            'password1': 'NewPass123!',
            'password2': 'NewPass123!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_user_info_authenticated(self):
        """Test accessing user info endpoint when authenticated"""
        self.authenticate_user(self.user)
        url = reverse('user-info')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)
        self.assertFalse(response.data['is_staff'])

    def test_get_user_info_unauthenticated(self):
        """Test that unauthenticated users cannot access user info"""
        url = reverse('user-info')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class RecipeTests(BaseTestCase):
    """Tests for recipe-related functionality using router-based URLs"""

    def setUp(self):
        super().setUp()
        # Create a test recipe
        self.recipe = Recipe.objects.create(
            author=self.user,
            **self.valid_recipe_data
        )

    def test_list_recipes(self):
        """Test that anyone can list recipes"""
        url = reverse('recipe-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that we're getting paginated results
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)

    def test_recipe_ordering(self):
        """Test that recipes are returned in the correct order"""
        Recipe.objects.create(
            author=self.user,
            title='Another Recipe',
            description='Another description',
            ingredients='Ingredients',
            instructions='Instructions',
            cooking_time=25
        )
        
        url = reverse('recipe-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 2)
        # Verify ordering by most recent first
        self.assertEqual(response.data['results'][0]['title'], 'Another Recipe')

    def test_create_recipe_authenticated(self):
        """Test recipe creation by authenticated user"""
        self.authenticate_user(self.user)
        url = reverse('recipe-list')
        response = self.client.post(url, self.valid_recipe_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Recipe.objects.count(), 2)
        self.assertEqual(response.data['author']['username'], self.user.username)

    def test_create_recipe_unauthenticated(self):
        """Test that unauthenticated users cannot create recipes"""
        url = reverse('recipe-list')
        response = self.client.post(url, self.valid_recipe_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_recipe_author(self):
        """Test that recipe authors can update their recipes"""
        self.authenticate_user(self.user)
        url = reverse('recipe-detail', args=[self.recipe.id])
        updated_data = {**self.valid_recipe_data, 'title': 'Updated Recipe'}
        response = self.client.put(url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Recipe')

    def test_update_recipe_non_author(self):
        """Test that non-authors cannot update recipes"""
        self.authenticate_user(self.other_user)
        url = reverse('recipe-detail', args=[self.recipe.id])
        updated_data = {**self.valid_recipe_data, 'title': 'Unauthorized Update'}
        response = self.client.put(url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class CommentTests(BaseTestCase):
    """Tests for comment-related functionality using nested router URLs"""

    def setUp(self):
        super().setUp()
        # Create a test recipe and comment
        self.recipe = Recipe.objects.create(
            author=self.user,
            **self.valid_recipe_data
        )
        self.comment = Comment.objects.create(
            recipe=self.recipe,
            author=self.user,
            content=self.valid_comment_data['content']
        )

    def test_list_comments(self):
        """Test listing comments for a recipe"""
        url = reverse('recipe-comments-list', kwargs={'recipe_pk': self.recipe.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_comment_authenticated(self):
        """Test comment creation by authenticated user"""
        self.authenticate_user(self.other_user)
        url = reverse('recipe-comments-list', kwargs={'recipe_pk': self.recipe.id})
        response = self.client.post(url, self.valid_comment_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 2)

    def test_create_comment_unauthenticated(self):
        """Test that unauthenticated users cannot create comments"""
        url = reverse('recipe-comments-list', kwargs={'recipe_pk': self.recipe.id})
        response = self.client.post(url, self.valid_comment_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_comment_author(self):
        """Test that comment authors can update their comments"""
        self.authenticate_user(self.user)
        url = reverse('recipe-comments-detail',
                     kwargs={'recipe_pk': self.recipe.id, 'pk': self.comment.id})
        updated_data = {'content': 'Updated comment'}
        response = self.client.put(url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], 'Updated comment')

    def test_delete_comment_admin(self):
        """Test that admins can delete any comment"""
        self.authenticate_user(self.admin_user)
        url = reverse('recipe-comments-detail',
                     kwargs={'recipe_pk': self.recipe.id, 'pk': self.comment.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Comment.objects.count(), 0)


class RecipeDetailTests(BaseTestCase):
    """Tests for detailed recipe functionality"""

    def setUp(self):
        super().setUp()
        self.recipe = Recipe.objects.create(
            author=self.user,
            **self.valid_recipe_data
        )

    def test_recipe_ordering(self):
        """Test that recipes are returned in the correct order"""
        Recipe.objects.create(
            author=self.user,
            title='Another Recipe',
            description='Another description',
            ingredients='Ingredients',
            instructions='Instructions',
            cooking_time=25
        )
        
        url = reverse('recipe-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        # Verify ordering by most recent first
        self.assertEqual(response.data[0]['title'], 'Another Recipe')

    def test_recipe_invalid_cooking_time_zero(self):
        """Test that recipe creation fails with zero cooking time"""
        self.authenticate_user(self.user)
        invalid_data = {**self.valid_recipe_data, 'cooking_time': 0}
        url = reverse('recipe-list')
        response = self.client.post(url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cooking_time', response.data)

    def test_recipe_invalid_cooking_time_negative(self):
        """Test that recipe creation fails with negative cooking time"""
        self.authenticate_user(self.user)
        invalid_data = {**self.valid_recipe_data, 'cooking_time': -30}
        url = reverse('recipe-list')
        response = self.client.post(url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cooking_time', response.data)

class CommentValidationTests(BaseTestCase):
    """Tests for comment validation and edge cases"""

    def setUp(self):
        super().setUp()
        self.recipe = Recipe.objects.create(
            author=self.user,
            **self.valid_recipe_data
        )

    def test_empty_comment_content(self):
        """Test that comments cannot be empty"""
        self.authenticate_user(self.user)
        url = reverse('recipe-comments-list', kwargs={'recipe_pk': self.recipe.id})
        invalid_data = {'content': ''}
        response = self.client.post(url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('content', response.data)

    def test_comment_on_nonexistent_recipe(self):
        """Test commenting on a non-existent recipe returns 404"""
        self.authenticate_user(self.user)
        url = reverse('recipe-comments-list', kwargs={'recipe_pk': 99999})
        response = self.client.post(url, self.valid_comment_data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_nested_comment_listing(self):
        """Test that comments are properly listed with recipe details"""
        self.authenticate_user(self.user)
        # Create multiple comments
        for i in range(3):
            Comment.objects.create(
                recipe=self.recipe,
                author=self.user,
                content=f'Test comment {i}'
            )
        
        # Get recipe details
        url = reverse('recipe-detail', args=[self.recipe.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['comments']), 3)
        self.assertEqual(response.data['comment_count'], 3)

class UserAuthenticationFlowTests(BaseTestCase):
    """Tests for complete user authentication flows"""

    def test_user_info_endpoint(self):
        """Test the user info endpoint returns correct data"""
        self.authenticate_user(self.user)
        url = reverse('user-info')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)
        self.assertEqual(response.data['is_staff'], False)

    def test_admin_info_endpoint(self):
        """Test the user info endpoint for admin users"""
        self.authenticate_user(self.admin_user)
        url = reverse('user-info')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.admin_user.username)
        self.assertEqual(response.data['is_staff'], True)

    def test_registration_password_validation(self):
        """Test comprehensive password validation during registration"""
        url = reverse('registration')
        test_cases = [
            {
                'data': {
                    'username': 'testuser1',
                    'email': 'test1@example.com',
                    'password1': 'short1',
                    'password2': 'short1'
                },
                'expected_error': 'must be at least 5 characters long'
            },
            {
                'data': {
                    'username': 'testuser2',
                    'email': 'test2@example.com',
                    'password1': 'nocapitalletter1',
                    'password2': 'nocapitalletter1'
                },
                'expected_error': 'must contain at least one uppercase letter'
            },
            {
                'data': {
                    'username': 'testuser3',
                    'email': 'test3@example.com',
                    'password1': 'NoNumbers',
                    'password2': 'NoNumbers'
                },
                'expected_error': 'must contain at least one number'
            }
        ]
        
        for test_case in test_cases:
            response = self.client.post(url, test_case['data'])
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            
            # Improved error checking
            error_messages = []
            for field_errors in response.data.values():
                if isinstance(field_errors, list):
                    error_messages.extend(str(error).lower() for error in field_errors)
                else:
                    error_messages.append(str(field_errors).lower())
                    
            self.assertTrue(
                any(test_case['expected_error'] in error_msg 
                    for error_msg in error_messages),
                f"Expected error containing '{test_case['expected_error']}' "
                f"but got error messages: {error_messages}"
            )

class RatingTests(BaseTestCase):
    """Tests for recipe difficulty rating functionality"""

    def setUp(self):
        super().setUp()
        # Create a test recipe
        self.recipe = Recipe.objects.create(
            author=self.user,
            **self.valid_recipe_data
        )
        # Define valid rating data
        self.valid_rating_data = {
            'rating': 4
        }

    def test_create_rating_authenticated(self):
        """Test that authenticated users can create ratings"""
        self.authenticate_user(self.other_user)
        url = reverse('recipe-difficulty-ratings-list', kwargs={'recipe_pk': self.recipe.id})
        response = self.client.post(url, self.valid_rating_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DifficultyRating.objects.count(), 1)
        self.assertEqual(DifficultyRating.objects.first().rating, 4)

    def test_create_rating_unauthenticated(self):
        """Test that unauthenticated users cannot create ratings"""
        url = reverse('recipe-difficulty-ratings-list', kwargs={'recipe_pk': self.recipe.id})
        response = self.client.post(url, self.valid_rating_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_duplicate_rating_same_user(self):
        """Test proper handling of duplicate ratings"""
        self.authenticate_user(self.other_user)
        url = reverse('recipe-difficulty-ratings-list', 
                    kwargs={'recipe_pk': self.recipe.id})
        
        # First rating succeeds
        response1 = self.client.post(url, self.valid_rating_data)
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Second rating attempt fails with helpful message
        response2 = self.client.post(url, {'rating': 5})
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('You have already given a difficulty rating', 
                    str(response2.data['detail']))
        
        # Update rating succeeds
        rating_id = response1.data['id']
        update_url = reverse('recipe-difficulty-ratings-detail',
                            kwargs={'recipe_pk': self.recipe.id, 
                                'pk': rating_id})
        response3 = self.client.put(update_url, {'rating': 5})
        self.assertEqual(response3.status_code, status.HTTP_200_OK)
        self.assertEqual(response3.data['rating'], 5)
  
    def test_invalid_rating_values(self):
        """Test that invalid rating values are rejected"""
        self.authenticate_user(self.other_user)
        url = reverse('recipe-difficulty-ratings-list', kwargs={'recipe_pk': self.recipe.id})
        
        invalid_ratings = [0, 6, -1, 2.5]  # Test various invalid values
        for rating in invalid_ratings:
            response = self.client.post(url, {'rating': rating})
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_average_rating_calculation(self):
        """Test that average rating is calculated correctly"""
        # Create multiple ratings from different users
        users_ratings = [
            (self.user, 4),
            (self.other_user, 2),
            (self.admin_user, 5)
        ]
        
        for user, rating in users_ratings:
            DifficultyRating.objects.create(
                recipe=self.recipe,
                rating_author=user,
                rating=rating
            )
        
        # Get recipe details
        url = reverse('recipe-detail', args=[self.recipe.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Average should be (4 + 2 + 5) / 3 = 3.67
        self.assertAlmostEqual(float(response.data['average_difficulty']), 3.67, places=2)

    def test_user_specific_rating(self):
        """Test that user can see their own rating for a recipe"""
        # Create ratings for different users
        DifficultyRating.objects.create(
            recipe=self.recipe,
            rating_author=self.other_user,
            rating=2
        )
        DifficultyRating.objects.create(
            recipe=self.recipe,
            rating_author=self.user,
            rating=4
        )
        
        # Check as authenticated user
        self.authenticate_user(self.user)
        url = reverse('recipe-detail', args=[self.recipe.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user_rating'], 4)

class ThrottlingTests(BaseTestCase):
    def setUp(self):
        super().setUp()
        # Clear the cache before each test
        cache.clear()
        self.recipe = Recipe.objects.create(
            author=self.user,
            **self.valid_recipe_data
        )
        self.list_url = reverse('recipe-list')
        self.rating_url = reverse('recipe-difficulty-ratings-list', 
                                kwargs={'recipe_pk': self.recipe.id})

    def test_anonymous_user_throttling(self):
        """Test that anonymous users are throttled after exceeding rate limit"""
        # Make requests up to the limit
        for i in range(3):
            response = self.client.get(self.list_url)
            self.assertEqual(response.status_code, status.HTTP_200_OK,
                           f"Request {i+1} should succeed")
        
        # This request should be throttled
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS,
                        "Should be throttled after exceeding limit")

    def test_authenticated_user_throttling(self):
        """Test that authenticated users are throttled after exceeding rate limit"""
        self.authenticate_user(self.user)
        
        # Make requests up to the limit
        for i in range(5):
            response = self.client.get(self.list_url)
            self.assertEqual(response.status_code, status.HTTP_200_OK,
                           f"Request {i+1} should succeed")
        
        # This request should be throttled
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS,
                        "Should be throttled after exceeding limit")

    def test_throttling_different_endpoints(self):
        """Test that throttling applies across different endpoints"""
        self.authenticate_user(self.user)
        
        # Make alternating requests until we hit the limit
        for i in range(3):
            # Each iteration makes 2 requests
            response1 = self.client.get(self.list_url)
            self.assertEqual(response1.status_code, status.HTTP_200_OK,
                           f"List request {i+1} should succeed")
            
            response2 = self.client.get(self.rating_url)
            self.assertEqual(response2.status_code, status.HTTP_200_OK,
                           f"Rating request {i+1} should succeed")
        
        # Should be throttled after 6 total requests (over the 5/minute limit)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS,
                        "Should be throttled after exceeding combined limit")