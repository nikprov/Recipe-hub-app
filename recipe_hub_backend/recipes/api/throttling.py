# recipes/api/throttling.py

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class RecipeUserThrottle(UserRateThrottle):
    scope = 'user'
    rate = '150/minute'  # Authenticated users can make 150 requests per minute

class RecipeAnonThrottle(AnonRateThrottle):
    scope = 'anon'
    rate = '60/minute'  # Anonymous users can make 60 requests per minute