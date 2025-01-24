# recipe_hub_backend\recipes\api\views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from ..models import Recipe, Comment, DifficultyRating
from .serializers import RecipeSerializer, CommentSerializer, UserRegistrationSerializer, DifficultyRatingSerializer, UserSerializer
from .permissions import IsAuthorOrReadOnly, IsNotAuthenticated, IsAdminUserOrReadOnly
from dj_rest_auth.registration.views import RegisterView
from rest_framework_simplejwt.authentication import JWTAuthentication
from .pagination import SmallSetPagination
from .throttling import RecipeUserThrottle, RecipeAnonThrottle
from django.db.models import Avg
from drf_spectacular.utils import (
    extend_schema, 
    extend_schema_view,
    extend_schema_serializer,
    OpenApiParameter,
    OpenApiExample,
    OpenApiResponse
)
from drf_spectacular.types import OpenApiTypes

@extend_schema_view(
    post=extend_schema(
        summary="Register new user",
        description="Register a new user. Available for unauthenticated users and admins only.",
        responses={
            201: UserRegistrationSerializer,
            400: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT
        },
        tags=['authentication']
    ),
    get=extend_schema(
        summary="Get registration info",
        description="Returns registration form field information",
        tags=['authentication']
    )
)
class CustomRegisterView(RegisterView):
    """
    Custom registration view that combines authentication checks with registration logic.
    Allows:
    - Unauthenticated users to register
    - Admin users to create new users
    - Prevents authenticated non-admin users from registering
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [(IsNotAuthenticated | IsAdminUserOrReadOnly)]
    throttle_classes = [RecipeUserThrottle, RecipeAnonThrottle]

    def get(self, request, *args, **kwargs):
        """Handle GET requests by returning registration form information"""
        return Response({
            "message": "Please use POST method to register",
            "required_fields": {
                "username": "string",
                "email": "string",
                "password1": "string",
                "password2": "string"
            }
        })

    def post(self, request, *args, **kwargs):
        """
        Handle POST requests for registration with authentication checks.
        This method combines our custom authentication check with the parent class's
        registration logic.
        """
        # First, check if user is authenticated but not staff
        if request.user.is_authenticated and not request.user.is_staff:
            return Response(
                {"detail": "You are already authenticated. Please log out to register a new account."},
                status=status.HTTP_403_FORBIDDEN
            )

        # If authentication check passes, proceed with registration
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use the serializer's create method directly
            user = serializer.save()
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            self.get_serializer(user).data,
            status=status.HTTP_201_CREATED
        )

    def perform_create(self, serializer):
        """
        Override perform_create to handle the serializer save correctly.
        This method is called by the parent RegisterView class.
        """
        return serializer.save()

@extend_schema(
    summary="Get current user info",
    description="Get information about the currently authenticated user",
    responses={200: UserSerializer},
    tags=['authentication']
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_info(request):
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'is_staff': request.user.is_staff,
    })

@extend_schema_view(
    list=extend_schema(
        summary="List recipes",
        parameters=[
            OpenApiParameter("page", OpenApiTypes.INT, location=OpenApiParameter.QUERY)
        ],
        tags=['recipes']
    ),
    create=extend_schema(
        summary="Create recipe",
        description="Create a new recipe. Authentication required.",
        tags=['recipes']
    ),
    retrieve=extend_schema(
        summary="Get recipe details",
        tags=['recipes']
    ),
    update=extend_schema(
        summary="Update recipe",
        description="Update a recipe. Only available to recipe author.",
        tags=['recipes']
    ),
    destroy=extend_schema(
        summary="Delete recipe",
        description="Delete a recipe. Available to recipe author and admins.",
        tags=['recipes']
    )
)
class RecipeViewSet(viewsets.ModelViewSet):
    
    serializer_class = RecipeSerializer
    pagination_class = SmallSetPagination
    throttle_classes = [RecipeUserThrottle, RecipeAnonThrottle]

    def get_queryset(self):
        """
        Get all recipes with:
        1. Calculated average difficulty rating
        2. Author information (select_related for ForeignKey)
        3. Prefetched difficulty ratings (prefetch_related for reverse relation)
        4. Ordered by creation date (newest first)
        """
        return Recipe.objects.annotate(
            # Calculate average rating for each recipe
            average_difficulty=Avg('difficulty_ratings__rating')
        ).select_related(
            # Efficiently load author information
            'author'
        ).prefetch_related(
            # Efficiently load all difficulty ratings
            'difficulty_ratings'
        ).order_by(
            # Show newest recipes first
            '-created_at'
        )
    
    def get_permissions(self):
        """
        List/Retrieve: anyone can access
        Create: authenticated users
        Update/Delete: author or admin
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

@extend_schema_view(
    list=extend_schema(
        summary="List recipe comments",
        tags=['comments']
    ),
    create=extend_schema(
        summary="Add comment",
        description="Add a comment to a recipe. Authentication required.",
        tags=['comments']
    ),
    update=extend_schema(
        summary="Update comment",
        description="Update a comment. Only available to comment author.",
        tags=['comments']
    ),
    destroy=extend_schema(
        summary="Delete comment",
        description="Delete a comment. Available to comment author and admins.",
        tags=['comments']
    )
)
class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    throttle_classes = [RecipeUserThrottle, RecipeAnonThrottle]
    
    def get_queryset(self):
        recipe_pk = self.kwargs.get('recipe_pk')
        return Comment.objects.filter(recipe_id=recipe_pk).select_related('author', 'recipe')
    
    def perform_create(self, serializer):
        recipe_pk = self.kwargs.get('recipe_pk')
        recipe = get_object_or_404(Recipe, pk=recipe_pk)
        
        serializer.save(
            author=self.request.user,
            recipe=recipe
        )

@extend_schema_view(
    list=extend_schema(
        summary="List recipe ratings",
        tags=['ratings']
    ),
    create=extend_schema(
        summary="Rate recipe",
        description="Add difficulty rating to recipe. One rating per user per recipe.",
        tags=['ratings']
    ),
    update=extend_schema(
        summary="Update rating",
        description="Update your rating for a recipe.",
        tags=['ratings']
    ),
    destroy=extend_schema(
        summary="Delete rating",
        description="Delete a rating. Available to rating author and admins.",
        tags=['ratings']
    )
)
class DifficultyRatingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing recipe difficulty ratings.
    Ensures each user can only rate a recipe once but can update their rating.
    """
    serializer_class = DifficultyRatingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    throttle_classes = [RecipeUserThrottle, RecipeAnonThrottle]
    
    def get_queryset(self):
        """Get all ratings for a specific recipe with efficient joins"""
        recipe_pk = self.kwargs.get('recipe_pk')
        return DifficultyRating.objects.filter(
            recipe_id=recipe_pk
        ).select_related('rating_author', 'recipe')
    
    def perform_create(self, serializer):
        """
        Create a new rating, ensuring one rating per user per recipe.
        If user has already rated, raises ValidationError with helpful message.
        """
        recipe_pk = self.kwargs.get('recipe_pk')
        recipe = get_object_or_404(Recipe, pk=recipe_pk)
        
        # Check for existing rating
        if DifficultyRating.objects.filter(
            recipe=recipe,
            rating_author=self.request.user
        ).exists():
            raise ValidationError({
                "detail": "You have already given a difficulty rating for this recipe. If you want to change your rating, update it."
            })
            
        # Create new rating
        serializer.save(
            rating_author=self.request.user,
            recipe=recipe
        )
    
    def perform_update(self, serializer):
        """Update existing rating, maintaining data consistency"""
        serializer.save()
