# recipe_hub_backend/recipes/api/urls.py

from django.urls import path, include
from rest_framework_nested import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import (
    RecipeViewSet,
    CommentViewSet,
    CustomRegisterView,
    DifficultyRatingViewSet,
    get_user_info
)

router = DefaultRouter()
router.register(r'recipes', RecipeViewSet, basename='recipe')
# Nested router for comments
comments_router = routers.NestedDefaultRouter(router, r'recipes', lookup='recipe')
comments_router.register(r'comments', CommentViewSet, basename='recipe-comments')
# Nested router for difficulty ratings
difficultyratings_router = routers.NestedDefaultRouter(router, r'recipes', lookup='recipe')
difficultyratings_router.register(r'difficulty-ratings', DifficultyRatingViewSet, basename='recipe-difficulty-ratings')



urlpatterns = [
    # Authentication endpoints
    path('auth/registration/', CustomRegisterView.as_view(), name='registration'),
    path('auth/user/', get_user_info, name='user-info'),
    path('', include(router.urls)),
    path('', include(comments_router.urls)),
    path('', include(difficultyratings_router.urls)), 
]