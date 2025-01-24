# recipe_hub_backend\recipes\api\serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from ..models import Recipe, Comment, DifficultyRating
from django.contrib.auth.password_validation import validate_password
from django.core.validators import EmailValidator
from drf_spectacular.utils import (
    extend_schema, 
    extend_schema_view,
    extend_schema_serializer,
    OpenApiParameter,
    OpenApiExample,
    OpenApiResponse
)
from drf_spectacular.types import OpenApiTypes

@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Valid Registration',
            value={
                'username': 'newuser',
                'email': 'user@example.com',
                'password1': 'StrongPass123',
                'password2': 'StrongPass123'
            }
        )
    ]
)
class UserRegistrationSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, style={'input_type': 'password'})
    email = serializers.EmailField(
        validators=[EmailValidator()],
        required=True,
        help_text='Required. Must be unique.'
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')
        extra_kwargs = {
            'email': {'required': True, 'allow_blank': False}
        }

    def validate_email(self, value):
        """Validate email uniqueness"""
        normalized_email = value.lower()  # Normalize email to lowercase
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized_email

    def validate(self, data):
        """Validate password requirements"""
        if data['password1'] != data['password2']:
            raise serializers.ValidationError({
                "password": "The two password fields didn't match."
            })

        password = data['password1']
        # Password strength validation
        if len(password) < 5:
            raise serializers.ValidationError({
                "password": "Password must be at least 5 characters long"
            })
        if not any(char.isdigit() for char in password):
            raise serializers.ValidationError({
                "password": "Password must contain at least one number"
            })
        if not any(char.isupper() for char in password):
            raise serializers.ValidationError({
                "password": "Password must contain at least one uppercase letter"
            })

        return data

    def save(self, **kwargs):
        """
        Create and save a new User instance using the validated data.
        This method handles both standard registration and admin user creation.
        """
        validated_data = {
            'username': self.validated_data['username'],
            'email': self.validated_data['email'],
            'password': self.validated_data['password1']
        }
        
        user = User.objects.create_user(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    We only expose non-sensitive user information.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ('id', 'recipe', 'author', 'content', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at', 'author', 'recipe')

@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Recipe Example',
            value={
                'title': 'Pizza Margherita',
                'description': 'Classic Italian pizza',
                'ingredients': 'Dough, tomatoes, mozzarella, basil',
                'instructions': '1. Prepare dough\n2. Add toppings\n3. Bake',
                'cooking_time': 45
            }
        )
    ]
)
class RecipeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Recipe model.
    Includes the author information through UserSerializer.
    """
    # Nest the author's information in the recipe data
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()
    average_difficulty = serializers.FloatField(read_only=True)
    user_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = (
            'id', 
            'title', 
            'description', 
            'ingredients', 
            'instructions', 
            'cooking_time',
            'created_at',
            'updated_at',
            'author',
            'comments',
            'comment_count',
            'average_difficulty',
            'user_rating'
        )
        read_only_fields = ('created_at', 'updated_at', 'author', 'average_difficulty')

    def get_comment_count(self, obj):
        return obj.comments.count()

    def validate_cooking_time(self, value):
        """
        Validate that cooking time is positive.
        """
        if value <= 0:
            raise serializers.ValidationError("Cooking time must be positive")
        return value
    
    def get_user_rating(self, obj):
        """Get the current user's rating for this recipe if it exists"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                rating = obj.difficulty_ratings.get(rating_author=request.user)
                return rating.rating
            except DifficultyRating.DoesNotExist:
                return None
        return None
    
class DifficultyRatingSerializer(serializers.ModelSerializer):
    rating_author = UserSerializer(read_only=True)
    
    class Meta:
        model = DifficultyRating
        fields = ('id', 'rating', 'rating_author', 'created_at')
        read_only_fields = ('created_at', 'rating_author')

    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if not (1 <= value <= 5):
            raise serializers.ValidationError(
                "Rating must be between 1 and 5"
            )
        return value

    

