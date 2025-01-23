# recipe_hub_backend\recipes\urls.py

from django.urls import path, include

urlpatterns = [
    path('api/', include('recipes.api.urls')),
]